import {supportedExercises} from './engine.mjs';

export const PROGRESS_KEY='cassola.walking-in.progress.v1';
const DAY=24*60*60*1000;
const outcomes=['communicated','needs_information','different_meaning','uncertain'];
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const time=x=>Number.isFinite(x)&&x>=0;
const count=x=>Number.isInteger(x)&&x>=0;
export function freshProgress(lesson){
 return {schema:1,lessonId:lesson.id,version:lesson.content_version,lastActivity:null,session:null,evidence:{runs:0,records:[],communicated:[],helped:[],skipped:[],submissions:0,lastPractised:null,status:null},previousVersions:[]};
}
export function newSession(){return {finished:[],draft:null};}
export function makeDraft(exercise,order){return {id:exercise.id,order:order.map(x=>x.id),picked:null,chunks:[],answer:'',english:false,hint:false,model:false,result:null,previous:{},assisted:false,submissions:[]};}
function validResult(r){return r===null||(object(r)&&outcomes.includes(r.outcome)&&Array.isArray(r.missing_details)&&r.missing_details.every(x=>typeof x==='string')&&object(r.details)&&Array.isArray(r.style_notes));}
function validSubmission(s){return object(s)&&outcomes.includes(s.outcome)&&time(s.at)&&typeof s.input==='string'&&s.input.length<=1000&&typeof s.assisted==='boolean';}
function validDraft(d,e){
 const ids=(e.options||e.chunks||[]).map(x=>x.id);
 return object(d)&&d.id===e.id&&Array.isArray(d.order)&&d.order.length===ids.length&&new Set(d.order).size===ids.length&&d.order.every(x=>ids.includes(x))&&
 (d.picked===null||!!e.options?.some(o=>o.id===d.picked))&&Array.isArray(d.chunks)&&new Set(d.chunks).size===d.chunks.length&&d.chunks.every(x=>e.chunks?.some(c=>c.id===x))&&typeof d.answer==='string'&&d.answer.length<=500&&
 ['english','hint','model','assisted'].every(k=>typeof d[k]==='boolean')&&validResult(d.result)&&object(d.previous)&&Array.isArray(d.submissions)&&d.submissions.every(validSubmission);
}
function validEvidence(e){return object(e)&&count(e.runs)&&Array.isArray(e.records)&&e.records.every(r=>object(r)&&typeof r.id==='string'&&['communicated','skipped'].includes(r.outcome)&&typeof r.assisted==='boolean'&&time(r.at)&&Array.isArray(r.submissions)&&r.submissions.every(validSubmission))&&count(e.submissions)&&['communicated','helped','skipped'].every(k=>Array.isArray(e[k])&&e[k].every(x=>typeof x==='string'))&&(e.lastPractised===null||time(e.lastPractised))&&(e.status===null||e.status==='practised_with_help');}
function validBase(p,lesson){return object(p)&&p.schema===1&&p.lessonId===lesson.id&&typeof p.version==='string'&&(p.lastActivity===null||time(p.lastActivity))&&validEvidence(p.evidence)&&Array.isArray(p.previousVersions)&&p.previousVersions.every(x=>object(x)&&typeof x.version==='string'&&validEvidence(x.evidence));}
export function readProgress(storage,lesson){
 const empty=freshProgress(lesson);
 try{
  const raw=storage.getItem(PROGRESS_KEY);if(!raw)return {progress:empty,notice:''};
  const p=JSON.parse(raw);if(!validBase(p,lesson))throw Error('Invalid progress');
  if(p.version!==lesson.content_version)return {progress:{...empty,previousVersions:[...p.previousVersions,{version:p.version,evidence:p.evidence}]},notice:'The lesson has changed. Start this version fresh; your earlier practice record is kept separately.'};
  const exercises=supportedExercises(lesson),ids=exercises.map(e=>e.id);
  if(['communicated','helped','skipped'].some(k=>p.evidence[k].some(id=>!ids.includes(id))))throw Error('Invalid evidence');
  if(p.session!==null){
   const s=p.session;if(!object(s)||!Array.isArray(s.finished)||s.finished.length>ids.length)throw Error('Invalid session');
   if(s.finished.some((a,i)=>!object(a)||a.id!==ids[i]||!['communicated','skipped'].includes(a.outcome)||typeof a.assisted!=='boolean'))throw Error('Invalid steps');
   if(s.draft!==null&&(!exercises[s.finished.length]||!validDraft(s.draft,exercises[s.finished.length])))throw Error('Invalid draft');
  }
  return {progress:p,notice:''};
 }catch(error){return {progress:empty,notice:error instanceof SyntaxError||error.message.startsWith('Invalid')?'Saved progress could not be read. This session starts fresh.':'Browser storage is unavailable. You can practise, but progress may not survive a reload.'};}
}
export function writeProgress(storage,p){try{storage.setItem(PROGRESS_KEY,JSON.stringify(p));return true;}catch{return false;}}
export function resetProgress(storage,lesson){try{storage.removeItem(PROGRESS_KEY);return {progress:freshProgress(lesson),removed:true};}catch{return {progress:freshProgress(lesson),removed:false};}}
export function saveDraft(p,draft,now=Date.now()){
 if(!p.session)return p;
 return {...p,lastActivity:now,session:{...p.session,draft}};
}
export function finishExercise(p,attempt,lesson,now=Date.now()){
 const exercises=supportedExercises(lesson),s=p.session;
 if(!s||exercises[s.finished.length]?.id!==attempt.id)return p; // Idempotent continue.
 const finished=[...s.finished,attempt],draft=s.draft;
 const add=(list,id)=>[...new Set([...list,id])];
 const evidence={...p.evidence,submissions:p.evidence.submissions+(draft?.submissions.length||0),records:[...p.evidence.records,{...attempt,at:now,submissions:draft?.submissions||[]}]};
 if(draft?.submissions.length||attempt.outcome==='communicated'){evidence.lastPractised=now;evidence.status='practised_with_help';}
 if(attempt.outcome==='communicated')evidence.communicated=add(evidence.communicated,attempt.id);
 if(attempt.assisted)evidence.helped=add(evidence.helped,attempt.id);
 if(attempt.outcome==='skipped')evidence.skipped=add(evidence.skipped,attempt.id);
 if(finished.length===exercises.length)evidence.runs++;
 return {...p,lastActivity:now,evidence,session:{finished,draft:null}};
}
export function progressSummary(p,now=Date.now()){
 const e=p.evidence;
 return {communicated:e.communicated.length,runs:e.runs,revisit:e.lastPractised!==null&&now-e.lastPractised>=DAY,submissions:e.submissions+(p.session?.draft?.submissions.length||0)};
}
