'use client';

import { motion } from 'framer-motion';

export default function PageTransition({ children }) {
  return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .34, ease: [.16, 1, .3, 1] }}>{children}</motion.div>;
}
