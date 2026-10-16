export default function DataTable({ cols=[], rows=[] }){
  return <div style={{background:'#fff',borderRadius:16,padding:16,overflow:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr>{cols.map(c=> <th key={c} style={{textAlign:'left',padding:'10px',borderBottom:'1px solid #eee'}}>{c}</th>)}</tr></thead><tbody>{rows.map((r,i)=> <tr key={i}>{cols.map(c=> <td key={c} style={{padding:'10px',borderBottom:'1px solid #f5f5f5'}}>{r[c]}</td>)}</tr>)}</tbody></table></div>
}
