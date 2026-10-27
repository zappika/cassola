import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {conversationHistory,turnContext,sentReply,makeSubmission} from '../app/conversation.mjs';
import {freshProgress,newSession,makeDraft,saveDraft,finishExercise,readProgress,writeProgress} from '../app/progress.mjs';
import {supportedExercises} from '../app/engine.mjs';
const lesson=JSON.parse(readFileSync(new URL('../content/walking-in.v2.json',import.meta.url))),exercises=supportedExercises(lesson);
test('send commits reply and completion together; reload retains transcript exactly once',()=>{
 const e=exercises[0],picked=e.options[0].id;
 const submission=makeSubmission(e,{picked,chunks:[],answer:'',assisted:false,result:{outcome:'communicated',missing_details:[]}},100);
 let p={...freshProgress(lesson),session:newSession()};const draft={...makeDraft(e,e.options),picked,submissions:[submission]};
 p=finishExercise(saveDraft(p,draft),{id:e.id,outcome:'communicated',assisted:false},lesson);
 let saved;const storage={setItem:(k,v)=>saved=v,getItem:()=>saved};writeProgress(storage,p);p=readProgress(storage,lesson).progress;
 assert.equal(conversationHistory(lesson,p)[0].submissions.length,1);assert.equal(p.evidence.submissions,1);
 assert.equal(sentReply(e,submission).ca,e.options[0].text.ca);
 assert.deepEqual(finishExercise(p,{id:e.id,outcome:'communicated',assisted:false},lesson),p);
});
test('only current run appears; no invented replies for older missing history',()=>{
 const p=freshProgress(lesson);p.evidence.records=[{id:exercises[0].id,submissions:[{input:'old'}]}];p.session=newSession();assert.deepEqual(conversationHistory(lesson,p),[]);
 p.session.finished=[{id:exercises[1].id}];assert.deepEqual(conversationHistory(lesson,p)[0].submissions,[]);
});
test('scene transitions and repeated staff prompts use authored context',()=>{
 assert.ok(turnContext(lesson,exercises[0]).scene);
 assert.equal(turnContext(lesson,exercises[1],exercises[0]).scene,null);assert.equal(turnContext(lesson,exercises[1],exercises[0]).staff,false);
 assert.ok(turnContext(lesson,exercises[3],exercises[2]).scene);
});
test('typed retries keep their literal reply; chunk sends retain translated order',()=>{
 const typed=exercises.find(e=>e.type==='type');const s=makeSubmission(typed,{answer:'Som dos.',chunks:[],assisted:true,result:{outcome:'needs_information',missing_details:['availability_request']}},100);
 assert.deepEqual(sentReply(typed,s),{ca:'Som dos.',en:''});assert.deepEqual(s.missing,['availability_request']);
 const built=exercises.find(e=>e.type==='build');const b=makeSubmission(built,{chunks:['name-prefix','name-marti'],assisted:false,result:{outcome:'communicated',missing_details:[]}},101);
 assert.deepEqual(sentReply(built,b),{ca:'A nom de Martí',en:'Under the name of Martí'});
});
