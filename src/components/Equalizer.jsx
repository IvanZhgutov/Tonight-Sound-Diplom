import { motion } from 'framer-motion';

const BARS = [30, 55, 80, 45, 95, 60, 100, 70, 88, 50, 75, 38];

export default function Equalizer() {
  return (
    <div className="eq" aria-hidden="true">
      {BARS.map((h, i) => (
        <motion.span
          key={i}
          style={{ height: `${h}%` }}
          animate={{ scaleY: [1, 0.45, 1] }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: -i * 0.13,
          }}
        />
      ))}
    </div>
  );
}
