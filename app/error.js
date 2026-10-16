'use client';

export default function GlobalError({reset}){
  return <main role="alert" style={{minHeight:'60vh',display:'grid',alignContent:'center',justifyItems:'start',padding:'12vh 8vw',color:'#243129',background:'#f6f2eb',fontFamily:'system-ui,sans-serif'}}><p style={{color:'#9a712b',fontSize:12,fontWeight:800,letterSpacing:'.16em'}}>RF RIDDHY · SOMETHING WENT WRONG</p><h1 style={{maxWidth:680,margin:'12px 0',fontSize:'clamp(38px,6vw,72px)',fontWeight:500,letterSpacing:'-.05em'}}>Let’s try that again.</h1><p style={{maxWidth:480,color:'#657168',lineHeight:1.7}}>The page could not be loaded just now. Your bag and account data have not been changed.</p><button type="button" onClick={()=>reset()} style={{marginTop:18,padding:'12px 20px',border:0,borderRadius:30,background:'#2e7d32',color:'white',fontWeight:800,cursor:'pointer'}}>Retry</button></main>;
}
