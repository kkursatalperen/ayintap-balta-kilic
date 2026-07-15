'use client';
import { motion } from 'framer-motion';

/**
 * Scroll'a girince yukarı kayarak beliren wrapper.
 * Kullanım: <Reveal><h2>Başlık</h2></Reveal>
 * delay: saniye cinsinden gecikme (staggered listelerde index * 0.08 gibi kullanılabilir)
 */
export default function Reveal({ children, delay = 0, y = 24, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}