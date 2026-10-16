import {get,put} from '@vercel/blob';
import {createHandler} from '../lib/review-handler.mjs';
const path='cassola/native-review/events-v1.json';
const store={
  async read(){const result=await get(path,{access:'private',useCache:false});if(!result)return {events:[],etag:null};if(result.statusCode!==200)throw Error('Storage read failed');return {events:JSON.parse(await new Response(result.stream).text()),etag:result.blob.etag};},
  async write(events,etag){try{await put(path,JSON.stringify(events),{access:'private',addRandomSuffix:false,allowOverwrite:!!etag,...(etag?{ifMatch:etag}:{}),contentType:'application/json'});}catch(e){if(/Precondition|AlreadyExists|Conflict/.test(e.constructor.name)||/already exists/i.test(e.message)||[409,412].includes(e.status))e.conflict=true;throw e;}}
};
export default (req,res)=>createHandler({store,secret:process.env.REVIEW_ACCESS_CODE})(req,res);
