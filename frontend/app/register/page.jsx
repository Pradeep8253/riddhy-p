'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/common/Toast/ToastProvider';
import Link from 'next/link';
import './page.css';
export default function Register(){
  const [name,setName]=useState('Rahul Sharma');
  const [email,setEmail]=useState('rahul@example.com');
  const [pass,setPass]=useState('password');
  const { register }=useAuth();
  const { toast }=useToast();
  const router=useRouter();
  return <div className="auth"><div className="auth__visual"><h2>Create account</h2><p>Join RF Riddhy — EMI, warranty dashboard, and priority support.</p></div><form className="auth__form" onSubmit={e=>{e.preventDefault(); register({name,email}); toast('Account created!'); router.push('/account');}}><h3>Register</h3><label>Full Name<input value={name} onChange={e=>setName(e.target.value)} required/></label><label>Email<input value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<input type="password" value={pass} onChange={e=>setPass(e.target.value)} required/></label><button type="submit">Create Account</button><p>Already have an account? <Link href="/login">Login</Link></p></form></div>
}
