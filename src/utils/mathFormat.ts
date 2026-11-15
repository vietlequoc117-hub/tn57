export function formatScoreVi(score: number): string {
  const rounded = Math.round(score * 100) / 100;
  return Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toString().replace('.', ',');
}

export function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function parseMathNumeric(raw: string): number | null {
  let s = raw.trim();
  if (!s) return null;

  // Convert \frac{a}{b} -> a/b
  s = s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '$1/$2');
  // Remove spaces between digits (e.g. 1 450 -> 1450)
  s = s.replace(/(?<=\d)\s+(?=\d)/g, '');
  // Replace Vietnamese comma decimal separator with dot
  s = s.replace(/,/g, '.');
  // Strip degree symbol or percent? Only strip whitespace around /
  s = s.replace(/\s+/g, '');

  // Mixed number like 2+3/4 or 2(3/4) - handle simple numeric first
  const fracMatch = s.match(/^([+-]?\d+(?:\.\d+)?)\/([+-]?\d+(?:\.\d+)?)$/);
  if (fracMatch) {
    const num = Number(fracMatch[1]);
    const den = Number(fracMatch[2]);
    if (Number.isFinite(num) && Number.isFinite(den) && den !== 0) {
      return num / den;
    }
  }

  // Plain number
  if (/^[+-]?\d+(?:\.\d+)?$/.test(s)) {
    const val = Number(s);
    return Number.isFinite(val) ? val : null;
  }

  return null;
}

function normalizeStringToken(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '$1/$2')
    .replace(/\$/g, '')
    .replace(/(?<=\d)\s+(?=\d)/g, '')
    .replace(/,/g, '.')
    .replace(/\s+/g, ' ')
    .replace(/^\((.+)\)$/, '$1')
    .trim();
}

export function isMathAnswerMatch(userInput: string, acceptedAnswers: string[]): boolean {
  const cleanedUser = normalizeStringToken(userInput);
  if (!cleanedUser) return false;

  const userNumeric = parseMathNumeric(userInput);

  for (const candidate of acceptedAnswers) {
    const cleanedCandidate = normalizeStringToken(candidate);
    if (!cleanedCandidate) continue;

    if (cleanedUser === cleanedCandidate) {
      return true;
    }

    // Compare without spaces at all
    if (cleanedUser.replace(/\s+/g, '') === cleanedCandidate.replace(/\s+/g, '')) {
      return true;
    }

    // Compare numeric equivalence (e.g. 0,5 == 0.5 == 1/2 == 2/4)
    const candNumeric = parseMathNumeric(candidate);
    if (userNumeric !== null && candNumeric !== null) {
      if (Math.abs(userNumeric - candNumeric) < 1e-6) {
        return true;
      }
    }

    // Compare simplified integer fraction strings
    const fracA = cleanedUser.match(/^([+-]?\d+)\/([+-]?\d+)$/);
    const fracB = cleanedCandidate.match(/^([+-]?\d+)\/([+-]?\d+)$/);
    if (fracA && fracB) {
      const a1 = Number(fracA[1]);
      const a2 = Number(fracA[2]);
      const b1 = Number(fracB[1]);
      const b2 = Number(fracB[2]);
      if (a2 !== 0 && b2 !== 0) {
        const g1 = gcd(a1, a2);
        const g2 = gcd(b1, b2);
        const s1 = a1 / g1 * Math.sign(a2);
        const s2 = Math.abs(a2 / g1);
        const t1 = b1 / g2 * Math.sign(b2);
        const t2 = Math.abs(b2 / g2);
        if (s1 === t1 && s2 === t2) return true;
      }
    }

    // Also allow matching numeric part when candidate has unit (e.g., "1,7 km2" vs "1,7")
    const strippedUnitCandidate = cleanedCandidate.replace(/\s*[a-zA-Z°%²³]+.*$/, '').trim();
    if (strippedUnitCandidate && strippedUnitCandidate !== cleanedCandidate) {
      const unitCandNumeric = parseMathNumeric(strippedUnitCandidate);
      if (userNumeric !== null && unitCandNumeric !== null && Math.abs(userNumeric - unitCandNumeric) < 1e-6) {
        return true;
      }
    }
  }

  return false;
}
