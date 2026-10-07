const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const ctx={};vm.createContext(ctx);for(const f of ['questions','reference','correction'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/'+f+'.js'),'utf8'),ctx);
const E=ctx.Engine,R=ctx.Reference;let count=0;
function test(name,fn){try{fn();count++;console.log('✓ '+name);}catch(e){console.error('✗ '+name);throw e;}}
const evaluate=(index,...answers)=>E.evaluate(R.situations[index],answers);
test('26 situations, cinq parties, référentiel complet',()=>{assert.equal(ctx.Activity.questions.length,26);assert.equal(R.situations.length,26);assert.equal(ctx.Activity.sections.length,5);assert.ok(R.situations.every(r=>r.expectedConcepts.length>=2));});
for(const [name,answers,expected] of [
 ['A proche du corrigé',['Je lui laisse le temps de faire.','Je favorise son autonomie sans la mettre en difficulté.'],'Acquis'],
 ['B reformulation',['Je respecte son rythme.','Je la laisse participer selon ses capacités.'],'Acquis'],
 ['C mots simples',['Je la laisse faire.','Je lui laisse le temps.'],'Acquis'],
 ['D partielle',['Je lui laisse le temps.','Je prépare une tasse de thé.'],'Bonne démarche, à compléter'],
 ['E hors sujet',['Je regarde la météo.','Je prépare une tasse de thé.'],'À retravailler'],
 ['F contraire',['Je la presse pour finir.','Je favorise son autonomie.'],'À retravailler'],
 ['G fautes mineures',['Je lui laisse le temsp.','Je favorise son autonomi.'],'Acquis']])test('Gilet : '+name,()=>assert.equal(evaluate(3,...answers).state,expected));
for(const [name,answers,expected] of [
 ['A proche',['Je reformule la phrase incomprise.','Je reste calme et patient.'],'Acquis'],
 ['B reformulation',['J explique avec d autres mots.','Je garde mon calme.'],'Acquis'],
 ['C simple',['Je dis autrement.','Je reste tranquille.'],'Acquis'],
 ['D partielle',['Je change les mots.','Je prépare le goûter.'],'Bonne démarche, à compléter'],
 ['E hors sujet',['Je cuisine des légumes.','Je ferme le placard.'],'À retravailler'],
 ['F negation du calme',['Je ne reste pas calme.','Je parle des vacances.'],'À retravailler'],
 ['G fautes',['Je reformul la phrase.','Je reste calmee.'],'Acquis']])test('Incompréhension : '+name,()=>assert.equal(evaluate(24,...answers).state,expected));
test('Deux négations adaptées',()=>assert.equal(evaluate(3,'Je ne la brusque pas.','Je la laisse faire.').state,'Acquis'));
test('Un seul mot compte comme une réponse saisie',()=>assert.ok(E.validPoints(['Calme',''])));
test('Une hésitation peut être enregistrée sans blocage',()=>{for(const s of ['je sais pas','aucune idée','je ne sais pas quoi faire'])assert.ok(E.meaningful(s));});
test('La saisie de doublons reste autorisée',()=>assert.ok(E.validPoints(['Je reste calme.','je reste calme'])));
test('La saisie ne filtre pas la forme linguistique',()=>assert.ok(E.meaningful('aaaaaaa bbbbbbbb cccccccc')));
test('Plusieurs idées dans un seul point',()=>assert.equal(evaluate(0,'Je garde mon calme et je la rassure.','Je prépare le repas.').state,'Acquis'));
test('Crier détecté, ne pas crier accepté',()=>{assert.equal(evaluate(23,'Je crie pour être entendu.','Je me place en face.').state,'À retravailler');assert.equal(evaluate(23,'Je ne crie pas.','Je me place en face.').state,'Acquis');});
test('Principe dupliqué compte une seule fois',()=>{const rows=Array.from({length:4},()=>({title:'Je lui laisse le temps',explanation:'Je respecte son rythme'}));assert.equal(E.evaluatePrinciples(R.principles,rows).matched.length,1);});
test('Les quatre principes peuvent changer d’ordre',()=>{const rows=[{title:'Je favorise son autonomie',explanation:'Je la laisse participer selon ses capacités'},{title:'Je reste calme',explanation:'Je la rassure avec douceur'},{title:'J adapte ma communication',explanation:'Je parle clairement avec des messages simples'},{title:'Je respecte son rythme',explanation:'Je lui laisse le temps'}];assert.equal(E.evaluatePrinciples(R.principles,rows).matched.length,4);});
for(let i=0;i<26;i++)test('Corrigé de référence reconnu, situation '+(i+1),()=>assert.equal(evaluate(i,R.situations[i].reference).state,'Acquis'));
test('Une contradiction après une bonne idée est signalée',()=>assert.equal(evaluate(3,'Je ne la presse pas mais je la presse ensuite.','Je la laisse faire.').state,'À retravailler'));
test('Faire systématiquement à sa place est signalé',()=>assert.equal(evaluate(13,'Je favorise son autonomie.','Je fais tout à sa place.').state,'À retravailler'));
test('Une réponse hors sujet est conservée, sans devenir un acquis',()=>{assert.ok(E.meaningful('asdfgh qwerty zxcvbn'));assert.equal(evaluate(7,'asdfgh qwerty zxcvbn').matched.length,0);});
test('Formulation courte de conduite admise',()=>assert.ok(E.meaningful('Respecter son rythme')));
test('Situation 8 : deux expressions courtes autorisent la suite',()=>{const points=['Rester calme','La rassurer'];assert.ok(E.validPoints(points));assert.equal(evaluate(7,...points).state,'Acquis');});
test('La validation n’exige pas un mot d’une liste grammaticale',()=>assert.ok(E.meaningful('Rassurer Madame F')));
test('Les idées vides restent de simples pistes à reprendre',()=>{assert.equal(E.pointIssues(['Rester calme',''])[0].index,1);assert.equal(E.pointIssues(['Rester calme','Rester calme']).length,0);});
test('Un mot pertinent est reconnu dans le bilan',()=>assert.equal(evaluate(7,'Calme').matched[0].label,'Garder son calme'));
test('Une réponse de plus de 5000 caractères est conservable',()=>assert.ok(E.validPoints(['Je la rassure. '.repeat(600),''])));
console.log(count+' tests réussis');
