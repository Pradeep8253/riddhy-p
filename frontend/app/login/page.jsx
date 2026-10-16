'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/common/Toast/ToastProvider';
import Link from 'next/link';
import './page.css';
export default function Login(){
  const [email,setEmail]=useState('rahul@example.com');
  const [pass,setPass]=useState('password');
  const { login }=useAuth();
  const { toast }=useToast();
  const router=useRouter();
  return <div className="auth"><div className="auth__visual"><h2>Welcome back</h2><p>Premium homes, trusted care. Sign in to track orders & warranty.</p><div className="auth__stats"><span><strong>2,400+</strong> Homes</span><span><strong>4.6★</strong> Rating</span><span><strong>120+</strong> Cities</span></div></div><form className="auth__form" onSubmit={e=>{e.preventDefault(); login({email}); toast('Welcome back!'); router.push('/account');}}><h3>Login to RF Riddhy</h3><label>Email<input value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<input type="password" value={pass} onChange={e=>setPass(e.target.value)} required/></label><button type="submit">Login</button><p>Don't have an account? <Link href="/register">Register</Link></p></form></div>
}
