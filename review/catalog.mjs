import audioTrial from '../content/audio-trial.mjs';
import {glosses} from '../app/language-help.mjs';
const labels = {communicated:'Accept',needs_information:'Ask for missing information',different_meaning:'Meaning does not fit',uncertain:'Ask for clarification'};
const detailLabels={question_topic:'what the question is about',reservation:'reservation status',name:'booking name',availability_request:'asking for a table',party_size:'party size',repeat_request:'request to repeat',late_acknowledgement:'acknowledging lateness',table_still_available_request:'asking whether the table is still available',accept_seating:'responding to the invitation'};
const detailNames=keys=>keys.map(k=>detailLabels[k]||k).join(', ');
const row = (label, text, note='') => ({label, ...(typeof text==='string'?{ca:text}:text), note});
export function buildSections(lesson, fixtures) {
  const rules=Object.fromEntries(lesson.answer_rules.map(r=>[r.id,r]));
  const situations=Object.fromEntries(lesson.situations.map(s=>[s.id,s]));
  const sections=[];
  const add=(id,group,title,rows)=>sections.push({id,group,title,rows});
  for(const [i,e] of lesson.exercises.entries()) {
    if(e.type==='exchange') continue;
    const r=rules[e.rule_id];
    const rows=[row('Situation',situations[e.situation_id].context),row('Goal',r.goal),row('Staff says',e.staff)];
    if(e.instruction) rows.push(row('Instruction',e.instruction));
    for(const n of lesson.teaching_notes.filter(n=>n.before_exercise===e.id)) rows.push(row('Teaching note',n.text));
    for(const o of e.options||[]) rows.push(row('Choice',o.text,labels[o.expected_outcome]+(o.missing_details.length?': '+detailNames(o.missing_details):'')));
    for(const c of e.chunks||[]) rows.push(row('Phrase chunk',c.text));
    for(const s of e.accepted_chunk_sequences||[]) rows.push(row('Accepted build',s.map(id=>e.chunks.find(c=>c.id===id).text).join(' ')));
    rows.push(row('Hint',r.hint));
    for(const text of r.accepted_responses) rows.push(row('Accepted example',fill(text,situations[e.situation_id].facts)));
    for(const t of e.tasks||[]) {
      rows.push(row('Speaking prompt',t.staff));
      if(t.instruction) rows.push(row('Speaking instruction',t.instruction));
      if(t.rule_id!==e.rule_id) for(const text of rules[t.rule_id].accepted_responses) rows.push(row('Accepted spoken response',text));
    }
    if(e.follow_up) rows.push(row('Follow-up',e.follow_up));
    add(e.id,'Lesson',`${i+1}. ${r.goal.en}`,rows);
  }
  for(const b of lesson.branches) {
    const s=situations[b.situation_id];
    const rows=[row('Situation',s.context),row('Instruction',lesson.exercises.find(e=>e.type==='exchange').instruction)];
    for(const [i,n] of b.nodes.entries()) {
      rows.push(row(`Turn ${i+1} · staff`,n.staff));
      for(const answer of rules[n.rule_id].accepted_responses) rows.push(row('Example response',fill(answer,s.facts)));
      if(n.when_detail_already_known) rows.push(row('If already supplied',n.when_detail_already_known.staff,'A confirmation replaces asking for the same detail again.'));
    }
    add('branch-'+b.id,'Final exchanges',b.id==='reserved'?'With a reservation':b.id==='unreserved'?'Without a reservation':'Arriving late',rows);
  }
  for(const r of lesson.answer_rules) {
    const cases=fixtures.answer_cases.filter(c=>c.rule_id===r.id);
    add('answers-'+r.id,'Answer checks',r.goal.en,cases.flatMap(c=>[
      row('Situation',situations[c.situation_id].context,Object.keys(c.known_to_staff).length?'Already told staff: '+Object.entries(c.known_to_staff).map(([k,v])=>`${detailLabels[k]||k}: ${v===true?'yes':v===false?'no':v}`).join(', '):''),
      row('Learner answer',c.input||'(empty answer)',`${labels[c.expected.outcome]}${c.expected.missing_details.length?' · missing: '+detailNames(c.expected.missing_details):''}`)
    ]));
  }
  add('feedback-copy','Other wording','Hints, feedback & completion',[
    ...Object.entries(lesson.feedback).filter(([k])=>k!=='missing_details').map(([k,v])=>row(labels[k],v)),
    ...Object.entries(lesson.feedback.missing_details).map(([k,v])=>row('Missing: '+detailLabels[k],v)),
    ...Object.entries(lesson.completion_copy).map(([k,v])=>row(k,v)),
    ...lesson.answer_rules.map(r=>row('Hint',r.hint)),
    ...glosses.map(([ca,en])=>row('Tap / hover meaning',{ca,en},'Draft inline English help; check meaning in this restaurant context.'))
  ]);
  add('audio-scripts','Other wording','Audio scripts — text only',Object.entries(lesson.audio).map(([id,a])=>row(id,a.text,'Audio has not been generated. Approval here covers wording only.')));
  for(const [id,clip] of Object.entries(audioTrial.clips)){
    if(audioTrial.lesson_version!==lesson.content_version||(clip.role!=='learner'&&lesson.audio[id]?.text!==clip.text))continue;
    add('voice-trial-'+id,'Voice trial',clip.text,[{label:'Listen and review',ca:clip.text,audio:clip.path,note:`${clip.voice_name||audioTrial.voice_name} · Eleven v4. Check Catalan pronunciation, accent, pace, stress and exact wording. This approval covers this specific trial clip.`,generation_id:clip.generation_id}]);
  }
  return sections;
}
function fill(text,facts){return text.replace(/\{(\w+)\}/g,(_,key)=>facts[key]??`{${key}}`);}
export function latestReviews(events, section) {
  const latest=new Map();
  for(const e of events) if(e.sectionId===section.id&&e.revision===section.revision) latest.set(e.reviewerId,e);
  return [...latest.values()].sort((a,b)=>b.savedAt.localeCompare(a.savedAt));
}
export function sectionStatus(events,section){
  const reviews=latestReviews(events,section);
  if(reviews.some(r=>r.status==='changes')) return 'changes';
  if(reviews.some(r=>r.status==='approved')) return 'approved';
  return 'pending';
}
