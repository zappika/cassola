import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,validateSubmission,appendReview,makeSession,sessionId} from '../lib/review-service.mjs';
import {sectionStatus,latestReviews} from '../review/catalog.mjs';
import audioTrial from '../content/audio-trial.mjs';
const s=catalog[0];
const input={sectionId:s.id,revision:s.revision,name:'Núria',status:'approved',comment:'',requestId:'12345678-1234-1234-1234-123456789012'};
test('every learner recording has a generation-specific listening review',()=>{
 const clips=Object.entries(audioTrial.clips).filter(([,c])=>c.role==='learner');
 assert.equal(clips.length,63);
 for(const [id,clip] of clips){
  const section=catalog.find(s=>s.id==='voice-trial-'+id);
  assert.ok(section,id);assert.equal(section.rows[0].audio,clip.path);assert.equal(section.rows[0].generation_id,clip.generation_id);
  assert.equal(sectionStatus([],section),'pending');
 }
});
test('listening review identifies the voice of each speaker',()=>{
 assert.match(catalog.find(s=>s.id==='voice-trial-staff-size').rows[0].note,/^Dani ·/);
 assert.match(catalog.find(s=>s.id==='voice-trial-reply-name-1').rows[0].note,/^Martina ·/);
});
test('catalog includes all guided exercises, all branches and every rule fixture',()=>{
 assert.equal(catalog.length,91);assert.equal(new Set(catalog.map(s=>s.id)).size,91);
 for(const s of catalog){assert.ok(s.rows.length);assert.match(s.revision,/^[0-9a-f]{20}$/);assert.ok(!JSON.stringify(s.rows).includes('{party_size_word}'));}
 assert.ok(catalog.find(s=>s.id==='answers-confirm-booking').rows.some(r=>r.ca==='Tinc una taula reservada.'&&r.note==='Accept'));
});
test('input validation prevents stale approvals, empty feedback and oversized writes',()=>{
 assert.equal(validateSubmission(input,'one').reviewerId,'one');
 for(const patch of [{revision:'old'},{status:'changes'},{name:''},{comment:'x'.repeat(4001)},{sectionId:'bogus'},{requestId:'bad'}])assert.throws(()=>validateSubmission({...input,...patch},'one'));
});
test('signed sessions resist forgery and require the review code secret',()=>{
 const token=makeSession('test-secret');assert.ok(sessionId('cassola_review='+token,'test-secret'));
 assert.equal(sessionId('cassola_review='+token,'other'),null);assert.equal(sessionId('cassola_review=forged','test-secret'),null);
});
test('different reviewers cannot overwrite each other and issues dominate approval',()=>{
 const a=validateSubmission(input,'one'),b=validateSubmission({...input,status:'changes',comment:'Please correct this.'},'two');
 assert.equal(sectionStatus([a,b],s),'changes');assert.equal(latestReviews([a,b],s).length,2);
 assert.equal(sectionStatus([a,b,{...b,status:'approved'}],s),'approved');
 assert.equal(sectionStatus([{...a,revision:'old'}],s),'pending');assert.equal(sectionStatus([{...a,status:'draft'}],s),'pending');
});
test('concurrent writes merge after conflict; network retries do not duplicate a review',async()=>{
 let events=[],etag=0,conflict=true;
 const other=validateSubmission({...input,requestId:'22345678-1234-1234-1234-123456789012'},'two');
 const store={read:async()=>({events:[...events],etag}),write:async(next,expected)=>{if(conflict){conflict=false;events.push(other);etag++;throw Object.assign(Error('conflict'),{conflict:true});}assert.equal(expected,etag);events=next;etag++;}};
 const own=validateSubmission(input,'one');await appendReview(store,own);await appendReview(store,own);assert.equal(events.length,2);assert.ok(events.some(e=>e.reviewerId==='two'));
});
test('failed persistence does not report success',async()=>{await assert.rejects(appendReview({read:async()=>({events:[]}),write:async()=>{throw Error('offline');}},validateSubmission(input,'one')),/offline/);});

import {createHandler} from '../lib/review-handler.mjs';
test('API supports independent reviewers, persisted drafts, revisions and auth checks',async()=>{
 let events=[],etag=0;
 const store={read:async()=>({events:[...events],etag}),write:async(next,version)=>{assert.equal(version,etag);events=next;etag++;}};
 const handler=createHandler({store,secret:'test-code'});
 async function request(method,body,cookie,origin='https://cassola.xyz'){
  const result={headers:{}};const req={method,body,headers:{host:'cassola.xyz',origin,'content-type':'application/json',cookie}};
  const res={setHeader:(k,v)=>result.headers[k]=v,status:n=>{result.status=n;return res;},json:v=>result.body=v};await handler(req,res);return result;
 }
 assert.equal((await request('GET')).status,401);
 assert.equal((await request('POST',{action:'login',code:'wrong'})).status,401);
 const login=await request('POST',{action:'login',code:'test-code'});const cookie=login.headers['Set-Cookie'].split(';')[0];
 assert.equal(login.status,200);assert.match(login.headers['Set-Cookie'],/HttpOnly; Secure; SameSite=Strict/);
 assert.equal((await request('POST',{...input,status:'draft',comment:'Half checked'},cookie)).status,200);
 const second=await request('POST',{action:'login',code:'test-code'});const cookie2=second.headers['Set-Cookie'].split(';')[0];
 const shared=await request('GET',null,cookie2);assert.equal(shared.body.reviews.length,1);assert.equal(shared.body.reviews[0].status,'draft');
 assert.equal((await request('POST',{...input,requestId:'32345678-1234-1234-1234-123456789012'},cookie2)).status,200);
 assert.equal((await request('GET',null,cookie)).body.reviews.length,2);
 assert.equal((await request('POST',input,cookie,'https://other.example')).status,403);
 assert.equal((await request('POST',{...input,revision:'stale'},cookie)).status,409);
 assert.equal((await request('DELETE',null,cookie)).status,405);
});
