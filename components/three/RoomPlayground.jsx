'use client';

import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody } from '@react-three/rapier';
import { RoundedBox } from '@react-three/drei';
import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addItem } from '@/store/cartSlice';
import { getDemoProducts, formatINR } from '@/lib/demo-data';
import styles from './RoomPlayground.module.css';

function DropPiece({ index, color }) {
  return <RigidBody position={[(index%3-1)*.85,2.8+Math.floor(index/3)*.7,0]} colliders="cuboid" restitution={.12} friction={.9}>
    <RoundedBox args={[.65,.46,.58]} radius={.08} smoothness={3} castShadow><meshStandardMaterial color={color} /></RoundedBox>
  </RigidBody>;
}
function RoomScene({ count }) {
  return <Canvas camera={{ position:[0,3.8,7], fov:42 }} dpr={[1,1.5]} shadows aria-label="Interactive room planner">
    <ambientLight intensity={1.3}/><directionalLight position={[3,6,4]} intensity={2} castShadow />
    <Physics gravity={[0,-9.81,0]}><RigidBody type="fixed" colliders="cuboid" position={[0,-.1,0]}><mesh receiveShadow><boxGeometry args={[5,.2,4]} /><meshStandardMaterial color="#d8c4a4" /></mesh></RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[0,1.5,-2.1]}><mesh><boxGeometry args={[5,3,.15]} /><meshStandardMaterial color="#f0e8dc" /></mesh></RigidBody>
      {Array.from({length:count},(_,i)=><DropPiece key={i} index={i} color={['#6b8f5e','#d6ad6a','#bc9771','#d8ded7'][i%4]}/>)}
    </Physics>
  </Canvas>;
}

export default function RoomPlayground({ catalogue: propCatalogue }) {
  const dispatch = useDispatch();
  const catalogue = useMemo(() => {
    if (propCatalogue && propCatalogue.length > 0) return propCatalogue;
    return getDemoProducts().filter((p) => ['sofa','study','decor','storage'].includes(p.modelType)).slice(0,4);
  }, [propCatalogue]);
  const [selected, setSelected] = useState([]);
  const [open, setOpen] = useState(false);
  const total = selected.reduce((sum,item) => sum + item.price, 0);
  const addPiece = (product) => { setSelected((items) => items.length >= 6 ? items : [...items, product]); };
  const addAll = () => selected.forEach((product) => dispatch(addItem({ ...product, qty: 1 })));
  return <section className={styles.planner}>
    <div className={styles.intro}><div><span className="kicker">A little room to play</span><h3>Furnish the room.</h3><p>Choose a few pieces, let them settle into the space, and see the basket total before you shop.</p></div><button type="button" className={styles.toggle} onClick={() => setOpen((v)=>!v)}>{open ? 'Close planner' : 'Open room planner'}</button></div>
    {open && <div className={styles.body}><div className={styles.canvas}><RoomScene count={selected.length} /><span className={styles.canvasLabel}>Pieces gently settle into place · room layout</span></div><div className={styles.tray}><div className={styles.trayTitle}>Add to the room</div>{catalogue.map((product)=><button key={product.slug} type="button" className={styles.trayItem} onClick={()=>addPiece(product)}><span>{product.name}</span><small>{formatINR(product.price)}</small></button>)}<div className={styles.total}><span>Room total</span><b>{formatINR(total)}</b></div><button type="button" className={styles.addAll} disabled={!selected.length} onClick={addAll}>Add all to cart · {selected.length}</button></div></div>}
  </section>;
}
