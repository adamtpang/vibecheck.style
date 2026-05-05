// Shared framer-motion variants used across pages. Keeps animation timing
// consistent so the whole product feels like one motion language.
import type { Variants, Transition } from 'framer-motion';

export const easeOutQuart: Transition['ease'] = [0.165, 0.84, 0.44, 1];

/** Container that staggers its children's `initial → animate` transitions.
 *  Note: opacity:1 on both states is intentional — without an actual
 *  animatable property on the parent, framer-motion sometimes doesn't
 *  fire the staggerChildren transition reliably (children stick at
 *  opacity 0). The no-op opacity gives it something concrete to "animate"
 *  which kicks the stagger queue. */
export const staggerContainer: Variants = {
  initial: { opacity: 1 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
      when: 'beforeChildren',
    },
  },
};

/** Child variant used inside a staggerContainer */
export const fadeUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeOutQuart },
  },
};

/** A bigger, hero-ish entry (used for the vibe label) */
export const heroIn: Variants = {
  initial: { opacity: 0, y: 24, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: easeOutQuart },
  },
};

/** Spring used for hover/tap on tappable cards */
export const cardSpring: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 22,
};
