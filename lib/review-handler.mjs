import {appendReview,catalog,version,makeSession,sessionId,same,validateSubmission} from './review-service.mjs';
export function createHandler({store, secret, secureCookies=true}) {
return async function handler(req,res){
  res.setHeader('Cache-Control','private, no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  const send=(status,body)=>res.status(status).json(body);
  if(!['GET','POST'].includes(req.method)){res.setHeader('Allow','GET, POST');return send(405,{error:'Method not allowed.'});}
  if(!secret)return send(503,{error:'Shared review is not configured yet. Your browser drafts are safe.'});
  try{
    let body=req.body;
    if(req.method==='POST'){
      if(req.headers.origin&&req.headers.origin!==`${secureCookies?'https':'http'}://${req.headers.host}`)return send(403,{error:'Request origin not allowed.'});
      if(!req.headers['content-type']?.startsWith('application/json'))return send(415,{error:'JSON required.'});
      if(Number(req.headers['content-length'])>12000)return send(413,{error:'Feedback is too long.'});
      if(typeof body==='string')body=JSON.parse(body);
      if(!body||typeof body!=='object')return send(400,{error:'Invalid request.'});
      if(body.action==='login'){
        if(typeof body.code!=='string'||!same(body.code,secret))return send(401,{error:'That review code does not match.'});
        // Keep this browser's identity when re-entering the invite code.
        if(!sessionId(req.headers.cookie,secret))res.setHeader('Set-Cookie',`cassola_review=${makeSession(secret)}; Path=/api/reviews; HttpOnly; ${secureCookies?'Secure; ':''}SameSite=Strict; Max-Age=7776000`);
        return send(200,{ok:true});
      }
    }
    const reviewerId=sessionId(req.headers.cookie,secret);
    if(!reviewerId)return send(401,{error:'Enter the review code to see shared progress.'});
    if(req.method==='GET')return send(200,{sections:catalog,contentVersion:version,reviewerId,reviews:(await store.read()).events});
    const event=validateSubmission(body,reviewerId);
    await appendReview(store,event);
    return send(200,{review:event});
  }catch(err){return send(err.status||503,{error:err.status?err.message:'Shared saving is temporarily unavailable. Your draft is kept; please try again.'});}
}

}
