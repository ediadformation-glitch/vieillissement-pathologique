(function () {
  const KEY='advf-vieillissement-v1'; // Preserve existing learners' responses.
  const empty=()=>({version:2,index:0,started:false,answers:Array.from({length:26},()=>['','']),principles:Array.from({length:4},()=>({title:'',explanation:''})),blockResults:Array(5).fill(null)});
  function load(){
    try {
      const s=JSON.parse(localStorage.getItem(KEY));
      if(s && [1,2].includes(s.version) && Array.isArray(s.answers) && s.answers.length===26 && s.answers.every(a=>Array.isArray(a)&&a.length>=2&&a.every(t=>typeof t==='string')) && Array.isArray(s.principles)&&s.principles.length===4&&s.principles.every(r=>typeof r.title==='string'&&typeof r.explanation==='string')&&Number.isInteger(s.index)&&s.index>=0&&s.index<=26){
        if(s.version===1){
          s.blockResults=Array(5).fill(null);
          if(s.validated&&s.results&&s.results.situations?.length===26){
            [0,8,16,22].forEach((start,b)=>{s.blockResults[b]={situations:s.results.situations.slice(start,[8,16,22,26][b]),date:s.results.date};});
            s.blockResults[4]={principles:s.results.principles,principleRefs:s.results.principleRefs,date:s.results.date};
          }
        }
        s.version=2;
        if(!Array.isArray(s.blockResults)||s.blockResults.length!==5)s.blockResults=Array(5).fill(null);
        delete s.validated;delete s.results;
        return s;
      }
    }catch{}
    return empty();
  }
  function save(s){try{localStorage.setItem(KEY,JSON.stringify(s));return true;}catch{return false;}}
  function reset(){try{localStorage.removeItem(KEY);}catch{}return empty();}
  globalThis.Store={load,save,reset,empty};
})();
