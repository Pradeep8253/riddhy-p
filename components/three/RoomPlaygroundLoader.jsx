'use client';

import dynamic from 'next/dynamic';
const RoomPlayground = dynamic(() => import('./RoomPlayground'), { ssr: false, loading: () => <div className="container" style={{padding:24}}>Loading room planner…</div> });
export default function RoomPlaygroundLoader(){return <RoomPlayground/>;}
