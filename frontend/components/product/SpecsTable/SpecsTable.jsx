import './SpecsTable.css';
export default function SpecsTable({ specs={} }){
  return <div className="specs"><h4>Specifications</h4><table className="specs__table"><tbody>{Object.entries(specs).map(([k,v])=> <tr key={k}><th>{k}</th><td>{v}</td></tr>)}</tbody></table></div>
}
