import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {glossText,responseEnglish} from '../app/language-help.mjs';
const lesson=JSON.parse(readFileSync(new URL('../content/walking-in.v2.json',import.meta.url)));
test('glosses preserve accents, punctuation and original text; longest idiom wins',()=>{
 const text='Tinc una taula reservada, si us plau.';const parts=glossText(text);
 assert.equal(parts.map(p=>p.text).join(''),text);
 assert.equal(parts.find(p=>p.text==='una taula reservada').meaning,'a table booked');
 assert.equal(parts.find(p=>p.text==='si us plau').meaning,'please');
 assert.equal(glossText('GRÀCIES!')[0].meaning,'thank you');
});
test('no matching inside longer words, names or unrelated text',()=>{
 assert.deepEqual(glossText('reservada desconeguda'),[{text:'reservada desconeguda'}]);
 assert.deepEqual(glossText('Martí'),[{text:'Martí'}]);
});
test('reply translations use selected option ID, not shuffled position',()=>{
 const e=lesson.exercises.find(e=>e.id==='choose-booking');
 for(const o of e.options)assert.equal(responseEnglish(e,o.id,[]),o.text.en);
 assert.equal(responseEnglish(e,'missing',[]),'');
});
test('built translations preserve chosen order; arbitrary typed answers are not invented',()=>{
 assert.equal(responseEnglish({type:'build'},null,['late-sorry','late-question']),'Yes, sorry! Do we still have a table?');
 assert.equal(responseEnglish({type:'build'},null,['unknown']),'');
 assert.equal(responseEnglish({type:'type'},null,[]),'');
});

import {catalog} from '../lib/review-service.mjs';
test('inline meanings are included in native review',()=>{assert.ok(catalog.find(s=>s.id==='feedback-copy').rows.some(r=>r.label==='Tap / hover meaning'&&r.ca==='si us plau'&&r.en==='please'));});
