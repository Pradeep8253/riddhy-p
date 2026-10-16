export async function sendNotification({ to, type, data }){
  console.log(`[notify] ${type} to ${to}`, data);
  return { ok:true };
}
