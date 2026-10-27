import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {clipFor,createPlayer} from '../app/audio.mjs';
import manifest from '../content/audio-trial.mjs';
import {evaluate,assemble} from '../app/engine.mjs';
const lesson=JSON.parse(readFileSync(new URL('../content/walking-in.v2.json',import.meta.url)));
test('all accepted choices and build permutations have learner audio',()=>{
 let builds=0;
 for(const e of lesson.exercises){
  if(['choice','listen_choice'].includes(e.type))for(const o of e.options.filter(o=>o.expected_outcome==='communicated'))assert.equal(clipFor(lesson,{ca:o.text.ca})?.role,'learner',o.text.ca);
  if(e.type!=='build')continue;
  const rule=lesson.answer_rules.find(r=>r.id===e.rule_id),facts=lesson.situations.find(s=>s.id===e.situation_id).facts;
  function walk(ids){
   const text=assemble(e.chunks,ids);
   if(ids.length&&evaluate({text,rule,facts,known:e.known_to_staff}).outcome==='communicated'){builds++;assert.equal(clipFor(lesson,{ca:text})?.role,'learner',text);}
   for(const c of e.chunks)if(!ids.includes(c.id))walk([...ids,c.id]);
  }
  walk([]);
 }
 assert.equal(builds,53);
 assert.equal(clipFor(lesson,{ca:'A nom de Martí'}),manifest.clips['reply-name-1']);
 assert.equal(clipFor(lesson,{ca:'Bona nit, teniu reserva?'}),null);
});
function setup(timeout=500){const audios=[];const player=createPlayer(src=>{const a={src,paused:false,play:()=>Promise.resolve(),pause(){this.paused=true;},removeAttribute(){},load(){}};audios.push(a);return a;},timeout);return {player,audios};}
test('exact text/version maps to actual MP3, changed text/version and unavailable clips do not',()=>{
 for(const [id,clip] of Object.entries(manifest.clips)){assert.ok(clipFor(lesson,{audio_id:id,ca:clip.text}));assert.ok(existsSync(new URL('..'+clip.path,import.meta.url)));assert.equal(readFileSync(new URL('..'+clip.path,import.meta.url)).subarray(0,3).toString(),'ID3');assert.equal(clipFor(lesson,{audio_id:id,ca:clip.text+'!'}),null);assert.equal(clipFor({...lesson,content_version:'new'},{audio_id:id,ca:clip.text}),null);}
 assert.equal(clipFor(lesson,{audio_id:'staff-size',ca:'Quantes persones sou?'}),null);
});
test('one clip at a time, replay and end state',()=>{
 const {player,audios}=setup();player.play('a','a.mp3');audios[0].onplaying();assert.equal(player.getState().status,'playing');player.play('b','b.mp3');assert.equal(audios[0].paused,true);audios[1].onplaying();audios[1].onended();assert.equal(player.getState().status,'ended');player.play('b','b.mp3');assert.equal(audios.length,3);player.stop();assert.equal(player.getState().status,'idle');
});
test('missing media and play rejection report failure without blocking text',async()=>{
 const {player,audios}=setup();player.play('a','missing');audios[0].onerror();assert.equal(player.getState().status,'error');
 const denied=createPlayer(()=>({play:()=>Promise.reject(Error('denied')),pause(){},load(){},removeAttribute(){}}));denied.play('a','a');await Promise.resolve();assert.equal(denied.getState().status,'error');
});
test('late rejection cannot interrupt newer playback',async()=>{
 let reject;const a={play:()=>new Promise((_,r)=>reject=r),pause(){},load(){},removeAttribute(){}};const b={...a,play:()=>Promise.resolve()};let i=0;const player=createPlayer(()=>i++?b:a);player.play('old','a');player.play('new','b');b.onplaying();reject(Error('old'));await Promise.resolve();assert.deepEqual(player.getState(),{key:'new',status:'playing'});player.stop();
});
test('loading timeout is recoverable and releases the media',async()=>{
 const {player,audios}=setup(5);player.play('a','a');await new Promise(r=>setTimeout(r,15));assert.equal(player.getState().status,'error');assert.equal(audios[0].paused,true);player.play('a','a');audios[1].onplaying();assert.equal(player.getState().status,'playing');player.stop();
});
