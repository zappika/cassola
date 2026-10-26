import manifest from '../content/audio-trial.mjs';
export function clipFor(lesson,staff){
 const clip=manifest.clips[staff?.audio_id];
 return lesson.content_version===manifest.lesson_version&&clip?.text===staff.ca?clip:null;
}
// One shared player, with race protection for late loads and playback events.
// Clips play through Web Audio rather than an <audio> element so iOS doesn't show them as lock-screen media.
export function createPlayer(makeContext=()=>new (globalThis.AudioContext||globalThis.webkitAudioContext)(),load=src=>fetch(src).then(r=>{if(!r.ok)throw Error(src);return r.arrayBuffer();}),timeoutMs=15000){
 let context=null,source=null,serial=0,timer=null,state={key:null,status:'idle'},listeners=new Set();
 const buffers=new Map();
 const emit=next=>{state=next;listeners.forEach(fn=>fn(state));};
 // 'playback' lets Safari play Web Audio even when the phone's silent switch is on.
 const ctx=()=>{if(!context){try{if(globalThis.navigator?.audioSession)navigator.audioSession.type='playback';}catch{}context=makeContext();}return context;};
 function release(){clearTimeout(timer);if(source){source.onended=null;try{source.stop();}catch{}source.disconnect();source=null;}}
 function stop(){serial++;release();emit({key:null,status:'idle'});}
 // Browsers only allow sound after a user gesture; resuming here lets later automatic playback through.
 function unlock(){try{if(globalThis.navigator?.audioSession)navigator.audioSession.type='playback';const c=ctx();if(c.state==='suspended')c.resume();}catch{}}
 function play(key,src){
  stop();const run=++serial;
  const update=status=>{if(run===serial)emit({key,status});};
  const fail=()=>{if(run!==serial)return;release();update('error');};
  try{
   const c=ctx();update('loading');timer=setTimeout(fail,timeoutMs);
   if(!buffers.has(src))buffers.set(src,load(src).then(data=>new Promise((ok,no)=>c.decodeAudioData(data,ok,no))).catch(error=>{buffers.delete(src);throw error;}));
   Promise.all([buffers.get(src),c.state==='suspended'?c.resume():null]).then(([buffer])=>{
    if(run!==serial)return;clearTimeout(timer);
    if(c.state!=='running')return fail();
    source=c.createBufferSource();source.buffer=buffer;source.connect(c.destination);
    source.onended=()=>{if(run!==serial)return;release();update('ended');};
    source.start();update('playing');
   }).catch(fail);
  }catch{fail();}
 }
 return {play,stop,unlock,getState:()=>state,subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);}};
}
export const player=createPlayer();
if(typeof document!=='undefined')['pointerdown','keydown','touchend'].forEach(type=>document.addEventListener(type,player.unlock,{capture:true,passive:true}));
