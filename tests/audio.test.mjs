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
// Fake Web Audio: a context whose sources the test ends by hand, and a loader per src.
function fakeContext(){const sources=[];return {sources,state:'running',resume:()=>Promise.resolve(),destination:{},decodeAudioData:(data,ok,no)=>data==='bad'?no(Error('decode')):ok({data}),createBufferSource(){const s={connect(){},disconnect(){},start(){s.started=true;},stop(){s.stopped=true;}};sources.push(s);return s;}};}
function setup({timeout=500,load=src=>Promise.resolve(src)}={}){const context=fakeContext();const player=createPlayer(()=>context,load,timeout);return {player,sources:context.sources};}
const tick=()=>new Promise(r=>setTimeout(r,0));
test('exact text/version maps to actual MP3, changed text/version and unavailable clips do not',()=>{
 for(const [id,clip] of Object.entries(manifest.clips)){assert.ok(clipFor(lesson,{audio_id:id,ca:clip.text}));assert.ok(existsSync(new URL('..'+clip.path,import.meta.url)));assert.equal(readFileSync(new URL('..'+clip.path,import.meta.url)).subarray(0,3).toString(),'ID3');assert.equal(clipFor(lesson,{audio_id:id,ca:clip.text+'!'}),null);assert.equal(clipFor({...lesson,content_version:'new'},{audio_id:id,ca:clip.text}),null);}
 assert.equal(clipFor(lesson,{audio_id:'staff-size',ca:'Quantes persones sou?'}),null);
});
test('one clip at a time, replay and end state',async()=>{
 const {player,sources}=setup();player.play('a','a.mp3');assert.equal(player.getState().status,'loading');await tick();assert.equal(player.getState().status,'playing');
 player.play('b','b.mp3');assert.equal(sources[0].stopped,true);await tick();sources[1].onended();assert.equal(player.getState().status,'ended');
 player.play('b','b.mp3');await tick();assert.equal(sources.length,3);player.stop();assert.equal(sources[2].stopped,true);assert.equal(player.getState().status,'idle');
});
test('missing media and undecodable audio report failure without blocking text',async()=>{
 const missing=setup({load:()=>Promise.reject(Error('404'))});missing.player.play('a','missing');await tick();assert.equal(missing.player.getState().status,'error');
 const bad=setup({load:()=>Promise.resolve('bad')});bad.player.play('a','bad');await tick();assert.equal(bad.player.getState().status,'error');
 const blocked=fakeContext();blocked.state='suspended';const denied=createPlayer(()=>blocked,src=>Promise.resolve(src));denied.play('a','a');await tick();assert.equal(denied.getState().status,'error');
});
test('a late load cannot interrupt newer playback',async()=>{
 let resolveOld;const {player,sources}=setup({load:src=>src==='old'?new Promise(r=>resolveOld=r):Promise.resolve(src)});
 player.play('old','old');player.play('new','new');await tick();assert.deepEqual(player.getState(),{key:'new',status:'playing'});
 resolveOld('old');await tick();assert.equal(sources.length,1);assert.deepEqual(player.getState(),{key:'new',status:'playing'});player.stop();
});
test('loading timeout is recoverable',async()=>{
 let hang=true;const {player}=setup({timeout:5,load:src=>hang?new Promise(()=>{}):Promise.resolve(src)});
 player.play('a','a');await new Promise(r=>setTimeout(r,15));assert.equal(player.getState().status,'error');
 hang=false;player.play('a','b');await tick();assert.equal(player.getState().status,'playing');player.stop();
});
