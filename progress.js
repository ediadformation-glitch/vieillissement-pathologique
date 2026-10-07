(function(){
  const starts=[0,8,16,22,26],ends=[8,16,22,26,27];
  const labels=['Points forts','En bonne voie','À approfondir','À explorer','À corriger en fin de bloc'];
  const colors=['#167d79','#448ca8','#b5782d','#a4b3ba','#d5dfe3'];
  const hasAnswer=points=>points.some(t=>t.trim().length>0);
  const blockFor=i=>i<8?0:i<16?1:i<22?2:i<26?3:4;
  function summarize(s,b=null){
    const counts=[0,0,0,0,0],items=[];
    for(let i=0;i<26;i++){
      const block=blockFor(i);if(b!==null&&b!==block)continue;
      const r=s.blockResults[block]?.situations?.[i-starts[block]];
      const state=!hasAnswer(s.answers[i])?3:!r?4:r.state==='Acquis'?0:r.state==='Bonne démarche, à compléter'?1:2;
      counts[state]++;items.push({index:i,state,result:r});
    }
    return {counts,items,total:items.length,reviewed:counts[0]+counts[1]+counts[2],answered:items.length-counts[3],labels,colors};
  }
  function strengths(s){return [...new Set(summarize(s).items.filter(x=>x.state<3).flatMap(x=>x.result?.matched?.map(m=>m.label)||[]))];}
  function priorities(s){return [...new Set(summarize(s).items.filter(x=>x.state<3).flatMap(x=>x.result?.missing?.map(m=>m.label)||[]))];}
  globalThis.Progress={starts,ends,blockFor,hasAnswer,summarize,strengths,priorities,labels,colors};
})();
