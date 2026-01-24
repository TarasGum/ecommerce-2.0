// composables/useMotion.ts
// Wrapper for @vueuse/motion with common animation presets

export const useMotionPresets = () => {
  // Fade in from bottom
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    enter: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: "easeOut" },
  };

  // Fade in
  const fadeIn = {
    initial: { opacity: 0 },
    enter: { opacity: 1 },
    transition: { duration: 0.3, ease: "easeOut" },
  };

  // Slide in from left
  const slideInLeft = {
    initial: { opacity: 0, x: -20 },
    enter: { opacity: 1, x: 0 },
    transition: { duration: 0.3, ease: "easeOut" },
  };

  // Slide in from right
  const slideInRight = {
    initial: { opacity: 0, x: 20 },
    enter: { opacity: 1, x: 0 },
    transition: { duration: 0.3, ease: "easeOut" },
  };

  // Scale in
  const scaleIn = {
    initial: { opacity: 0, scale: 0.95 },
    enter: { opacity: 1, scale: 1 },
    transition: { duration: 0.3, ease: "easeOut" },
  };

  // Stagger children
  const stagger = {
    initial: { opacity: 0, y: 10 },
    enter: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: "easeOut", delayChildren: 0.1, staggerChildren: 0.05 },
  };

  return {
    fadeInUp,
    fadeIn,
    slideInLeft,
    slideInRight,
    scaleIn,
    stagger,
  };
};
