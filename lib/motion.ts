export const EASE = [0.22, 1, 0.36, 1] as const;
export const DURATION = 0.55;
export const STAGGER = 0.08;

export const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: DURATION, ease: EASE },
};

export const fromAbove = {
  initial: { opacity: 0, y: -36 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATION, ease: EASE },
};

export const fromBelow = {
  initial: { opacity: 0, y: 36 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATION, ease: EASE },
};

export const fromLeft = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: DURATION, ease: EASE },
};

export const fromRight = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: DURATION, ease: EASE },
};

export const viewBelow = {
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.35 },
  transition: { duration: DURATION, ease: EASE },
};

export const viewLeft = {
  initial: { opacity: 0, x: -40 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, amount: 0.35 },
  transition: { duration: DURATION, ease: EASE },
};

export const viewRight = {
  initial: { opacity: 0, x: 40 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, amount: 0.35 },
  transition: { duration: DURATION, ease: EASE },
};
