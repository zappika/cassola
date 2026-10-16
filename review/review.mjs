import {latestReviews,sectionStatus} from './catalog.mjs';
const $=id=>document.getElementById(id);
let data=null,active=null,saving=false;
const statusLabels={approved:'Confirmed',changes:'Needs changes',pending:'Still to review',draft:'Draft'};
const symbols={approved:'✓',changes:'!',pending:'○'};
function storageGet(key,fallback=''){try{return localStorage.getItem(key)??fallback;}catch{return fallback;}}
function storageSet(key,value){try{localStorage.setItem(key,value);return true;}catch{return false;}}
function draftKey(){return `cassola-review:${data.reviewerId}:${active.id}:${active.revision}`;}
function rememberDraft(){if(!active)return;const ok=storageSet(draftKey(),JSON.stringify({comment:$('comment').value,name:$('reviewer-name').value}));$('save-message').textContent=ok?'Draft kept in this browser. Save below to share it.':'Browser storage unavailable. Save now to keep your feedback.';}
function message(id,text,error=false){$(id).textContent=text;$(id).classList.toggle('error',error);}
async function api(body){const r=await fetch('/api/reviews',{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,cache:'no-store'});let result;try{result=await r.json();}catch{throw Error('Shared review is unavailable. Please try again.');}if(!r.ok)throw Object.assign(Error(result.error||'Unable to save.'),{status:r.status});return result;}
function text(tag,value,cls){const el=document.createElement(tag);el.textContent=value;if(cls)el.className=cls;return el;}
function visibleSections(){const f=$('filter').value;return data.sections.filter(s=>f==='all'||sectionStatus(data.reviews,s)===f);}
function renderNav(){
 const approved=data.sections.filter(s=>sectionStatus(data.reviews,s)==='approved').length;
 const changes=data.sections.filter(s=>sectionStatus(data.reviews,s)==='changes').length;
 $('progress').textContent=`${approved} / ${data.sections.length} confirmed · ${changes} need changes`;
 const nav=$('section-nav');nav.replaceChildren();let group;
 for(const s of visibleSections()){
  if(s.group!==group){group=s.group;nav.append(text('h3',group));}
  const button=text('button','');button.append(text('span',symbols[sectionStatus(data.reviews,s)],'dot'),text('span',s.title));button.setAttribute('aria-current',String(s.id===active?.id));button.title=statusLabels[sectionStatus(data.reviews,s)];button.onclick=()=>select(s);nav.append(button);
 }
 if(!nav.children.length)nav.append(text('p','No sections in this view. Choose another filter.'));
}
function reviewNode(r){const div=text('div','','review-note');div.append(text('strong',`${r.name} · ${statusLabels[r.status]}`),text('small',new Date(r.savedAt).toLocaleString()));if(r.comment)div.append(text('p',r.comment));return div;}
function renderNotes(){
 $('section-status').textContent=`${statusLabels[sectionStatus(data.reviews,active)]} · Saved feedback is shared with all invited reviewers.`;
 const current=latestReviews(data.reviews,active);$('reviews').replaceChildren(...current.map(reviewNode));if(!current.length)$('reviews').append(text('p','No shared reviews yet. You can be the first.'));
 const older=data.reviews.filter(r=>r.sectionId===active.id&&r.revision!==active.revision);$('older-reviews').replaceChildren(...older.map(reviewNode));$('older-reviews').parentElement.hidden=!older.length;
}
function select(s){
 if(saving)return;
 active=s;storageSet('cassola-review-last-section',s.id);
 $('section-group').textContent=s.group;$('section-title').textContent=s.title;
 $('wording').replaceChildren(...s.rows.map(r=>{const wrap=text('div','','word-row');wrap.append(text('div',r.label,'row-label'));const body=text('div','');const ca=text('div',r.ca||'','catalan');ca.lang='ca';body.append(ca);if(r.en)body.append(text('div',r.en,'english'));if(r.note)body.append(text('div',r.note,'note'));wrap.append(body);return wrap;}));
 let draft;try{draft=JSON.parse(storageGet(draftKey(),'null'));}catch{}
 const own=latestReviews(data.reviews,s).find(r=>r.reviewerId===data.reviewerId);
 $('comment').value=draft?.comment??own?.comment??'';
 message('save-message',draft?'Unshared draft restored from this browser.':own?'Your last saved review is shown below.':'');
 renderNotes();renderNav();
 const pos=data.sections.indexOf(s);$('previous').disabled=pos===0;$('next').disabled=pos===data.sections.length-1;
}
async function load(){
 const fresh=await api();data=fresh;$('login').hidden=true;$('workspace').hidden=false;
 $('reviewer-name').value=storageGet('cassola-review-name');
 select(data.sections.find(s=>s.id===(active?.id||storageGet('cassola-review-last-section')))||data.sections[0]);
}
$('login-form').onsubmit=async event=>{event.preventDefault();const button=event.submitter;button.disabled=true;try{await api({action:'login',code:$('code').value.trim()});$('code').value='';await load();}catch(e){message('login-message',e.message,true);}finally{button.disabled=false;}};
$('reviewer-name').oninput=()=>{storageSet('cassola-review-name',$('reviewer-name').value);if(active)rememberDraft();};
$('comment').oninput=rememberDraft;
$('filter').onchange=()=>renderNav();
$('refresh').onclick=async()=>{if(saving)return;try{const fresh=await api();data=fresh;const updated=data.sections.find(s=>s.id===active.id);if(updated.revision!==active.revision){message('global-message','This section changed. Your previous draft remains in this browser. Review the current wording before saving.',true);select(updated);}else{renderNav();renderNotes();message('global-message','Shared progress refreshed.');}}catch(e){message('global-message',e.message,true);}};
async function save(status){
 if(saving)return;
 if(!$('reviewer-name').value.trim()){message('save-message','Add your name or initials first.',true);$('reviewer-name').focus();return;}
 if(status==='changes'&&!$('comment').value.trim()){message('save-message','Add a suggestion or explain what needs changing.',true);$('comment').focus();return;}
 saving=true;document.querySelectorAll('button').forEach(b=>b.disabled=true);$('comment').disabled=true;$('reviewer-name').disabled=true;
 message('save-message','Saving for everyone…');
 // A failed request keeps this ID, so retrying an acknowledged-but-lost response is idempotent.
 const payload={sectionId:active.id,revision:active.revision,status,name:$('reviewer-name').value,comment:$('comment').value};
 const retryKey=draftKey()+':request';let retry;try{retry=JSON.parse(storageGet(retryKey,'null'));}catch{}
 const signature=JSON.stringify(payload);payload.requestId=retry?.signature===signature?retry.id:crypto.randomUUID();storageSet(retryKey,JSON.stringify({signature,id:payload.requestId}));
 try{
  const {review}=await api(payload);data.reviews=data.reviews.filter(r=>r.id!==review.id).concat(review);
  try{localStorage.removeItem(draftKey());localStorage.removeItem(retryKey);}catch{}
  message('save-message',`Saved for everyone · ${statusLabels[status]}. You can stop here or continue.`);renderNotes();renderNav();
 }catch(e){message('save-message',e.message+' Your text is still here.',true);}
 finally{saving=false;document.querySelectorAll('button').forEach(b=>b.disabled=false);$('comment').disabled=false;$('reviewer-name').disabled=false;const i=data.sections.indexOf(active);$('previous').disabled=i===0;$('next').disabled=i===data.sections.length-1;}
}
$('save-draft').onclick=()=>save('draft');$('save-approved').onclick=()=>save('approved');$('save-changes').onclick=()=>save('changes');
for(const [id,delta] of [['previous',-1],['next',1]])$(id).onclick=()=>{const s=data.sections[data.sections.indexOf(active)+delta];if(s){select(s);$('main').focus();$('main').scrollIntoView({behavior:'smooth',block:'start'});}};
await load().catch(e=>{if(e.status!==401)message('login-message',e.message,true);});
