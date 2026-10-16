import './DimensionDiagram.css';
export default function DimensionDiagram({ specs }){
  return <div className="dim"><div className="dim__box"><div className="dim__rect"><span className="dim__label">W</span><span className="dim__label dim__label--h">H</span><span className="dim__label dim__label--d">D</span></div></div><p>Dimensions as per spec: {specs?.dimensions || 'Refer to specs table'} — All dimensions in cm. Assembly required.</p></div>
}
