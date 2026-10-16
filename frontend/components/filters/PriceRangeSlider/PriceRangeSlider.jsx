'use client';
import './PriceRangeSlider.css';
export default function PriceRangeSlider({ min=0,max=100000,value=[0,100000],onChange }){
  return <div className="prange">
    <div className="prange__inputs"><span>₹{value[0].toLocaleString('en-IN')}</span><span>₹{value[1].toLocaleString('en-IN')}</span></div>
    <div className="prange__track"><input type="range" min={min} max={max} value={value[0]} onChange={e=>onChange([Number(e.target.value), value[1]])}/><input type="range" min={min} max={max} value={value[1]} onChange={e=>onChange([value[0], Number(e.target.value)])}/></div>
  </div>
}
