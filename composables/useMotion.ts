// composables/useMotion.ts
// Wrapper for @vueuse/motion with common animation presets

export const useMotionPresets = () => {
  // Fade in from bottom (for cards, modals)
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    enter: { opacity: 1, y: 0, transition: { duration: 300, ease: 'easeOut' } },
    leave: { opacity: 0, y: 10, transition: { duration: 200, ease: 'easeIn' } },
  };

  // Fade in (for overlays, subtle transitions)
  const fadeIn = {
    initial: { opacity: 0 },
    enter: { opacity: 1, transition: { duration: 250, ease: 'easeOut' } },
    leave: { opacity: 0, transition: { duration: 150, ease: 'easeIn' } },
  };

  // Slide in from left (for sidebars, drawers)
  const slideInLeft = {
    initial: { opacity: 0, x: -30 },
    enter: { opacity: 1, x: 0, transition: { duration: 300, ease: 'easeOut' } },
    leave: { opacity: 0, x: -20, transition: { duration: 200, ease: 'easeIn' } },
  };

  // Slide in from right (for panels, side modals)
  const slideInRight = {
    initial: { opacity: 0, x: 30 },
    enter: { opacity: 1, x: 0, transition: { duration: 300, ease: 'easeOut' } },
    leave: { opacity: 0, x: 20, transition: { duration: 200, ease: 'easeIn' } },
  };

  // Scale in (for modals, dialogs, popovers)
  const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    enter: { opacity: 1, scale: 1, transition: { duration: 250, ease: 'easeOut' } },
    leave: { opacity: 0, scale: 0.95, transition: { duration: 150, ease: 'easeIn' } },
  };

  // Pop in (for buttons, badges, small elements)
  const popIn = {
    initial: { opacity: 0, scale: 0.85 },
    enter: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 20 } },
    leave: { opacity: 0, scale: 0.9, transition: { duration: 150 } },
  };

  // Slide down (for dropdowns, expanding content)
  const slideDown = {
    initial: { opacity: 0, y: -10, scale: 0.98 },
    enter: { opacity: 1, y: 0, scale: 1, transition: { duration: 200, ease: 'easeOut' } },
    leave: { opacity: 0, y: -5, scale: 0.98, transition: { duration: 150, ease: 'easeIn' } },
  };

  // Slide up (for bottom sheets, tooltips)
  const slideUp = {
    initial: { opacity: 0, y: 10 },
    enter: { opacity: 1, y: 0, transition: { duration: 200, ease: 'easeOut' } },
    leave: { opacity: 0, y: 5, transition: { duration: 150, ease: 'easeIn' } },
  };

  // Expand (for accordions, collapsible content)
  const expand = {
    initial: { opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 },
    enter: { opacity: 1, height: 'auto', paddingTop: 'auto', paddingBottom: 'auto', transition: { duration: 250, ease: 'easeOut' } },
    leave: { opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0, transition: { duration: 200, ease: 'easeIn' } },
  };

  // Bounce in (for notifications, alerts)
  const bounceIn = {
    initial: { opacity: 0, scale: 0.3 },
    enter: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 500, damping: 25 } },
    leave: { opacity: 0, scale: 0.9, transition: { duration: 150 } },
  };

  // Stagger for list items
  const staggerItem = (index: number) => ({
    initial: { opacity: 0, y: 15 },
    enter: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 300, 
        ease: 'easeOut',
        delay: index * 50 
      } 
    },
  });

  // Card entrance
  const cardEnter = (index: number = 0) => ({
    initial: { opacity: 0, y: 20, scale: 0.98 },
    enter: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 350, 
        ease: 'easeOut',
        delay: 100 + index * 75 
      } 
    },
  });

  // Table row animation
  const tableRow = (index: number) => ({
    initial: { opacity: 0, x: -10 },
    enter: { 
      opacity: 1, 
      x: 0, 
      transition: { 
        duration: 200, 
        ease: 'easeOut',
        delay: index * 30 
      } 
    },
  });

  return {
    fadeInUp,
    fadeIn,
    slideInLeft,
    slideInRight,
    scaleIn,
    popIn,
    slideDown,
    slideUp,
    expand,
    bounceIn,
    staggerItem,
    cardEnter,
    tableRow,
  };
};

// Composable for animated visibility toggle
export const useAnimatedVisibility = () => {
  const isVisible = ref(false);
  const isAnimating = ref(false);

  const show = () => {
    isAnimating.value = true;
    isVisible.value = true;
  };

  const hide = () => {
    isAnimating.value = true;
    isVisible.value = false;
  };

  const toggle = () => {
    if (isVisible.value) {
      hide();
    } else {
      show();
    }
  };

  const onAnimationComplete = () => {
    isAnimating.value = false;
  };

  return {
    isVisible,
    isAnimating,
    show,
    hide,
    toggle,
    onAnimationComplete,
  };
};
