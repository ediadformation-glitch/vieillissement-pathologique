/* Local, deterministic concept recognition. No request is sent over the network. */
(function () {
  const normalize = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’']/g,' ').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
  const verbs={restez:'reste',rester:'reste',gardez:'garde',garder:'garde',rassurez:'rassure',rassurer:'rassure',laissez:'laisse',laisser:'laisse',favorisez:'favorise',favoriser:'favorise',preservez:'preserve',preserver:'preserve',maintenir:'maintiens',maintenez:'maintiens',impliquez:'implique',impliquer:'implique',encouragez:'encourage',encourager:'encourage',expliquez:'explique',expliquer:'explique',decrivez:'decris',decrire:'decris',mimer:'mime',mimez:'mime',ecoutez:'ecoute',ecouter:'ecoute',conseillez:'conseille',conseiller:'conseille',transmettez:'transmets',transmettre:'transmets',nettoyez:'nettoie',nettoyer:'nettoie',attirez:'attire',attirer:'attire',captez:'capte',capter:'capte',parlez:'parle',parler:'parle',articulant:'articule',articulez:'articule',articuler:'articule',reformulez:'reformule',reformuler:'reformule',posez:'pose',poser:'pose',quittez:'quitte',quitter:'quitte',aidez:'aide',aider:'aide',reglez:'regle',regler:'regle',installez:'installe',installer:'installe',repoussez:'repousse',repousser:'repousse',patient:'patiente',vigilant:'vigilante',professionnel:'professionnelle',chaleureux:'chaleureuse'};
  const canonical=text=>normalize(text).split(' ').filter(w=>!['je','vous','j'].includes(w)).map(w=>verbs[w]||w).join(' ');
  function entryIssue(text) {
    return String(text??'').trim()?'':'Vous pouvez revenir à cette idée plus tard.';
  }
  function meaningful(text) {return !entryIssue(text);}
  function pointIssues(points) {
    const issues=[0,1].flatMap(index=>{const message=entryIssue(points[index]||'');return message?[{index,message}]:[];});
    return issues;
  }
  function validPoints(points) {return points.some(meaningful);}
  function validPrinciples(rows) {return rows.length===4 && rows.every(r=>meaningful(r.title)||meaningful(r.explanation));}
  function distance(a,b) {
    const row=Array.from({length:b.length+1},(_,i)=>i);
    for(let i=1;i<=a.length;i++){let previous=row[0];row[0]=i;for(let j=1;j<=b.length;j++){const old=row[j];row[j]=Math.min(row[j]+1,row[j-1]+1,previous+(a[i-1]!==b[j-1]));previous=old;}} return row[b.length];
  }
  function corrected(text, expressions) {
    const vocabulary=[...new Set(expressions.flatMap(e=>normalize(e).split(' ')))];
    return normalize(text).split(' ').map(word=>{
      if(word.length<5 || vocabulary.includes(word))return word;
      const near=vocabulary.filter(v=>v.length>=5&&Math.abs(v.length-word.length)<=1&&(distance(v,word)<=1||v.length===word.length&&[...word].some((_,i)=>i+1<word.length&&word.slice(0,i)+word[i+1]+word[i]+word.slice(i+2)===v)));
      return near.length===1?near[0]:word;
    }).join(' ').split(' ').filter(w=>!['je','vous','j'].includes(w)).map(w=>verbs[w]||w).join(' ');
  }
  const negation=/\b(ne|n|pas|jamais|sans|evite|eviter|refuse|refuser|aucun)\b/;
  function phraseMatches(text,expression) {
    const words=canonical(expression).split(' '); if(!expression)return [];
    // Word boundaries and ordered phrases, allowing pronouns and small reformulations.
    const rx=new RegExp('\\b'+words.join('(?: \\w+){0,3} ')+'\\b','g');
    return [...text.matchAll(rx)].map(m=>({start:m.index,end:m.index+m[0].length,text:m[0]}));
  }
  function isNegated(text,hit,expression) {
    if(negation.test(normalize(expression)))return false; // Explicit negative phrase is already a positive expected idea.
    const prefix=text.slice(Math.max(0,hit.start-35),hit.start).split(' ').slice(-5).join(' ');
    const inside=hit.text; const after=text.slice(hit.end).split(' ').slice(0,3).join(' ');
    // A later independent instruction must not invert an earlier completed phrase.
    return negation.test(prefix)||negation.test(inside)||/^ (pas|jamais)\b/.test(after);
  }
  function recognize(concept,answers) {
    // Short meaningful formulations are accepted without measuring language proficiency.
    const short={
      'Garder son calme':['calme','rester calme'],
      'Rassurer la personne':['rassurer','rassure'],
      'Préserver l’autonomie et les capacités':['autonomie'],
      'Laisser le temps sans presser':['patience','patient','patiente','respecter son rythme'],
      'Conserver une distance professionnelle':['distance professionnelle'],
      'Reformuler la phrase incomprise':['reformuler','reformule'],
      'Nettoyer ses lunettes':['nettoyer lunettes'],
      'Se placer en face de la personne':['en face'],
      'Écouter avec compréhension et neutralité':['écouter','écoute']
    };
    const positive=[...(concept.expressions||[]),...(short[concept.label]||[])];
    const expressions=[...positive,...(concept.negativeExpressions||[])];
    let found=false, conflict=false;
    for(const answer of answers){
      for(const raw of answer.split(/[.;!?\n]|\bmais\b|\bet\b/iu)){
        const clause=corrected(raw,expressions);
        for(const e of positive) for(const h of phraseMatches(clause,e))if(!isNegated(clause,h,e))found=true;
        for(const e of concept.negativeExpressions||[]) for(const h of phraseMatches(clause,e)){
          if(isNegated(clause,h,e))found=true;else conflict=true;
        }
      }
    }
    return {found:found&&!conflict,conflict};
  }
  function evaluate(reference,answers) {
    const matched=[],missing=[],conflicts=[];
    for(const c of reference.expectedConcepts){const r=recognize(c,answers);(r.found?matched:missing).push(c);if(r.conflict)conflicts.push(c);}
    const state=conflicts.length?'À retravailler':matched.length>=2?'Acquis':matched.length===1?'Bonne démarche, à compléter':'À retravailler';
    return {state,matched,missing,conflicts,reference:reference.reference};
  }
  function evaluatePrinciples(refs,rows) {
    // Maximum one-to-one assignment: duplicate principles never count twice.
    const candidates=rows.map(r=>refs.map((c,i)=>recognize(c,[r.title,r.explanation]).found?i:-1).filter(i=>i>=0));
    let best=[];
    function search(row,used,chosen){if(row===4){if(chosen.filter(i=>i>=0).length>best.filter(i=>i>=0).length)best=chosen.slice();return;}search(row+1,used,[...chosen,-1]);for(const i of candidates[row])if(!used.has(i))search(row+1,new Set([...used,i]),[...chosen,i]);}
    search(0,new Set(),[]);if(!best.length)best=[-1,-1,-1,-1];
    return {assignment:best,matched:best.filter(i=>i>=0).map(i=>refs[i]),missing:refs.filter((_,i)=>!best.includes(i))};
  }
  globalThis.Engine={normalize,meaningful,pointIssues,validPoints,validPrinciples,evaluate,evaluatePrinciples,recognize};
})();
