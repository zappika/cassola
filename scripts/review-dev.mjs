// Local-only integration preview. No cloud calls and no production reviews.
import http from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createHandler} from '../lib/review-handler.mjs';
const root=resolve(import.meta.dirname,'..');
const file='/private/tmp/cassola-review-dev.json';
let events=[];try{events=JSON.parse(await readFile(file,'utf8'));}catch{}
let revision=0;
const store={read:async()=>({events:[...events],etag:revision}),write:async(next,etag)=>{if(etag!==revision)throw Object.assign(Error('conflict'),{conflict:true});events=next;revision++;await writeFile(file,JSON.stringify(events));}};
const handler=createHandler({store,secret:'local-review',secureCookies:false});
const types={'.mp3':'audio/mpeg','.html':'text/html','.css':'text/css','.mjs':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'};
http.createServer(async(req,res)=>{
 try{
  if(req.url==='/api/reviews'){
   let body='';for await(const chunk of req){body+=chunk;if(body.length>12000){res.writeHead(413);res.end();return;}}req.body=body;
   res.status=n=>{res.statusCode=n;return res;};res.json=data=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));};await handler(req,res);return;
  }
  let path=new URL(req.url,'http://localhost').pathname;if(path==='/review'||path==='/review/')path='/review/index.html';if(path==='/')path='/index.html';
  const target=resolve(root,'.'+path);if(!target.startsWith(root+'/')){res.writeHead(403);res.end();return;}
  const data=await readFile(target);res.writeHead(200,{'Content-Type':types[extname(target)]||'application/octet-stream'});res.end(data);
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(4321,'127.0.0.1',()=>console.log('Local preview http://127.0.0.1:4321/review · code: local-review · local test data only'));
