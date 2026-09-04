export const EASE = [0.22, 1, 0.36, 1] as const;
export const DURATION = 0.62;

/** Distance each direction travels before settling. */
export const OFFSET = {
  up: { y: 28 },
  down: { y: -28 },
  left: { x: -40 },
  right: { x: 40 },
} as const;

export type Direction = keyof typeof OFFSET;

export const VIEWPORT = { once: true, amount: 0.18 } as const;
