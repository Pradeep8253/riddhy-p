'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
export default function LocaleSync(){const locale=useSelector((state)=>state.ui.locale);useEffect(()=>{document.documentElement.lang=locale==='hi'?'hi':'en'},[locale]);return null}
