// Draft glosses for the current lesson; native review remains pending.
// Longest phrases win so idioms such as “si us plau” stay together.
export const glosses = [
 ['Voldria confirmar','I would like to confirm'],['una taula reservada','a table booked'],
 ['Hi hauria','Would there be'],['si us plau','please'],['Bona nit','Good evening'],
 ['A quin nom','Under what name'],['A nom de','Under the name of'],['una mica tard','a little late'],
 ['Quantes persones sou','How many people are you'],['Ho podeu repetir','Could you repeat that'],
 ['Una altra vegada','Once more'],['a l’hora','on time'],
 ['Sou dues persones','You are two people'],['No has entès','You didn’t understand'],
 ['la meva','my'],['per a dos','for two'],['per a dues persones','for two people'],
 ['teniu','you have'],['tenim','we have'],['tinc','I have'],['reserva','booking'],
 ['taula','table'],['disponible','available'],['alguna','any'],['lloc','room'],
 ['arribeu','you arrive'],['arribem','we arrive'],['tard','late'],['encara','still'],
 ['perdó','sorry'],['gràcies','thank you'],['però','but'],
 ['volem','we want'],['menjar','to eat'],['pagar','to pay'],['digues','say'],
 ['demana','ask for'],['pregunta','question'],['repeteixin','repeat it'],
 ['identifica','identify'],['què et pregunten','what they are asking you'],
 ['reconeix','acknowledge'],['retard','lateness'],['persones','people'],['nom','name']
].filter(([ca],i,all)=>all.findIndex(([other])=>other===ca)===i);
const word=c=>c&&/[\p{L}\p{N}]/u.test(c);
export function glossText(text){
 const source=String(text),lower=source.toLocaleLowerCase('ca'),entries=[...glosses].sort((a,b)=>b[0].length-a[0].length);
 const parts=[];let plain='';
 for(let i=0;i<source.length;){
  const match=entries.find(([ca])=>lower.startsWith(ca.toLocaleLowerCase('ca'),i)&&!word(source[i-1])&&!word(source[i+ca.length]));
  if(match){if(plain){parts.push({text:plain});plain='';}parts.push({text:source.slice(i,i+match[0].length),meaning:match[1]});i+=match[0].length;}
  else plain+=source[i++];
 }
 if(plain)parts.push({text:plain});return parts;
}
const chunkEnglish={
 'name-prefix':'Under the name of','name-marti':'Martí','name-full':'The booking is under the name of','name-please':'please',
 'late-sorry':'Yes, sorry!','late-state':'We are late.','late-question':'Do we still have a table?','late-please':'Please.'
};
export function responseEnglish(exercise,picked,chunks){
 if(exercise.options)return exercise.options.find(o=>o.id===picked)?.text.en||'';
 if(exercise.type==='build'&&chunks.every(id=>chunkEnglish[id]))return chunks.map(id=>chunkEnglish[id]).join(' ');
 // Arbitrary typed answers cannot be faithfully translated by this local checker.
 return '';
}
