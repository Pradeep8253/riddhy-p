import './CheckoutStepper.css';
export default function CheckoutStepper({ step=0 }){
  const steps=['Address','Delivery Slot','Payment','Review'];
  return <div className="stepper">{steps.map((s,i)=> <div key={s} className={`stepper__step ${i<=step?'stepper__step--active':''} ${i<step?'stepper__step--done':''}`}><span className="stepper__num">{i<step?'✓':i+1}</span><span className="stepper__label">{s}</span>{i<steps.length-1 && <span className="stepper__line"/>}</div>)}</div>
}
