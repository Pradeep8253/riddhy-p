import './Loader.css';
export default function Loader({ label='Loading...' }){
  return <div className="loader"><span className="loader__spinner"/><span className="loader__label">{label}</span></div>
}
