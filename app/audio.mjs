import manifest from '../content/audio-trial.mjs';
// Learner replies have no audio_id; built replies lack final punctuation, so match loosely.
const spoken=text=>text?.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
export function clipFor(lesson,staff){
 if(lesson.content_version!==manifest.lesson_version)return null;
 if(staff?.audio_id){const clip=manifest.clips[staff.audio_id];return clip?.text===staff.ca?clip:null;}
 return Object.values(manifest.clips).find(c=>c.role==='learner'&&spoken(c.text)===spoken(staff?.ca))||null;
}
// One shared player, with race protection for late play promises and media events.
export function createPlayer(makeAudio=src=>new Audio(src),timeoutMs=15000){
 let audio=null,serial=0,timer=null,state={key:null,status:'idle'},listeners=new Set();
 const emit=next=>{state=next;listeners.forEach(fn=>fn(state));};
 function release(){clearTimeout(timer);if(audio){audio.onplaying=audio.onended=audio.onerror=audio.onwaiting=null;audio.pause();audio.removeAttribute('src');audio.load();audio=null;}}
 function stop(){serial++;release();emit({key:null,status:'idle'});}
 function play(key,src){
  stop();const run=++serial;
  const update=status=>{if(run===serial)emit({key,status});};
  const fail=()=>{if(run!==serial)return;release();update('error');};
  try{
   audio=makeAudio(src);audio.preload='auto';
   audio.onplaying=()=>{clearTimeout(timer);update('playing');};
   audio.onwaiting=()=>{update('loading');clearTimeout(timer);timer=setTimeout(fail,timeoutMs);};
   audio.onended=()=>{release();update('ended');};audio.onerror=fail;
   update('loading');timer=setTimeout(fail,timeoutMs);
   Promise.resolve(audio.play()).catch(fail);
  }catch{fail();}
 }
 return {play,stop,getState:()=>state,subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);}};
}
export const player=createPlayer();
