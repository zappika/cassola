import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evaluate,evaluateChoice,shuffle,assemble,supportedExercises} from '../app/engine.mjs';
const lesson=JSON.parse(readFileSync(new URL('../content/walking-in.v2.json',import.meta.url)));
const fixtures=JSON.parse(readFileSync(new URL('./fixtures/walking-in.v2.answers.json',import.meta.url)));
const rule=id=>lesson.answer_rules.find(r=>r.id===id);
const facts=id=>lesson.situations.find(s=>s.id===id).facts;
const assess=(text,r='request-table-size',s='walk-in',extra={})=>evaluate({text,rule:rule(r),facts:facts(s),...extra});
for(const c of fixtures.answer_cases)test(c.id,()=>{
 const actual=assess(c.input,c.rule_id,c.situation_id,{known:c.known_to_staff});
 assert.equal(actual.outcome,c.expected.outcome);assert.deepEqual(actual.missing_details,c.expected.missing_details);
});
test('new combinations, neutral politeness and numbers communicate',()=>{
 for(const answer of ['Hola! Teniu una taula per a dues persones, si us plau?','Bon dia. Som 2. Voldríem una taula.','Si us plau, hi ha una taula per dos?'])assert.equal(assess(answer).outcome,'communicated',answer);
});
test('negation and unsupported extra clauses never receive a false pass',()=>{
 for(const answer of ['No volem una taula per a dos.','Teniu lloc per dos? No tenim ganes de quedar-nos.','Teniu lloc per dos o tres?'])assert.notEqual(assess(answer).outcome,'communicated',answer);
 assert.equal(assess('Teniu lloc per dos? Tenim reserva.').outcome,'different_meaning');
});
test('partial replies accumulate only recognised compatible information',()=>{
 const first=assess('Teniu una taula?');assert.equal(first.outcome,'needs_information');
 assert.equal(assess('Som dos.','request-table-size','walk-in',{previous:first.details}).outcome,'communicated');
 assert.equal(assess('Som tres.','request-table-size','walk-in',{previous:first.details}).outcome,'different_meaning');
});
test('all authored chunk sequences work, including reordered courtesy',()=>{
 for(const e of lesson.exercises.filter(e=>e.type==='build'))for(const seq of e.accepted_chunk_sequences)assert.equal(assess(assemble(e.chunks,seq),e.rule_id,e.situation_id,{known:e.known_to_staff}).outcome,'communicated',seq.join(','));
});
test('shuffle preserves IDs and input, choice scoring follows ID not position',()=>{
 const e=lesson.exercises.find(e=>e.id==='choose-booking'),before=JSON.stringify(e.options),shuffled=shuffle(e.options,()=>0);
 assert.notDeepEqual(shuffled,e.options);assert.equal(JSON.stringify(e.options),before);
 for(const o of shuffled)assert.equal(evaluateChoice(e,o.id).outcome,o.expected_outcome);
 assert.equal(evaluateChoice(e,'unknown').outcome,'uncertain');
});
test('only eight guided exercises are available',()=>assert.equal(supportedExercises(lesson).length,8));
test('greetings and unfamiliar single words are not assumed to be a wrong name',()=>{
 assert.equal(assess('Hola.','give-name','booked').outcome,'needs_information');
 assert.equal(assess('Potser.','give-name','booked').outcome,'uncertain');
});
