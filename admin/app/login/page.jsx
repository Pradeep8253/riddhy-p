export default function AdminLogin(){
  return <div style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#0F3624'}}>
    <form style={{background:'#fff',padding:32,borderRadius:20,width:'90%',maxWidth:400,display:'flex',flexDirection:'column',gap:14}}>
      <h2>RF Riddhy Admin — 2FA Login</h2>
      <input placeholder="Email" style={{padding:12,borderRadius:12,border:'1px solid #ddd'}}/>
      <input placeholder="Password" type="password" style={{padding:12,borderRadius:12,border:'1px solid #ddd'}}/>
      <input placeholder="2FA Code (OTP)" style={{padding:12,borderRadius:12,border:'1px solid #ddd'}}/>
      <button style={{background:'#174D35',color:'#fff',padding:12,borderRadius:999,fontWeight:800}}>Secure Login</button>
      <small style={{color:'#6B7268'}}>RBAC: super-admin / marketing / finance / warehouse / support / technician • Audit logged</small>
    </form>
  </div>
}
