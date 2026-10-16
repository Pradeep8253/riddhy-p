export function loadRazorpay(){
  return new Promise((resolve,reject)=>{
    if(typeof window==='undefined') return reject('no window');
    if(window.Razorpay) return resolve(window.Razorpay);
    const s=document.createElement('script');
    s.src='https://checkout.razorpay.com/v1/checkout.js';
    s.onload=()=>resolve(window.Razorpay);
    s.onerror=reject;
    document.body.appendChild(s);
  });
}
export function openRazorpay({key,order, prefill, onSuccess, onDismiss}){
  return loadRazorpay().then(Razorpay=>{
    const rzp=new Razorpay({
      key, amount: order.amount, currency: order.currency, order_id: order.id,
      name:'RF Riddhy', description:'Secure payment via Razorpay',
      image:'/images/logo.png',
      prefill,
      theme:{color:'#174D35'},
      handler: onSuccess,
      modal:{ ondismiss: onDismiss }
    });
    rzp.open();
  });
}
