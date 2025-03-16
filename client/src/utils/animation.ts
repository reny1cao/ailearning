/**
 * Animation utilities for enhancing UI components
 */

/**
 * Delay rendering of components with staggered timing
 * @param index The index of the element in a list
 * @param baseDelay Base delay in milliseconds
 * @returns The delay in milliseconds
 */
export const staggerDelay = (index: number, baseDelay: number = 100): number => {
  return baseDelay * (index + 1);
};

/**
 * Animation variants for Framer Motion
 */
export const fadeInUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.1,
      duration: 0.5,
      ease: "easeOut"
    }
  })
};

/**
 * Animation variants for hover effects
 */
export const hoverVariants = {
  idle: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

/**
 * Parallax scroll effect (to be used with scroll event listeners)
 * @param scrollY Current scroll position
 * @param speed Parallax speed factor (0-1)
 * @returns Transform style object
 */
export const parallaxEffect = (scrollY: number, speed: number = 0.5): React.CSSProperties => {
  return {
    transform: `translateY(${scrollY * speed}px)`
  };
}; 