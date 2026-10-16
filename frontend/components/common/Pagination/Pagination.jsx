import './Pagination.css';
export default function Pagination({ page=1, totalPages=5, onChange }){
  return <div className="pagination">{Array.from({length:totalPages}).map((_,i)=>{
    const p=i+1; return <button key={p} onClick={()=>onChange(p)} className={`pagination__btn ${p===page?'pagination__btn--active':''}`}>{p}</button>
  })}</div>
}
