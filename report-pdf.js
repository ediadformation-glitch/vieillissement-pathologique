/* Local PDF creation. No answers are uploaded and no external service is called. */
(function(){
  async function create(session){
    const {PDFDocument,StandardFonts,rgb}=PDFLib;
    const doc=await PDFDocument.create(),regular=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);
    doc.setTitle('Mes appuis pour progresser - Formation ADVF');doc.setAuthor('Formation ADVF');doc.setLanguage('fr-FR');
    const W=595.28,H=841.89,M=46,width=W-2*M;
    const color=hex=>rgb(parseInt(hex.slice(1,3),16)/255,parseInt(hex.slice(3,5),16)/255,parseInt(hex.slice(5,7),16)/255);
    const ink=color('#25434b'),teal=color('#167d79'),muted=color('#62777f'),light=color('#edf5f4');
    let page,y;
    function newPage(){page=doc.addPage([W,H]);y=H-64;page.drawRectangle({x:0,y:H-15,width:W,height:15,color:teal});page.drawText('FORMATION ADVF  /  VIEILLISSEMENT PATHOLOGIQUE',{x:M,y:H-40,size:8,font:bold,color:muted});}
    function ensure(h){if(y-h<58)newPage();}
    const clean=t=>String(t??'').replace(/\r\n?/g,'\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').replace(/[\u2010-\u2015]/g,'-');
    function canvasFor(text,size,isBold){const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');ctx.font=`${isBold?'bold ':''}${size*3}px Arial, sans-serif`;const w=ctx.measureText(text).width;canvas.width=Math.ceil(w+12);canvas.height=Math.ceil(size*4.8);ctx.font=`${isBold?'bold ':''}${size*3}px Arial, sans-serif`;ctx.fillStyle='#25434b';ctx.textBaseline='alphabetic';ctx.fillText(text,3,size*3.2);return canvas;}
    function measure(t,size,font){try{return font.widthOfTextAtSize(t,size);}catch{const ctx=document.createElement('canvas').getContext('2d');ctx.font=`${font===bold?'bold ':''}${size}px Arial, sans-serif`;return ctx.measureText(t).width;}}
    function wrap(t,size,font,max=width){
      const lines=[];
      for(const para of clean(t).split('\n')){
        let line='';
        for(const word of para.split(/\s+/).filter(Boolean)){
          if(measure(word,size,font)>max){
            if(line){lines.push(line);line='';}
            for(const ch of word){if(line&&measure(line+ch,size,font)>max){lines.push(line);line='';}line+=ch;}
          }else if(line&&measure(line+' '+word,size,font)>max){lines.push(line);line=word;}else line+=(line?' ':'')+word;
        }
        lines.push(line);
      }
      return lines;
    }
    async function line(t,x,baseline,size,font,c){
      if(!t)return;
      try{font.encodeText(t);page.drawText(t,{x,y:baseline,size,font,color:c});}
      catch{
        // Preserve characters outside WinAnsi (including learners' other scripts) as a local canvas image.
        const cv=canvasFor(t,size,font===bold),png=await doc.embedPng(cv.toDataURL('image/png'));
        page.drawImage(png,{x:x-1,y:baseline-size*.53,width:cv.width/3,height:cv.height/3});
      }
    }
    async function text(t,size=11,font=regular,c=ink,gap=8,indent=0){
      const lines=wrap(t,size,font,width-indent),leading=size*1.42;
      ensure(Math.min(lines.length,3)*leading+gap);
      for(const l of lines){ensure(leading);await line(l,M+indent,y-size,size,font,c);y-=leading;}
      y-=gap;
    }
    async function heading(t){ensure(65);y-=12;await text(t,17,bold,teal,12);}
    async function bullets(items,fallback){if(!items.length){await text(fallback);return;}for(const t of items)await text('- '+t,11,regular,ink,6,6);}
    newPage();
    await text('Mes appuis pour progresser',27,bold,ink,10);
    await text('Un bilan personnel, à relire à votre rythme',13,regular,teal,18);
    await text('Établi le '+new Date().toLocaleDateString('fr-FR'),9,regular,muted,16);
    const summary=Progress.summarize(session),{counts}=summary;
    await text(counts[0]?`Vous avez identifié des attitudes adaptées dans ${counts[0]} situation${counts[0]>1?'s':''}. Ces points forts vous aident à poursuivre votre apprentissage.`:'Chaque situation abordée vous aide à construire vos repères. Ce bilan vous propose des appuis et des pistes pour continuer.',12,regular,ink,17);
    ensure(70);page.drawRectangle({x:M,y:y-55,width,height:55,color:light});
    const cards=[[summary.answered,'situations abordées / 26'],[session.blockResults.filter(Boolean).length,'blocs corrigés / 5'],[counts[0],'points forts reconnus']];
    for(let i=0;i<cards.length;i++){const x=M+15+i*width/3;page.drawText(String(cards[i][0]),{x,y:y-26,size:23,font:bold,color:teal});page.drawText(cards[i][1],{x,y:y-43,size:8,font:regular,color:muted});}y-=75;
    await heading('Mon parcours en un regard');
    await text('Les situations sans réponse restent à explorer. Les réponses non corrigées sont présentées séparément.',10,regular,muted,12);
    ensure(155);
    for(let i=0;i<5;i++){
      await line(Progress.labels[i],M,y-10,10,regular,ink);
      const x=M+184,w=width-217;
      page.drawRectangle({x,y:y-12,width:w,height:12,color:light});
      if(counts[i])page.drawRectangle({x,y:y-12,width:w*counts[i]/26,height:12,color:color(Progress.colors[i])});
      page.drawText(String(counts[i]),{x:M+width-21,y:y-10,size:11,font:bold,color:ink});y-=29;
    }y-=10;
    await text('Ce bilan porte sur les idées professionnelles reconnues, sans note sur le français ni sur l’orthographe. La reconnaissance automatique est indicative et peut manquer une reformulation. Échangez avec votre formateur si besoin.',9,regular,muted,10);
    newPage();
    await heading('Ce sur quoi je peux m’appuyer');
    await bullets(Progress.strengths(session),'Vos appuis apparaîtront au fil des corrections de blocs. Votre expérience et les échanges avec le formateur comptent aussi.');
    await heading('Mes prochaines pistes');
    await bullets(Progress.priorities(session),'Explorez une nouvelle situation ou relisez un repère pour consolider vos acquis.');
    await heading('Mon parcours par bloc');
    for(let b=0;b<5;b++){
      const s=Activity.sections[b],r=session.blockResults[b],p=Progress.summarize(session,b);
      ensure(65);await text(s.name+' - '+s.profile,12,bold,teal,5);
      await text(b===4?(r?`${r.principles.matched.length} / 4 principes distincts reconnus.`:'Principes à explorer ou à corriger en fin de bloc.'):`${p.answered} / ${s.count} situations abordées ; ${p.counts[0]} point${p.counts[0]>1?'s':''} fort${p.counts[0]>1?'s':''} reconnu${p.counts[0]>1?'s':''}. ${r?'Correction consultée.':'Correction à consulter en fin de bloc.'}`,10,regular,ink,14);
    }
    // Preserve every written answer, with feedback only for blocks already reviewed.
    for(let b=0;b<4;b++){
      const indices=summary.items.filter(x=>Progress.blockFor(x.index)===b&&Progress.hasAnswer(session.answers[x.index]));
      if(!indices.length)continue;
      newPage();await heading(Activity.sections[b].name+' - mes réponses et mes repères');
      for(const item of indices){
        const i=item.index,r=item.result;
        const parts=[['Situation '+(i+1)+' / '+Progress.labels[item.state],12,bold,7],[Activity.questions[i].text,11,bold,8],...session.answers[i].filter(t=>t.trim()).map(a=>['Ma réponse : '+a,11,regular,8])];
        if(r){
          if(r.matched.length)parts.push(['Mes appuis : '+r.matched.map(x=>x.label).join(' ; '),10,regular,6]);
          if(r.missing.length)parts.push(['Pour aller plus loin : '+r.missing.map(x=>x.label).join(' ; '),10,regular,6]);
          if(r.conflicts.length)parts.push(['Point à revoir : le repère invite à '+r.conflicts.map(x=>x.label).join(' ; '),10,bold,6]);
          parts.push(['Repère professionnel : '+r.reference,10,regular,18]);
        }else parts.push(['Correction disponible à la fin de ce bloc.',10,regular,18]);
        const cardHeight=parts.reduce((sum,[t,size,font,gap])=>sum+wrap(t,size,font).length*size*1.42+gap,0);
        ensure(cardHeight<H-130?cardHeight:100);
        await text('Situation '+(i+1)+' / '+Progress.labels[item.state],12,bold,teal,7);
        await text(Activity.questions[i].text,11,bold,ink,8);
        for(const answer of session.answers[i].filter(t=>t.trim()))await text('Ma réponse : '+answer,11,regular,ink,8);
        if(r){
          if(r.matched.length)await text('Mes appuis : '+r.matched.map(x=>x.label).join(' ; '),10,regular,teal,6);
          if(r.missing.length)await text('Pour aller plus loin : '+r.missing.map(x=>x.label).join(' ; '),10,regular,ink,6);
          if(r.conflicts.length)await text('Point à revoir : le repère invite à '+r.conflicts.map(x=>x.label).join(' ; '),10,bold,ink,6);
          await text('Repère professionnel : '+r.reference,10,regular,muted,18);
        }else await text('Correction disponible à la fin de ce bloc.',10,regular,muted,18);
      }
    }
    if(session.principles.some(r=>r.title.trim()||r.explanation.trim())||session.blockResults[4]){
      newPage();await heading('Les principes - mes repères essentiels');
      for(let i=0;i<4;i++){const p=session.principles[i];ensure(80);await text('Principe '+(i+1),12,bold,teal,6);await text(p.title||'À explorer',11,bold,ink,5);if(p.explanation)await text(p.explanation);}
      const r=session.blockResults[4];
      if(r){await heading('Repères professionnels');for(const p of r.principleRefs){ensure(90);await text(p.label,12,bold,teal,5);await text(p.reference,10,regular,ink,12);}}
    }
    const pages=doc.getPages();pages.forEach((p,i)=>{p.drawLine({start:{x:M,y:42},end:{x:W-M,y:42},thickness:.6,color:color('#d5dfe3')});p.drawText('Accompagner avec attention et respect',{x:M,y:27,size:8,font:regular,color:muted});p.drawText(`${i+1} / ${pages.length}`,{x:W-M-30,y:27,size:8,font:regular,color:muted});});
    return doc.save();
  }
  globalThis.ReportPDF={create};
})();
