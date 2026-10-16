import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PROGRESS_KEY,freshProgress,newSession,makeDraft,readProgress,writeProgress,resetProgress,saveDraft,finishExercise,progressSummary} from '../app/progress.mjs';
import {supportedExercises} from '../app/engine.mjs';
const lesson=JSON.parse(readFileSync(new URL('../content/walking-in.v2.json',import.meta.url)));
const exercises=supportedExercises(lesson);
function memory(){const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};}
function start(){return {...freshProgress(lesson),session:newSession()};}
function submit(p,e,outcome='communicated',at=100){const draft=makeDraft(e,e.options||e.chunks||[]);draft.submissions=[{outcome,at,input:'Test answer',assisted:false}];draft.answer='Test answer';return saveDraft(p,draft,at);}
function finish(p,e,outcome='communicated',at=100){return finishExercise(submit(p,e,outcome,at),{id:e.id,outcome,assisted:false},lesson,at);}
test('reload preserves shuffled choices, draft, help, feedback and partial facts',()=>{
 const store=memory(),e=exercises[0];let p=start();const d=makeDraft(e,[...e.options].reverse());
 Object.assign(d,{picked:e.options[0].id,english:true,hint:true,assisted:true,previous:{party_size:2},result:{outcome:'needs_information',details:{party_size:2},missing_details:['name'],style_notes:[]},submissions:[{outcome:'needs_information',at:50,input:'Som dos',assisted:true}]});
 p=saveDraft(p,d,50);assert.equal(writeProgress(store,p),true);assert.deepEqual(readProgress(store,lesson).progress,p);
});
test('typing and chunk drafts survive reload before submission',()=>{
 for(const type of ['type','build']){const store=memory(),i=exercises.findIndex(e=>e.type===type),e=exercises[i];let p=start();for(const before of exercises.slice(0,i))p=finish(p,before);
 const d=makeDraft(e,e.chunks||[]);d.answer='Teniu una taula?';d.chunks=e.chunks?[e.chunks[0].id]:[];p=saveDraft(p,d);writeProgress(store,p);assert.deepEqual(readProgress(store,lesson).progress.session.draft,d);}
});
test('completion is idempotent and repeated runs do not inflate unique goals',()=>{
 let p=start();for(const e of exercises)p=finish(p,e);
 const again=finishExercise(p,{id:exercises.at(-1).id,outcome:'communicated',assisted:false},lesson);assert.deepEqual(again,p);
 assert.equal(p.evidence.runs,1);p={...p,session:newSession()};for(const e of exercises)p=finish(p,e);
 assert.equal(p.evidence.runs,2);assert.equal(progressSummary(p).communicated,8);assert.equal(p.evidence.records.length,16);assert.equal(p.evidence.submissions,16);assert.equal(p.evidence.status,'practised_with_help');
});
test('skip never adds communicated or independent credit; assistance and attempts retained',()=>{
 let p=start();const e=exercises[0];p=submit(p,e,'uncertain');p=finishExercise(p,{id:e.id,outcome:'skipped',assisted:true},lesson,100);
 assert.equal(p.evidence.communicated.length,0);assert.deepEqual(p.evidence.skipped,[e.id]);assert.deepEqual(p.evidence.helped,[e.id]);assert.equal(p.evidence.records[0].submissions[0].outcome,'uncertain');
 assert.equal(p.evidence.status,'practised_with_help');
 const skipped=finishExercise(start(),{id:e.id,outcome:'skipped',assisted:true},lesson,100);assert.equal(skipped.evidence.status,null);assert.equal(skipped.evidence.lastPractised,null);
});
test('24-hour revisit flag preserves prior evidence and fresh practice resets due time',()=>{
 let p=finish(start(),exercises[0],'communicated',100);const before=JSON.stringify(p.evidence);
 assert.equal(progressSummary(p,100+86400000-1).revisit,false);assert.equal(progressSummary(p,100+86400000).revisit,true);assert.equal(JSON.stringify(p.evidence),before);
 p=finish(p,exercises[1],'communicated',100+86400000);assert.equal(progressSummary(p,100+86400000).revisit,false);
});
test('content change archives prior evidence, resets current session and survives another reload',()=>{
 const store=memory(),p=finish(start(),exercises[0]);writeProgress(store,p);
 const updated={...lesson,content_version:'new-native-review'};const loaded=readProgress(store,updated);assert.match(loaded.notice,/changed/);assert.equal(loaded.progress.session,null);assert.equal(loaded.progress.evidence.communicated.length,0);assert.deepEqual(loaded.progress.previousVersions[0].evidence,p.evidence);
 writeProgress(store,loaded.progress);assert.deepEqual(readProgress(store,updated).progress,loaded.progress);
});
test('reset removes only learner key and resets all evidence',()=>{
 const store=memory();store.setItem('review-draft','keep');writeProgress(store,finish(start(),exercises[0]));const result=resetProgress(store,lesson);assert.equal(result.removed,true);assert.deepEqual(readProgress(store,lesson).progress,freshProgress(lesson));assert.equal(store.getItem('review-draft'),'keep');
});
test('malformed JSON and invalid nested session data recover without crashing',()=>{
 const store=memory();for(const raw of ['{',JSON.stringify({...start(),session:{finished:[]}}),JSON.stringify({...start(),evidence:{}}),JSON.stringify({...start(),session:{finished:[],draft:{id:exercises[0].id}}})]){store.setItem(PROGRESS_KEY,raw);const loaded=readProgress(store,lesson);assert.match(loaded.notice,/could not be read/);assert.deepEqual(loaded.progress,freshProgress(lesson));}
});
test('blocked reads, quota failures and failed reset are explicit',()=>{
 const store={getItem(){throw Error('denied');},setItem(){throw Error('quota');},removeItem(){throw Error('denied');}};
 assert.match(readProgress(store,lesson).notice,/unavailable/);assert.equal(writeProgress(store,start()),false);assert.equal(resetProgress(store,lesson).removed,false);
 const p=finish(start(),exercises[0]);assert.equal(p.evidence.communicated.length,1);
});
