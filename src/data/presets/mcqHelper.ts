import type { OptionKey } from '../../types/exam.ts';

const KEYS: OptionKey[] = ['A', 'B', 'C', 'D'];

export function buildMcqOptions(
  correct: string,
  distractors: [string, string, string],
  seed: number,
): {
  options: { A: string; B: string; C: string; D: string };
  correctOption: OptionKey;
} {
  // Ensure 4 distinct strings
  const seen = new Set<string>([correct]);
  const cleanDistractors = distractors.map((d, idx) => {
    let candidate = d;
    let bump = 1;
    while (seen.has(candidate)) {
      candidate = `${d} (${idx + bump})`;
      bump++;
    }
    seen.add(candidate);
    return candidate;
  });

  const correctIdx = Math.abs(seed) % 4;
  const slots = ['', '', '', ''];
  slots[correctIdx] = correct;

  let dCursor = 0;
  for (let i = 0; i < 4; i++) {
    if (i !== correctIdx) {
      slots[i] = cleanDistractors[dCursor++];
    }
  }

  return {
    options: {
      A: slots[0],
      B: slots[1],
      C: slots[2],
      D: slots[3],
    },
    correctOption: KEYS[correctIdx],
  };
}
