/**
 * Each person gets one hue, fixed by their position in the list, reused
 * everywhere they appear — on screen and on the printed sheet. Colours are
 * stored as raw HSL triplets so they compose into hsl(... / alpha) for tints.
 */
const MEMBER_ACCENTS = [
  'var(--member-1)',
  'var(--member-2)',
  'var(--member-3)',
  'var(--member-4)',
  'var(--member-5)',
  'var(--member-6)',
] as const;

export function memberAccent(index: number): string {
  return MEMBER_ACCENTS[index % MEMBER_ACCENTS.length];
}

export function memberInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
