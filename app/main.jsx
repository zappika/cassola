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

    const SCENARIOS = [
      { ca: 'Entrant al restaurant', en: 'walking in',  available: true, color: C.red,  rot: -1.5 },
      { ca: 'Reservar per telèfon',  en: 'booking',     available: false,  color: C.blue, rot:  1   },
      { ca: 'Demanant la carta',     en: 'menu',        available: false, color: C.green,rot: -1   },
      { ca: 'Demanant el compte',    en: 'check',       available: false,  color: C.ink,  rot:  1.5 },
    ];

    function getDayLabel() {
      const days = ['DIUMENGE','DILLUNS','DIMARTS','DIMECRES','DIJOUS','DIVENDRES','DISSABTE'];
      const now = new Date();
      const hh = String(now.getHours()).padStart(2,'0');
      const mm = String(now.getMinutes()).padStart(2,'0');
      return `${days[now.getDay()]} · ${hh}:${mm}`;
    }

    function HomeScreen({ onOpen,progressPanel }) {
      return (
        <div style={{
          maxWidth: 430,
          margin: '0 auto',
          minHeight: '100vh',
          background: C.yellow,
          padding: '54px 22px 40px',
          color: C.ink,
          position: 'relative',
        }}>
          {/* header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 700 }}>
                {getDayLabel()}
              </div>
              <div style={{ fontWeight: 800, fontSize: 32, lineHeight: 0.95, marginTop: 4, letterSpacing: -1, transform: 'rotate(-1deg)', transformOrigin: 'left' }}>
                HOLA<br/>NOIA!
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
              <Sticker bg={C.cream} color={C.ink} rot={4} size={10}>ESBORRANY · DRAFT</Sticker>
              
            </div>
          </div>

          {/* full-flow card */}
          <div style={{
            background: C.red, color: C.cream,
            border: `2.5px solid ${C.ink}`,
            borderRadius: 16, padding: 16, marginBottom: 16,
            boxShadow: `5px 5px 0 ${C.ink}`,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', right: -14, bottom: -16, opacity: 0.98 }}>
              <CassolaMascot size={120}/>
            </div>
            <Sticker bg={C.yellow} color={C.ink} rot={-3} size={10} style={{ boxShadow: `2px 2px 0 ${C.ink}` }}>
              MODE COMPLET
            </Sticker>
            <div style={{ fontWeight: 800, fontSize: 26, lineHeight: 0.95, marginTop: 10, maxWidth: 190, letterSpacing: -0.8 }}>
              UN SOPAR DE CAP A PEUS
            </div>
            <div style={{ fontSize: 12, opacity: 0.95, marginTop: 8, maxWidth: 180, lineHeight: 1.4 }}>
              Reserva, entrar, demanar, pagar. Amb curveballs.
            </div>
            <button disabled style={{
              marginTop: 12,
              background: C.yellow, color: C.ink,
              border: `2.5px solid ${C.ink}`,
              borderRadius: 8, padding: '8px 14px',
              fontSize: 13, fontWeight: 800,
              boxShadow: `3px 3px 0 ${C.ink}`,
            }}>
              Coming soon
            </button>
          </div>

          {progressPanel}
          {/* scenario list */}
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>
            O TRIA UNA ESCENA
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SCENARIOS.map((s, i) => (
              <button key={s.en} disabled={!s.available} onClick={() => onOpen(s)} style={{
                width: "100%", textAlign: "left", color: C.ink, fontFamily: "inherit",
                background: C.cream,
                border: `2.5px solid ${C.ink}`,
                borderRadius: 12, padding: '10px 12px',
                display: 'flex', alignItems: 'center', gap: 12,
                boxShadow: `3px 3px 0 ${C.ink}`,
                transform: `rotate(${s.rot * 0.4}deg)`,
                cursor: s.available ? 'pointer' : 'default',
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: s.color, border: `2.5px solid ${C.ink}`, flexShrink: 0 }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{s.ca}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    {s.en} · {s.available ? 'Guided practice' : 'Coming soon'}
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{s.available ? '→' : '—'}</div>
              </button>
            ))}
          </div>
        </div>
      );
    }

const {useState,useEffect,useRef}=React;
function Copy({value,english}){return value?<><div lang="ca">{value.ca}</div>{english&&value.en&&<div className="english" lang="en">{value.en}</div>}</>:null;}
function Unavailable(){return <div className="notice" lang="en"><strong>Coming soon</strong><br/>Audio, speaking practice and the independent final exchange are not available yet.</div>;}
function ScenarioScreen({onBack,onStart,resuming,progressPanel}){
 return <div className="lesson-shell"><button className="text-button" onClick={onBack}>← Inici / Home</button>
 <div className="cover"><Sticker bg={C.yellow} color={C.ink} size={10}>WALKING IN</Sticker><h1>ENTRANT AL RESTAURANT</h1><p>Amb reserva, sense reserva o arribant tard.</p><p className="english">With a booking, without one, or arriving late. Learn to ask for repetition, too.</p></div>
 <div className="panel"><strong>Pràctica guiada · Guided practice</strong><p lang="en">Choose replies, build phrases and write in your own words. There are eight guided exercises. Reading replaces listening for now.</p><p lang="en">Draft Catalan awaiting native-speaker review. Progress is saved in this browser when storage is available. It does not sync between devices.</p></div>
 {progressPanel}<Unavailable/><div className="mascot"><CassolaMascot size={105}/></div><button className="primary" onClick={onStart}>{resuming?'CONTINUA / RESUME →':'COMENÇA →'}</button></div>;
}
function Exercise({exercise:e,lesson,onFinish,onDraft,draft,index,total}){
 const rule=lesson.answer_rules.find(r=>r.id===e.rule_id);
 const situation=lesson.situations.find(s=>s.id===e.situation_id);
 const [initial]=useState(()=>draft||makeDraft(e,shuffle(e.options||e.chunks||[])));
 const [order]=useState(()=>initial.order.map(id=>(e.options||e.chunks||[]).find(x=>x.id===id)));
 const [picked,setPicked]=useState(initial.picked),[chunks,setChunks]=useState(initial.chunks),[answer,setAnswer]=useState(initial.answer);
 const [english,setEnglish]=useState(initial.english),[hint,setHint]=useState(initial.hint),[model,setModel]=useState(initial.model);
 const [result,setResult]=useState(initial.result),[previous,setPrevious]=useState(initial.previous),[assisted,setAssisted]=useState(initial.assisted);
 const [submissions,setSubmissions]=useState(initial.submissions);
 useEffect(()=>{onDraft({id:e.id,order:initial.order,picked,chunks,answer,english,hint,model,result,previous,assisted,submissions});},[picked,chunks,answer,english,hint,model,result,previous,assisted,submissions]);
 const feedback=useRef(null),heading=useRef(null);
 useEffect(()=>heading.current?.focus(),[]);
 useEffect(()=>{if(result)feedback.current?.focus();},[result]);
 const typed=e.type==='type',built=e.type==='build',choice=!!e.options;
 const success=result?.outcome==='communicated';
 function changed(fn){fn();setResult(null);}
 function check(event){event.preventDefault();if(success)return;
  const next=choice?evaluateChoice(e,picked):evaluate({text:built?assemble(e.chunks,chunks):answer,rule,facts:situation.facts,known:e.known_to_staff||{},previous});
  setSubmissions([...submissions,{outcome:next.outcome,at:Date.now(),input:choice?picked:built?assemble(e.chunks,chunks):answer,assisted}]);
  setResult(next);if(next.outcome==='needs_information'&&!choice)setPrevious(next.details);
  if(next.outcome!=='communicated')setAssisted(true);
 }
 const modelText=rule.accepted_responses[0].replace(/\{(\w+)\}/g,(_,k)=>situation.facts[k]??'');
 const notes=lesson.teaching_notes.filter(n=>n.before_exercise===e.id);
 return <section aria-label="Exercise">
  <div className="exercise-heading"><h2 ref={heading} tabIndex="-1">{index+1}/{total} · {built?'Construeix':typed?'Escriu':e.type==='listen_choice'?'Llegeix':'Tria'}</h2><button className="small" aria-pressed={english} onClick={()=>{setEnglish(!english);if(!english)setAssisted(true);}}>English help {english?'on':'off'}</button></div>
  <div className="context"><div className="kicker">LA SITUACIÓ</div><Copy value={situation.context} english={english}/></div>
  <div className="goal"><Copy value={rule.goal} english={english}/>{e.instruction&&<p><Copy value={e.id==='listen-booking'?{ca:'Llegeix la pregunta.',en:'Read the staff’s question.'}:e.instruction} english={english}/></p>}</div>
  {e.type==='listen_choice'&&<p className="notice" lang="en">Audio coming soon — read the staff’s words for this exercise. This does not assess listening.</p>}
  {notes.map(n=><div className="teaching" key={n.id}><Copy value={n.text} english={english}/></div>)}
  <div className="staff"><div className="kicker">PERSONAL DEL RESTAURANT</div><Copy value={e.staff} english={english}/></div>
  <form onSubmit={check}>
   {choice&&<fieldset disabled={success}><legend>La teva resposta</legend><div className="choices">{order.map(o=><label key={o.id} className={'choice '+(picked===o.id?'selected':'')}><input type="radio" name={e.id} value={o.id} checked={picked===o.id} onChange={()=>changed(()=>setPicked(o.id))}/><span><Copy value={o.text} english={english}/></span></label>)}</div></fieldset>}
   {built&&<fieldset disabled={success}><legend>Construeix la resposta</legend><p className="english" lang="en">Choose chunks in order. You don’t have to use them all. Select a chosen chunk to remove it.</p><div className="assembly" aria-live="polite">{chunks.length?chunks.map((id,i)=><button className="chunk selected" type="button" key={id} aria-label={`Remove chunk ${i+1}: ${e.chunks.find(c=>c.id===id).text}`} onClick={()=>changed(()=>setChunks(chunks.filter(c=>c!==id)))}>{e.chunks.find(c=>c.id===id).text} ×</button>):<span className="english">La teva frase…</span>}</div><div className="chunks">{order.map(c=><button className="chunk" type="button" key={c.id} disabled={success||chunks.includes(c.id)} onClick={()=>changed(()=>setChunks([...chunks,c.id]))}>{c.text}</button>)}</div><button className="small" type="button" disabled={!chunks.length||success} onClick={()=>changed(()=>setChunks(chunks.slice(0,-1)))}>Desfés / Undo</button></fieldset>}
   {typed&&<div><label htmlFor="answer">La teva resposta</label><textarea id="answer" value={answer} disabled={success} maxLength={500} rows={3} spellCheck lang="ca" onChange={event=>changed(()=>setAnswer(event.target.value))}/><p className="english" lang="en">Use your own words. Formal and longer answers are welcome.</p></div>}
   <div className="help"><button className="small" type="button" aria-expanded={hint} onClick={()=>{setHint(!hint);setAssisted(true);}}>Pista / Hint</button><button className="small" type="button" aria-expanded={model} onClick={()=>{setModel(!model);setAssisted(true);}}>Exemple / Example</button></div>
   {hint&&<div className="teaching"><Copy value={rule.hint} english={english}/></div>}{model&&<div className="teaching" lang="ca">{modelText}</div>}
   {result&&<div className={'feedback '+(success?'success':'')} ref={feedback} tabIndex="-1" role="status"><strong>{success?'Missatge comunicat':result.outcome==='needs_information'?'Falta una dada':result.outcome==='uncertain'?'Pots dir-ho d’una altra manera?':'Revisa la situació'}</strong>
    {result.outcome==='needs_information'?result.missing_details.map(k=><p key={k}><Copy value={lesson.feedback.missing_details[k]} english={english}/></p>):<p><Copy value={lesson.feedback[result.outcome]} english={english}/></p>}
    {result.outcome==='uncertain'&&<p className="english" lang="en">Your answer may be valid. This draft checker cannot assess it confidently. Try rephrasing or use an example.</p>}
    {result.outcome==='needs_information'&&!choice&&<p className="english" lang="en">You can add just the missing detail, or edit your full answer.</p>}
    {success&&e.on_success&&<div className="staff"><Copy value={e.on_success.acknowledgement} english={english}/><Copy value={e.staff} english={english}/></div>}
   </div>}
   {!success&&<button className="primary" type="submit" disabled={choice?picked===null:built?!chunks.length:!answer.trim()}>COMPROVA</button>}
  </form>
  {success?<button className="primary" onClick={()=>onFinish({id:e.id,outcome:'communicated',assisted})}>CONTINUA →</button>:<button className="text-button skip" onClick={()=>onFinish({id:e.id,outcome:'skipped',assisted:true})}>Deixa-ho per més tard / Skip for now</button>}
 </section>;
}
function PracticeScreen({lesson,onExit,progress,onChange,storageNotice}){
 const exercises=supportedExercises(lesson),attempts=progress.session.finished,index=attempts.length;
 const complete=attempts.filter(a=>a.outcome==='communicated').length;
 function next(attempt){onChange(p=>finishExercise(p,attempt,lesson));window.scrollTo(0,0);}
 return <div className="lesson-shell"><div className="practice-top"><button className="text-button" onClick={onExit} aria-label="Exit practice">✕</button><div className="session-progress"><div className="progress-track" role="progressbar" aria-label="Guided exercises visited" aria-valuenow={index} aria-valuemin={0} aria-valuemax={exercises.length}><div style={{width:`${index/exercises.length*100}%`}}/></div><small>{index}/{exercises.length} visited · {complete} communicated</small></div><Sticker bg={C.cream} color={C.ink} size={9}>DRAFT</Sticker></div>
 {storageNotice&&<p className="notice" role="status">{storageNotice}</p>}<p className="session-note" lang="en">Guided practice · progress saves in this browser when storage is available.</p>
 {index<exercises.length?<Exercise key={exercises[index].id} exercise={exercises[index]} lesson={lesson} draft={progress.session.draft} onDraft={draft=>onChange(p=>saveDraft(p,draft))} onFinish={next} index={index} total={exercises.length}/>:<div className="summary"><CassolaMascot size={120}/><h1>PRÀCTICA FETA.</h1><p lang="en">You communicated the goal in {complete} of {exercises.length} guided exercises. {attempts.filter(a=>a.outcome==='skipped').length} skipped.</p><p lang="en">This was guided practice, not an independent assessment. {attempts.filter(a=>a.assisted&&a.outcome==='communicated').length} successful exercises used help or corrective feedback.</p><Unavailable/><button className="primary" onClick={()=>onChange(p=>({...p,session:newSession()}))}>TORNA-HI / PRACTISE AGAIN</button><button className="text-button" onClick={onExit}>Inici / Home</button></div>}
 </div>;
}
function ProgressPanel({progress,lesson,onReset,notice}){
 const [confirm,setConfirm]=useState(false);
 const stats=progressSummary(progress),visited=progress.session?.finished.length||0,total=supportedExercises(lesson).length;
 return <div className="panel" lang="en"><strong>Your Walking in practice</strong>
 <p>{stats.communicated}/{total} goals communicated in guided practice · {stats.runs} runs finished · {stats.submissions} answers checked.</p>
 {progress.session&&<p>Current run: {visited}/{total} exercises visited{visited<total?' — ready to resume.':'.'}</p>}
 {progress.evidence.status&&<p>Practised with support. Independent completion is not available yet.</p>}
 {stats.revisit&&<p><strong>Revisit later · Ready for another practice</strong><br/>It has been at least 24 hours. Your previous practice still counts.</p>}
 {progress.lastActivity!==null&&<p className="english">Last activity: {new Date(progress.lastActivity).toLocaleString()}</p>}
 {progress.previousVersions.map((v,i)=><p className="english" key={i}>Earlier lesson {v.version}: {v.evidence.communicated.length} guided goals, {v.evidence.runs} runs. Kept separately from this version.</p>)}
 {notice&&<p className="notice" role="status">{notice}</p>}
 <p className="english">Saved only in this browser. No recordings or account data.</p>
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
 const panel=<ProgressPanel progress={progress} lesson={lesson} onReset={reset} notice={storageError||notice}/>;
 if(screen==='practice')return <PracticeScreen lesson={lesson} progress={progress} onChange={change} storageNotice={storageError||notice} onExit={()=>setScreen('home')}/>;
 if(screen==='scenario')return <ScenarioScreen progressPanel={panel} resuming={!!progress.session} onBack={()=>setScreen('home')} onStart={()=>{if(!progressRef.current.session)change(p=>({...p,session:newSession(),lastActivity:Date.now()}));setScreen('practice');}}/>;
 return <HomeScreen progressPanel={panel} onOpen={s=>{if(s.available)setScreen('scenario');}}/>;
}
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
