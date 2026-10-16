import {createHash,randomUUID,createHmac,timingSafeEqual} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {buildSections} from '../review/catalog.mjs';
const lesson=JSON.parse(readFileSync(new URL('../content/walking-in.v2.json',import.meta.url)));
const fixtures=JSON.parse(readFileSync(new URL('../tests/fixtures/walking-in.v2.answers.json',import.meta.url)));
export const catalog=buildSections(lesson,fixtures).map(s=>({...s,revision:createHash('sha256').update(JSON.stringify(s)).digest('hex').slice(0,20)}));
export const version=lesson.content_version;
export function same(a,b){const x=Buffer.from(a||''),y=Buffer.from(b||'');return x.length===y.length&&timingSafeEqual(x,y);}
export function makeSession(secret){const data=Buffer.from(JSON.stringify({id:randomUUID(),expires:Date.now()+90*86400000})).toString('base64url');return data+'.'+createHmac('sha256',secret).update(data).digest('base64url');}
export function sessionId(cookie,secret){try{const token=(cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('cassola_review='))?.slice(15);const [data,sig]=token.split('.');if(!same(sig,createHmac('sha256',secret).update(data).digest('base64url')))return null;const s=JSON.parse(Buffer.from(data,'base64url'));return s.expires>Date.now()?s.id:null;}catch{return null;}}
export function validateSubmission(body,reviewerId){
  const s=catalog.find(s=>s.id===body.sectionId);
  if(!s) throw Object.assign(new Error('Unknown section.'),{status:400});
  if(body.revision!==s.revision) throw Object.assign(new Error('The wording changed. Refresh and review the new version.'),{status:409});
  if(!['draft','approved','changes'].includes(body.status)) throw Object.assign(new Error('Choose a review status.'),{status:400});
  if(typeof body.name!=='string'||!body.name.trim()||body.name.length>80) throw Object.assign(new Error('Add your name (up to 80 characters).'),{status:400});
  if(typeof body.comment!=='string'||body.comment.length>4000) throw Object.assign(new Error('Keep feedback under 4,000 characters.'),{status:400});
  if(body.status==='changes'&&!body.comment.trim()) throw Object.assign(new Error('Tell us what needs changing.'),{status:400});
  if(!/^[a-f0-9-]{36}$/i.test(body.requestId||'')) throw Object.assign(new Error('Invalid save ID.'),{status:400});
  return {id:body.requestId,sectionId:s.id,revision:s.revision,contentVersion:version,reviewerId,name:body.name.trim(),comment:body.comment.trim(),status:body.status,savedAt:new Date().toISOString()};
}
export async function appendReview(store,event){
  for(let attempt=0;attempt<5;attempt++){
    const snapshot=await store.read();
    if(snapshot.events.some(e=>e.id===event.id&&e.reviewerId===event.reviewerId))return;
    if(snapshot.events.length>=500)throw Object.assign(new Error('Review archive is full. Please contact Cassola.'),{status:503});
    try{await store.write([...snapshot.events,event],snapshot.etag);return;}catch(err){if(!err.conflict)throw err;}
  }
  throw Object.assign(new Error('Another review was saved at the same time. Please save again.'),{status:409});
}
