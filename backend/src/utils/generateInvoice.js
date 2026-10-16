export function generateInvoiceNumber(){
  const d=new Date();
  return `RF-INV-${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${Math.floor(10000+Math.random()*90000)}`;
}
