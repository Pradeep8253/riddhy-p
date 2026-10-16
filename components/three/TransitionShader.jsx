'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import styles from './TransitionShader.module.css';

export default function TransitionShader({ active = false, onComplete }) {
  const [show, setShow] = useState(active);
  useEffect(() => { setShow(active); }, [active]);
  return <AnimatePresence onExitComplete={onComplete}>{show && <motion.div className={styles.wipe} initial={{ scaleY: 0, transformOrigin: 'bottom' }} animate={{ scaleY: 1, transformOrigin: 'bottom' }} exit={{ scaleY: 0, transformOrigin: 'top' }} transition={{ duration: .55, ease: [.76,0,.24,1] }} aria-hidden="true"><span>RF RIDDHY</span></motion.div>}</AnimatePresence>;
}
