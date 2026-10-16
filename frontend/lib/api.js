import axios from 'axios';
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  withCredentials: true,
  timeout: 12000
});
api.interceptors.request.use(cfg=>{
  if(typeof window!=='undefined'){
    const t = localStorage.getItem('rf_token');
    if(t) cfg.headers.Authorization = `Bearer ${t}`;
    const idem = cfg.headers['Idempotency-Key'] || `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    if(['post','patch','put'].includes(cfg.method)) cfg.headers['Idempotency-Key']=idem;
  }
  return cfg;
});
api.interceptors.response.use(r=>r, err=>{
  if(err.response?.status===401 && typeof window!=='undefined'){
    localStorage.removeItem('rf_token');
  }
  return Promise.reject(err);
});
export default api;
