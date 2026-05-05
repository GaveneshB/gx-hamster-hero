import { motion } from "framer-motion";
import happy from "@/assets/hamster-happy.png";
import worried from "@/assets/hamster-worried.png";
import sleepy from "@/assets/hamster-sleepy.png";

export type Mood = "happy" | "worried" | "sleepy";

const map = { happy, worried, sleepy };

export function Hamster({
  mood = "happy",
  size = 180,
  float = true,
  className = "",
}: {
  mood?: Mood;
  size?: number;
  float?: boolean;
  className?: string;
}) {
  return (
    <motion.img
      src={map[mood]}
      alt={`GX Buddy hamster - ${mood}`}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`drop-shadow-[0_15px_40px_rgba(120,60,200,0.45)] select-none ${className}`}
      animate={float ? { y: [0, -10, 0] } : {}}
      transition={float ? { duration: 3.2, repeat: Infinity, ease: "easeInOut" } : {}}
      draggable={false}
    />
  );
}
