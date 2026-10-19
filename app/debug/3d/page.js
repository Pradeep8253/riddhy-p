import { notFound } from 'next/navigation';
import Debug3DClient from '@/components/three/Debug3DClient';
export const metadata={title:'3D engine debug',robots:{index:false,follow:false}};
export default function Debug3DPage(){if(process.env.NODE_ENV==='production'||process.env.NODE_ENV!=='development')notFound();return <Debug3DClient/>}
