'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearToast } from '@/store/uiSlice';
import styles from './ToastViewport.module.css';
export default function ToastViewport(){
  const toast=useSelector((state)=>state.ui.toast);const dispatch=useDispatch();
  useEffect(()=>{if(!toast)return;const id=setTimeout(()=>dispatch(clearToast()),2800);return()=>clearTimeout(id)},[toast,dispatch]);
  if(!toast)return null;
  return <div className={styles.toast} role="status" aria-live="polite"><span className={styles.dot}/>{toast.message}<button type="button" aria-label="Dismiss message" onClick={()=>dispatch(clearToast())}>×</button></div>;
}
