import { motion, Variants, Transition } from "framer-motion";
import { ReactNode } from "react";

// Common animation variants
export const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

export const slideInFromLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const slideInFromRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

// Props for the MotionWrapper component
interface MotionWrapperProps {
  children: ReactNode;
  variant?: "fadeIn" | "scaleIn" | "slideInFromLeft" | "slideInFromRight" | "stagger";
  className?: string;
  delay?: number;
  duration?: number;
  whileHover?: any;
  whileTap?: any;
}

const variantMap = {
  fadeIn,
  scaleIn,
  slideInFromLeft,
  slideInFromRight,
  stagger: staggerContainer,
};

/**
 * MotionWrapper - A reusable wrapper component for Framer Motion animations
 *
 * @example
 * ```tsx
 * <MotionWrapper variant="fadeIn" delay={0.2}>
 *   <div>Your content</div>
 * </MotionWrapper>
 * ```
 */
export function MotionWrapper({
  children,
  variant = "fadeIn",
  className,
  delay,
  duration,
  whileHover,
  whileTap,
}: MotionWrapperProps) {
  const selectedVariant = variantMap[variant];

  // Custom transition overrides
  const customTransition: Transition | undefined =
    delay !== undefined || duration !== undefined
      ? {
          delay,
          duration,
        }
      : undefined;

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={selectedVariant}
      transition={customTransition}
      whileHover={whileHover}
      whileTap={whileTap}
    >
      {children}
    </motion.div>
  );
}

/**
 * MotionDiv - Direct access to motion.div with custom variants
 */
export function MotionDiv({ children, className, ...props }: any) {
  return (
    <motion.div className={className} {...props}>
      {children}
    </motion.div>
  );
}

/**
 * MotionButton - Animated button with hover and tap effects
 */
export function MotionButton({ children, className, onClick, ...props }: any) {
  return (
    <motion.button
      className={className}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/**
 * StaggerList - Container for staggered list animations
 */
export function StaggerList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerItem - Individual item for staggered animations
 */
export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
}
