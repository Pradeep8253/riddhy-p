'use client';
import { createContext, useContext, useEffect, useState } from 'react';
const AuthContext=createContext(null);
export const useAuth=()=>useContext(AuthContext);
export function AuthProvider({children}){
  const [user,setUser]=useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    try{ const s=localStorage.getItem('rf_user'); if(s) setUser(JSON.parse(s)); }catch{}
    setLoading(false);
  },[]);
  const login=(data)=>{
    const u={ id:'u1', name: data.name || 'Rahul Sharma', email: data.email || 'rahul@example.com', phone:'98765 43210', avatar:'RS' };
    setUser(u); localStorage.setItem('rf_user', JSON.stringify(u)); localStorage.setItem('rf_token','mock-token');
    return u;
  };
  const logout=()=>{ setUser(null); localStorage.removeItem('rf_user'); localStorage.removeItem('rf_token'); };
  const register=(d)=> login(d);
  return <AuthContext.Provider value={{user, loading, login, logout, register, isAuthenticated: !!user}}>{children}</AuthContext.Provider>
}
