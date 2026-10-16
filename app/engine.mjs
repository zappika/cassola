// Small, conservative grammar for this lesson. Unknown clauses never earn success.
export function normalize(text) {
  return String(text).normalize('NFC').toLowerCase().replace(/[’‘]/g,"'")
    .replace(/[.,!?;:…]/g,' ').replace(/\s+/g,' ').trim();
}
export function shuffle(items, random=Math.random) {
  const copy=[...items];
  for(let i=copy.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}
  return copy;
}
export function assemble(chunks,ids){return ids.map(id=>chunks.find(c=>c.id===id)?.text||'').join(' ');}
const numbers={un:1,una:1,dos:2,dues:2,tres:3,quatre:4};
const number=value=>numbers[value]??Number(value);
const nameKey=value=>normalize(value).replace(/\bmarti(?=\s|$)/g,'martí');
export function evaluate({text,rule,facts,known={},previous={}}) {
  const required=Object.fromEntries(Object.entries(rule.required_details).map(([k,v])=>[k,typeof v==='string'&&v.startsWith('$')?facts[v.slice(1)]:v]));
  if(required.name)required.name=nameKey(required.name);
  const result=(outcome,details={},missing_details=[])=>({outcome,missing_details,details,style_notes:[]});
  let rest=normalize(text);
  if(!rest)return result('needs_information',{},Object.keys(required));
  const details={...known,...previous};
  if(details.name)details.name=nameKey(details.name);
  let conflict=false,unknown=false;
  const record=(key,value)=>{
    if(key==='name')value=nameKey(value);
    const expected=key==='name'?nameKey(facts.name||''):facts[key];
    if(expected!==undefined&&expected!==null&&value!==expected)conflict=true;
    if(Object.hasOwn(details,key)&&details[key]!==value)conflict=true;
    details[key]=value;
  };
  // Exact authored examples bootstrap accepted formulations; compositional rules
  // below also accept new combinations and concrete names/numbers, not a whitelist.
  const authored=rule.accepted_responses.some(example=>nameKey(example.replace(/\{(\w+)\}/g,(_,k)=>facts[k]??''))===nameKey(text));
  if(authored){for(const [k,v] of Object.entries(required))record(k,v);return result(conflict?'different_meaning':'communicated',details);}
  const n='(un|una|dos|dues|tres|quatre|[0-9]+)';
  const patterns=[
    [/^(?:si us plau|sisplau|bon vespre|bona nit|bon dia|hola|però|i)(?=\s|$)/,()=>{}],
    [/^no és cert que (?:tinguem|tingui) reserva(?=\s|$)/,()=>record('reservation',false)],
    [/^(?:no (?:tenim|tinc) (?:cap )?reserva|no (?:hem|he) reservat)(?=\s|$)/,()=>record('reservation',false)],
    [/^(?:(?:tinc|tenim) (?:una )?(?:taula reservada|reserva)|(?:he|hem) reservat)(?=\s|$)/,()=>record('reservation',true)],
    [/^voldria confirmar la meva reserva(?=\s|$)/,()=>record('reservation',true)],
    [/^(?:la reserva és )?a nom de ([a-zà-ÿ]+)(?=\s|$)/,m=>record('name',m[1])],
    [new RegExp('^(?:som|per a|per) '+n+'(?: persones)?(?=\\s|$)'),m=>record('party_size',number(m[1]))],
    [/^(?:teniu (?:una )?(?:taula|lloc)|hi (?:ha|hauria) (?:una|alguna) taula(?: disponible)?|(?:voldríem|voldria|volem) una taula)(?=\s|$)/,()=>record('availability_request',true)],
    [/^(?:encara (?:tenim|teniu) (?:la )?taula(?: reservada)?|encara ens podeu donar la taula)(?=\s|$)/,()=>record('table_still_available_request',true)],
    [/^(?:arribem tard|hem arribat tard)(?=\s|$)/,()=>record('late_acknowledgement',true)],
    [/^(?:el trànsit estava fatal|ho sento(?: moltíssim)?|perdó)(?=\s|$)/,()=>{if(facts.minutes_late>0)record('late_acknowledgement',true);}],
    [/^(?:ho podeu repetir|pots repetir-ho|podeu repetir-ho|una altra vegada)(?=\s|$)/,()=>record('repeat_request',true)],
    [/^(?:no ho repeteixis|no ho repetiu|no volem (?:la )?taula|marxem)(?=\s|$)/,()=>{conflict=true;}],
    [/^(?:d'acord|gràcies|perfecte|correcte|exacte)(?=\s|$)/,()=>record('accept_seating',true)],
    [/^(?:ens pregunten si hem reservat|si tenim reserva)(?=\s|$)/,()=>record('question_topic','reservation')],
    [/^(?:si volem pagar|què volem menjar)(?=\s|$)/,()=>{conflict=true;}],
    [/^(?:sí|si)(?=\s|$)/,()=>{if(rule.id==='confirm-booking')record('reservation',true);}],
    [/^no(?=\s|$)/,()=>{if(['confirm-booking','request-table'].includes(rule.id))record('reservation',false);else unknown=true;}]
  ];
  // Bare name/number is sufficient when that is the current question.
  if(rule.id==='give-name'&&nameKey(rest)===nameKey(facts.name||'')) {record('name',rest);rest='';}
  if(rule.id==='give-size'&&new RegExp('^'+n+'$').test(rest)) {record('party_size',number(rest));rest='';}
  while(rest){
    let consumed=false;
    for(const [pattern,apply] of patterns){const match=rest.match(pattern);if(match){apply(match);rest=rest.slice(match[0].length).trim();consumed=true;break;}}
    if(!consumed){unknown=true;break;}
  }
  if(conflict)return result('different_meaning');
  if(unknown)return result('uncertain');
  const missing=Object.keys(required).filter(k=>details[k]!==required[k]);
  return result(missing.length?'needs_information':'communicated',details,missing);
}
export function evaluateChoice(exercise,id){
  const option=exercise.options.find(o=>o.id===id);
  return option?{outcome:option.expected_outcome,missing_details:option.missing_details,details:{},style_notes:[]}:{outcome:'uncertain',missing_details:[],details:{},style_notes:[]};
}
export const supportedExercises=lesson=>lesson.exercises.filter(e=>['listen_choice','choice','build','type'].includes(e.type));
