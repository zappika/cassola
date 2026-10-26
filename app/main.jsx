import {clipFor,player} from '/app/audio.mjs';
import {conversationHistory,turnContext,sentReply,makeSubmission} from '/app/conversation.mjs';
import {glossText,responseEnglish} from '/app/language-help.mjs';
import {readProgress,writeProgress,resetProgress,newSession,makeDraft,saveDraft,finishExercise,progressSummary} from '/app/progress.mjs';
import {evaluate, evaluateChoice, shuffle, assemble, supportedExercises} from '/app/engine.mjs';

    const C = {
      yellow:    '#FFD23F',
      yellowDeep:'#E9B91A',
      red:       '#E83A2F',
      ink:       '#141210',
      cream:     '#FFF6E0',
      green:     '#1F8A52',
      blue:      '#2840B5',
      muted:     '#6E6557',
    };

    function CassolaMascot({ size = 130, expression = 'happy' }) {
      return (
        <svg viewBox="0 0 140 130" width={size} height={size * (130/140)}>
          <g transform="translate(4,4)">
            <path d="M20 38 L 120 38 L 110 110 Q 70 122 30 110 Z" fill={C.ink}/>
            <ellipse cx="70" cy="38" rx="50" ry="10" fill={C.ink}/>
          </g>
          <path d="M20 38 L 120 38 L 110 110 Q 70 122 30 110 Z" fill={C.red} stroke={C.ink} strokeWidth="4" strokeLinejoin="round"/>
          <ellipse cx="70" cy="38" rx="50" ry="10" fill={C.red} stroke={C.ink} strokeWidth="4"/>
          <ellipse cx="70" cy="35" rx="46" ry="6" fill={C.ink} opacity="0.25"/>
          <ellipse cx="14" cy="60" rx="6" ry="14" fill={C.red} stroke={C.ink} strokeWidth="4"/>
          <ellipse cx="126" cy="60" rx="6" ry="14" fill={C.red} stroke={C.ink} strokeWidth="4"/>
          <circle cx="55" cy="68" r="9" fill={C.cream} stroke={C.ink} strokeWidth="3"/>
          <circle cx="85" cy="68" r="9" fill={C.cream} stroke={C.ink} strokeWidth="3"/>
          <circle cx="56" cy="70" r="4" fill={C.ink}/>
          <circle cx="86" cy="70" r="4" fill={C.ink}/>
          <circle cx="57" cy="68" r="1.5" fill={C.cream}/>
          <circle cx="87" cy="68" r="1.5" fill={C.cream}/>
          {expression === 'happy' && <path d="M52 88 Q 70 102 88 88" stroke={C.ink} strokeWidth="4" fill="none" strokeLinecap="round"/>}
          {expression === 'oh'    && <ellipse cx="70" cy="92" rx="7" ry="9" fill={C.ink}/>}
          <circle cx="40" cy="88" r="4" fill={C.yellow} opacity="0.9"/>
          <circle cx="100" cy="88" r="4" fill={C.yellow} opacity="0.9"/>
          <path d="M55 22 Q 50 14 58 8" stroke={C.ink} strokeWidth="3" fill="none" strokeLinecap="round"/>
          <path d="M70 18 Q 65 10 73 4" stroke={C.ink} strokeWidth="3" fill="none" strokeLinecap="round"/>
          <path d="M85 22 Q 80 14 88 8" stroke={C.ink} strokeWidth="3" fill="none" strokeLinecap="round"/>
        </svg>
      );
    }

    function Sticker({ children, bg = C.red, color = C.cream, rot = -3, size = 13, style = {} }) {
      return (
        <span style={{
          display: 'inline-block', background: bg, color,
          padding: '6px 12px',
          border: `2.5px solid ${C.ink}`,
          borderRadius: 8, fontWeight: 800, fontSize: size,
          transform: `rotate(${rot}deg)`,
          boxShadow: `3px 3px 0 ${C.ink}`,
          fontFamily: "'IBM Plex Mono', monospace",
          letterSpacing: 0.5,
          lineHeight: 1,
          whiteSpace: 'nowrap',
          ...style,
        }}>{children}</span>
      );
    }

function HomeScreen({onStart,progress,lesson,progressPanel,notice}){
 const total=supportedExercises(lesson).length,finished=progress.session?.finished.length||0;
 const resuming=false;
 const revisit=progressSummary(progress).revisit;
 return <main className="home-shell">
 <header className="home-brand"><strong>cassola</strong><span>Català a foc lent.</span></header>
 <div className="home-greeting"><h1>Una mica de<br/><em>conversa?</em></h1><CassolaMascot size={112}/></div>
 <section className="home-invitation" aria-label="Walking in">
 <Sticker bg={C.yellow} color={C.ink} size={10}>ENTRANT AL RESTAURANT</Sticker>
 <h2>La primera paraula?<br/>Bona nit.</h2>
 <p>A table for two. A little Catalan.<br/>Let’s see where it takes you.</p>
 <button className="home-start" onClick={onStart}>{resuming?'CONTINUEM →':finished===total?'TORNEM-HI →':'SOM-HI →'}</button>
 {resuming&&<small>Your conversation is right where you left it.</small>}
 {!resuming&&revisit&&<small>Back for another chat?</small>}
 </section>
 {notice&&<p className="notice" role="status">{notice}</p>}
 <section className="home-next" aria-label="Coming soon"><div className="home-next-label">Encara al foc <span>· coming soon</span></div>
 <div className="future-scenes"><span className="future-scene booking">☎<span>Una reserva</span></span><span className="future-scene menu">☰<span>La carta</span></span><span className="future-scene bill">€<span>El compte</span></span></div>
 </section>
 <footer className="home-footer"><details><summary>Your practice</summary>{progressPanel}</details>
 <details><summary>A little about Cassola</summary><p>Small restaurant conversations, with Caçó by your side. Three waiter lines now have trial audio; the rest is text for now. Speaking comes later.</p><p>Our Catalan and trial voices are awaiting native-speaker review.</p></details></footer>
 </main>;
}

const {useState,useEffect,useRef}=React;
// Lift the last two bubbles to the top of the thread (scrolling the thread, never the page, so nothing jumps).
// The spacer at the end gives the thread enough room to scroll that far.
function toLatest(el){
 const thread=el?.closest('.conversation-thread'),spacer=thread?.querySelector('.thread-spacer');if(!thread||!spacer)return;
 const messages=thread.querySelectorAll('.chat-message'),target=messages.length>1?messages[messages.length-2]:null;
 const top=target?target.offsetTop-12:0;
 spacer.style.height='0px';spacer.style.height=Math.max(0,thread.clientHeight-(thread.scrollHeight-top))+'px';
 thread.scrollTo({top,behavior:'smooth'});
}
function Copy({value,english}){return value?<><div lang="ca">{value.ca}</div>{english&&value.en&&<div className="english" lang="en">{value.en}</div>}</>:null;}
function WordMeaning({text,meaning,onHelp}){
 const [open,setOpen]=useState(false),[position,setPosition]=useState({}),root=useRef(null),id=React.useId();
 function show(){const rect=root.current.getBoundingClientRect();setPosition({left:Math.max(12,Math.min(rect.left,window.innerWidth-212)),top:Math.min(rect.bottom+8,window.innerHeight-80)});setOpen(true);onHelp?.();}
 useEffect(()=>{if(!open)return;const close=event=>{if(!root.current?.contains(event.target))setOpen(false);};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close);},[open]);
 return <span className="word-meaning" ref={root} onPointerEnter={event=>{if(event.pointerType==='mouse')show();}} onPointerLeave={()=>setOpen(false)}>
 <button type="button" className="word" aria-label={text} aria-description="English meaning" aria-expanded={open} aria-describedby={open?id:undefined} onClick={event=>{event.stopPropagation();show();}} onFocus={event=>{if(event.target.matches(':focus-visible'))show();}} onBlur={()=>setOpen(false)} onKeyDown={event=>{if(event.key==='Escape'){setOpen(false);event.stopPropagation();}}}>{text}</button>
 {open&&<span className="word-tooltip" style={position} id={id} role="tooltip" lang="en">{meaning}</span>}</span>;
}
function Glossed({text,onHelp}){return <span lang="ca">{glossText(text).map((part,i)=>part.meaning?<WordMeaning key={i} {...part} onHelp={onHelp}/>:part.text)}</span>;}
function SentMessages({exercise,submissions,lesson}){
 return submissions.map((submission,i)=>{const reply=sentReply(exercise,submission),missing=submission.missing||exercise.options?.find(o=>o.id===submission.input)?.missing_details||[];return <React.Fragment key={i}>
 <div className="chat-message learner" aria-label={exercise.id==='listen-booking'?'Your interpretation':'Your reply'}><Copy value={reply} english/></div>
 {submission.outcome!=='communicated'&&<div className="delivery">
 {submission.outcome==='needs_information'?'Falta una dada':submission.outcome==='uncertain'?'Provem-ho d’una altra manera':'Revisa la situació'}
 </div>}
 {submission.outcome!=='communicated'&&<div className="chat-coaching" lang="en">{submission.outcome==='needs_information'&&missing.length?missing.map(k=><p key={k}>{lesson.feedback.missing_details[k]?.en}</p>):submission.outcome==='uncertain'?'Your answer may be valid. The checker couldn’t recognise it.':(lesson.feedback[submission.outcome]?.en||'Add the missing detail and send again.')}</div>}
 </React.Fragment>;});
}
const SPEAKER=<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
function AudioButton({lesson,staff,autoPlay=false}){
 const clip=clipFor(lesson,staff),id=React.useId(),manual=useRef(false);
 const [state,setState]=useState(player.getState);
 useEffect(()=>player.subscribe(setState),[]);
 // Read the line out once when it appears; browsers may block this, so failures stay silent.
 useEffect(()=>{if(autoPlay&&clip)player.play(id,clip.path);},[]);
 if(!clip)return null;
 const status=state.key===id?state.status:'idle',busy=['loading','playing'].includes(status);
 return <button type="button" className={'audio-play '+status} title="Voice trial — native listening review pending" aria-label={`${busy?'Stop':'Play'}: ${staff.ca}`} onClick={()=>{manual.current=true;busy?player.stop():player.play(id,clip.path);}}>{SPEAKER}{status==='error'&&manual.current&&<span className="sr-only" role="status">Audio unavailable.</span>}</button>;
}
function ConversationTurn({exercise,previous,lesson,submissions,children,onHelp,active=false}){
 const context=turnContext(lesson,exercise,previous);
 // New turns reveal one bubble at a time: scene, waiter, then your reply.
 const [stage,setStage]=useState(active&&!submissions.length?0:2);
 const root=useRef(null);
 useEffect(()=>{if(active&&stage>0)toLatest(root.current);},[stage]);
 useEffect(()=>{if(stage>=2)return;const t=setTimeout(()=>setStage(stage+1),stage===0?(context.scene?700:0):(context.staff?1500:0));return()=>clearTimeout(t);},[stage]);
 return <section ref={root} className="conversation-turn" aria-label={active?'Current conversation turn':'Earlier conversation turn'}>
 {context.scene&&<div className="scene-message"><Glossed text={context.scene.ca}/></div>}
 {context.staff&&stage>=1&&<div className="chat-message waiter"><div className="waiter-line"><AudioButton lesson={lesson} staff={exercise.staff} autoPlay={active&&stage===1}/><Glossed text={exercise.staff.ca} onHelp={onHelp}/></div>{submissions.length>0&&<div className="english" lang="en">{exercise.staff.en}</div>}</div>}
 {stage>=2&&<>
 <div className="chat-instruction"><Glossed text={context.instruction.ca}/></div>
 <SentMessages exercise={exercise} submissions={submissions} lesson={lesson}/>
 {submissions.at(-1)?.outcome==='communicated'&&exercise.on_success&&<div className="chat-message waiter"><Copy value={exercise.on_success.acknowledgement} english/><Copy value={exercise.staff} english/></div>}
 {children}
 </>}
 </section>;
}
function Exercise({exercise:e,previousExercise,lesson,onFinish,onDraft,draft}){
 const rule=lesson.answer_rules.find(r=>r.id===e.rule_id),situation=lesson.situations.find(s=>s.id===e.situation_id);
 const [initial]=useState(()=>draft||makeDraft(e,shuffle(e.options||e.chunks||[])));
 const [order]=useState(()=>initial.order.map(id=>(e.options||e.chunks||[]).find(x=>x.id===id)));
 const [picked,setPicked]=useState(initial.picked),[chunks,setChunks]=useState(initial.chunks),[answer,setAnswer]=useState(initial.answer);
 const [result,setResult]=useState(initial.result),[previous,setPrevious]=useState(initial.previous),[assisted,setAssisted]=useState(initial.assisted);
 const [submissions,setSubmissions]=useState(initial.submissions);
 // Keep legacy flags in persisted drafts so existing sessions resume without migration.
 useEffect(()=>{onDraft({id:e.id,order:initial.order,picked,chunks,answer,english:initial.english,hint:initial.hint,model:initial.model,result,previous,assisted,submissions});},[picked,chunks,answer,result,previous,assisted,submissions]);
 const anchor=useRef(null);
 useEffect(()=>{toLatest(anchor.current);},[submissions.length]);
 // The reply area mounts after the waiter bubble is revealed, so focus it when it arrives.
 const attach=el=>{if(el&&!anchor.current){anchor.current=el;toLatest(el);el.querySelector('input,textarea,button')?.focus({preventScroll:true});}};
 // Older saved drafts may already have a successful answer awaiting Continue.

 const typed=e.type==='type',built=e.type==='build',choice=!!e.options,success=result?.outcome==='communicated';
 const help=()=>{if(!success)setAssisted(true);};
 function changed(fn){fn();setResult(null);}
 function check(event){event.preventDefault();if(success)return;
  const next=choice?evaluateChoice(e,picked):evaluate({text:built?assemble(e.chunks,chunks):answer,rule,facts:situation.facts,known:e.known_to_staff||{},previous});
  const sent=[...submissions,makeSubmission(e,{picked,chunks,answer,assisted,result:next})];
  if(next.outcome==='communicated'){
   onFinish({id:e.id,outcome:'communicated',assisted},{id:e.id,order:initial.order,picked,chunks,answer,english:initial.english,hint:initial.hint,model:initial.model,result:next,previous,assisted,submissions:sent});return;
  }
  setSubmissions(sent);setResult(next);if(next.outcome==='needs_information'&&!choice)setPrevious(next.details);
  if(next.outcome!=='communicated')setAssisted(true);
 }
 const modelText=rule.accepted_responses[0].replace(/\{(\w+)\}/g,(_,k)=>situation.facts[k]??'');
 return <ConversationTurn exercise={e} previous={previousExercise} lesson={lesson} submissions={submissions} onHelp={help} active>
  <div ref={attach} className="reply-area exercise">
  {!success&&<form onSubmit={check} aria-label="Compose a reply">
  <div className="composer-label">{built?'Construeix la resposta':typed?'Escriu la resposta':'Tria la resposta'}</div>
   {choice&&<fieldset><legend className="sr-only">La teva resposta</legend><div className="choices">{order.map(o=><div key={o.id} className={'choice '+(picked===o.id?'selected':'')} onClick={event=>{if(!success&&!event.target.closest('button'))changed(()=>setPicked(o.id));}}><input type="radio" name={e.id} aria-label={o.text.ca} value={o.id} disabled={success} checked={picked===o.id} onChange={()=>changed(()=>setPicked(o.id))}/><div><Glossed text={o.text.ca} onHelp={help}/></div></div>)}</div></fieldset>}
   {built&&<fieldset disabled={success}><legend className="sr-only">Construeix la resposta</legend><div className="assembly" aria-live="polite">{chunks.length?chunks.map((id,i)=><button className="chunk selected" type="button" key={id} aria-label={`Remove chunk ${i+1}: ${e.chunks.find(c=>c.id===id).text}`} onClick={()=>changed(()=>setChunks(chunks.filter(c=>c!==id)))}>{e.chunks.find(c=>c.id===id).text}</button>):<span className="english">La teva frase…</span>}</div><div className="chunks">{order.map(c=><button className="chunk" type="button" key={c.id} disabled={success||chunks.includes(c.id)} onClick={()=>changed(()=>setChunks([...chunks,c.id]))}>{c.text}</button>)}</div><button className="text-button undo" type="button" disabled={!chunks.length||success} onClick={()=>changed(()=>setChunks(chunks.slice(0,-1)))}>↶ Desfés</button></fieldset>}
   {typed&&<div><label className="sr-only" htmlFor="answer">La teva resposta</label><textarea id="answer" placeholder="Escriu la teva resposta…" value={answer} disabled={success} maxLength={500} rows={3} spellCheck lang="ca" onChange={event=>changed(()=>setAnswer(event.target.value))}/></div>}
   {result&&!choice&&<div className="chat-coaching"><span lang="en">You could say:</span> <span lang="ca">{modelText}</span></div>}
   <button className="primary send" type="submit" disabled={choice?picked===null:built?!chunks.length:!answer.trim()}>ENVIA ↑</button>
  </form>}
  {success&&<button className="primary" onClick={()=>onFinish({id:e.id,outcome:'communicated',assisted})}>Continua la conversa →</button>}
  </div>
 </ConversationTurn>;
}

function PracticeScreen({lesson,onExit,progress,onChange,storageNotice}){
 const exercises=supportedExercises(lesson),attempts=progress.session.finished,index=attempts.length;
 const history=conversationHistory(lesson,progress),end=useRef(null);
 useEffect(()=>{toLatest(end.current);player.stop();return()=>player.stop();},[index]);
 useEffect(()=>{const pause=()=>{if(document.hidden)player.stop();};document.addEventListener('visibilitychange',pause);return()=>document.removeEventListener('visibilitychange',pause);},[]);
 function next(attempt,snapshot){onChange(p=>finishExercise(snapshot?saveDraft(p,snapshot):p,attempt,lesson));}
 return <div className="lesson-shell conversation-shell">
 <header className="conversation-header"><button className="text-button" onClick={onExit} aria-label="Exit conversation">←</button><div><strong>Al restaurant</strong><span>amb en Caçó</span></div><CassolaMascot size={42}/></header>
 {storageNotice&&<p className="notice" role="status">{storageNotice}</p>}
 <div className="conversation-thread" aria-label="Restaurant conversation">
 {history.map(({exercise,step,submissions},i)=><ConversationTurn key={exercise.id} exercise={exercise} previous={exercises[i-1]} lesson={lesson} submissions={submissions}>{!submissions.length&&<p className="chat-instruction" lang="en">{step.outcome==='skipped'?'Previously left for later.':'Earlier reply was not saved.'}</p>}</ConversationTurn>)}
 {index<exercises.length?<Exercise key={exercises[index].id} exercise={exercises[index]} previousExercise={exercises[index-1]} lesson={lesson} draft={progress.session.draft} onDraft={draft=>onChange(p=>saveDraft(p,draft))} onFinish={next}/>:<div className="chat-ending"><h2>Fins aviat!</h2><p lang="en">You communicated {attempts.filter(a=>a.outcome==='communicated').length} arrival goals with support. An independent conversation comes later.</p><button className="primary" onClick={()=>onChange(p=>({...p,session:newSession()}))}>TORNEM A PARLAR →</button><button className="text-button" onClick={onExit}>Inici / Home</button></div>}
 <div ref={end} className="thread-spacer" aria-hidden="true"/>
 </div></div>;
}
function ProgressPanel({progress,lesson,onReset}){
 const [confirm,setConfirm]=useState(false);
 const stats=progressSummary(progress),visited=progress.session?.finished.length||0,total=supportedExercises(lesson).length;
 return <div className="panel" lang="en"><strong>Walking in</strong>
 <p>{stats.communicated}/{total} goals practised · {stats.runs} conversations finished.</p>
 {progress.session&&<p>Current run: {visited}/{total} replies finished{visited<total?' — pick up anytime.':'.'}</p>}

 {stats.revisit&&<p>Ready for another chat? Your earlier practice is saved.</p>}
 {progress.lastActivity!==null&&<p className="english">Last activity: {new Date(progress.lastActivity).toLocaleString()}</p>}
 {progress.previousVersions.map((v,i)=><p className="english" key={i}>Earlier lesson {v.version}: {v.evidence.communicated.length} guided goals, {v.evidence.runs} runs. Kept separately from this version.</p>)}
 <p className="english">Saved in this browser.</p>
 {confirm?<div><p>Erase all Walking in learner progress in this browser? Native reviews are unaffected.</p><button className="small" onClick={()=>{onReset();setConfirm(false);}}>Erase progress</button> <button className="small" onClick={()=>setConfirm(false)}>Cancel</button></div>:<button className="small" onClick={()=>setConfirm(true)}>Reset learner progress</button>}
 </div>;
}
function App(){
 const [screen,setScreen]=useState('home'),[lesson,setLesson]=useState(null),[error,setError]=useState(''),[reload,setReload]=useState(0);
 const [progress,setProgress]=useState(null),[notice,setNotice]=useState(''),[storageError,setStorageError]=useState('');
 const progressRef=useRef(null);
 const storage={getItem:key=>window.localStorage.getItem(key),setItem:(key,value)=>window.localStorage.setItem(key,value),removeItem:key=>window.localStorage.removeItem(key)};
 function change(update){const next=update(progressRef.current);progressRef.current=next;setProgress(next);const saved=writeProgress(storage,next);setStorageError(saved?'':'Progress cannot be saved in this browser. You can continue for now; a reload may restore older progress or lose this session.');}
 function reset(){const result=resetProgress(storage,lesson);progressRef.current=result.progress;setProgress(result.progress);setNotice('');setStorageError(result.removed?'':'Progress was cleared for this session, but browser storage could not be erased. Older progress may return after reload.');}
 useEffect(()=>{const controller=new AbortController();setError('');fetch('/content/walking-in.v2.json',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Lesson unavailable');return r.json();}).then(data=>{if(data.schema_version!==2||!Array.isArray(data.exercises)||!Array.isArray(data.answer_rules)||!Array.isArray(data.situations))throw Error('Invalid lesson');const loaded=readProgress(storage,data);progressRef.current=loaded.progress;setProgress(loaded.progress);setNotice(loaded.notice);setLesson(data);}).catch(e=>{if(e.name!=='AbortError')setError('We couldn’t load the lesson. Please try again.');});return()=>controller.abort();},[reload]);
 if(!lesson||!progress)return <div className="lesson-shell" role="status"><p>{error||'Carregant… / Loading…'}</p>{error&&<button className="primary" onClick={()=>setReload(reload+1)}>Try again</button>}</div>;
 const panel=<ProgressPanel progress={progress} lesson={lesson} onReset={reset}/>;
 if(screen==='practice')return <PracticeScreen lesson={lesson} progress={progress} onChange={change} storageNotice={storageError||notice} onExit={()=>setScreen('home')}/>;
 return <HomeScreen progress={progress} lesson={lesson} progressPanel={panel} notice={storageError||notice} onStart={()=>{change(p=>({...p,session:newSession(),lastActivity:Date.now()}));setScreen('practice');}}/>;
}
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
