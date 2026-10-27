import {supportedExercises} from './engine.mjs';
import {responseEnglish} from './language-help.mjs';

// Rebuild only this run from saved evidence, never previous practice runs.
export function conversationHistory(lesson,progress){
 const finished=progress.session?.finished||[],records=progress.evidence.records;
 const current=finished.length?records.slice(-finished.length):[];
 return finished.map((step,i)=>({exercise:supportedExercises(lesson)[i],step,submissions:current[i]?.id===step.id?current[i].submissions:[]}));
}
export function turnContext(lesson,exercise,previous){
 return {
  scene:!previous||previous.situation_id!==exercise.situation_id?lesson.situations.find(s=>s.id===exercise.situation_id).context:null,
  staff:!previous||previous.situation_id!==exercise.situation_id||previous.staff.ca!==exercise.staff.ca,
  instruction:exercise.id==='choose-repeat'?exercise.instruction:lesson.answer_rules.find(r=>r.id===exercise.rule_id).goal
 };
}
export function sentReply(exercise,submission){
 const option=exercise.options?.find(o=>o.id===submission.input);
 return {ca:option?.text.ca||submission.input,en:option?.text.en||submission.translation||''};
}
export function makeSubmission(exercise,{picked,chunks,answer,assisted,result},now=Date.now()){
 const input=exercise.options?picked:exercise.type==='build'?chunks.map(id=>exercise.chunks.find(c=>c.id===id).text).join(' '):answer;
 return {input,assisted,at:now,outcome:result.outcome,missing:result.missing_details,translation:responseEnglish(exercise,picked,chunks)};
}
