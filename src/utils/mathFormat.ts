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

function stripDiacritics(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

function normalizeMathToken(raw: string): string {
  let s = raw.trim().toLowerCase();
  // Remove LaTeX wrapper $ and spaces
  s = s.replace(/\$/g, '');
  // Convert mixed numbers like 1\frac{1}{2} -> 1+1/2
  s = s.replace(/(\d+)\s*\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '$1+$2/$3');
  // Convert \frac{a}{b} -> a/b
  s = s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '$1/$2');
  // Geometry LaTeX & Vietnamese equivalents
  s = s.replace(/\\widehat\{([^{}]+)\}/g, '$1');
  s = s.replace(/\\angle\s*/g, '');
  s = s.replace(/\\parallel/g, '//');
  s = s.replace(/\|\|/g, '//');
  s = s.replace(/song\s+song(?:\s+với)?/gi, '//');
  s = s.replace(/\\perp/g, '⊥');
  s = s.replace(/vuông\s+góc(?:\s+với)?|vuong\s+goc(?:\s+voi)?/gi, '⊥');
  s = s.replace(/\\triangle|△|tam\s+giác\s+|tam\s+giac\s+/gi, '');
  s = s.replace(/\\in/g, '∈');
  s = s.replace(/\\Rightarrow|⇒/g, '=>');
  // Exponents & degrees
  s = s.replace(/\^\\circ|\^\{\\circ\}|°/g, '°');
  s = s.replace(/(\d)\s*(?:độ|do)\b/gi, '$1°');
  s = s.replace(/\^2|²/g, '2');
  s = s.replace(/\^3|³/g, '3');
  s = s.replace(/\\cdot|\\times|×/g, '*');
  // Remove spaces between digits (e.g. 1 450 -> 1450)
  s = s.replace(/(?<=\d)\s+(?=\d)/g, '');
  // Vietnamese comma decimals (only when between digits: 22,5 -> 22.5)
  s = s.replace(/(?<=\d),(?=\d)/g, '.');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

function parseMathNumeric(raw: string): number | null {
  let s = normalizeMathToken(raw);
  if (!s) return null;

  // Strip trailing % or ° for single numeric parse
  const hadPercent = s.endsWith('%');
  s = s.replace(/[°%]$/g, '').replace(/\s+/g, '');

  // Mixed number: a+b/c or a-b/c
  const mixedMatch = s.match(/^([+-]?\d+)\+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = Number(mixedMatch[1]);
    const num = Number(mixedMatch[2]);
    const den = Number(mixedMatch[3]);
    if (Number.isFinite(whole) && Number.isFinite(num) && Number.isFinite(den) && den !== 0) {
      return whole >= 0 ? whole + num / den : whole - num / den;
    }
  }

  // Simple fraction a/b
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
    if (Number.isFinite(val)) {
      return hadPercent ? val : val;
    }
  }

  return null;
}

function normalizeStringToken(raw: string): string {
  return normalizeMathToken(raw)
    .replace(/,/g, '.')
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
      if (Math.abs(userNumeric - candNumeric) < 1e-4) {
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
        const s1 = (a1 / g1) * Math.sign(a2);
        const s2 = Math.abs(a2 / g1);
        const t1 = (b1 / g2) * Math.sign(b2);
        const t2 = Math.abs(b2 / g2);
        if (s1 === t1 && s2 === t2) return true;
      }
    }

    // Also allow matching numeric part when candidate has unit (e.g., "1,7 km2" vs "1,7")
    const strippedUnitCandidate = cleanedCandidate.replace(/\s*[a-zA-Z°%²³]+.*$/, '').trim();
    if (strippedUnitCandidate && strippedUnitCandidate !== cleanedCandidate) {
      const unitCandNumeric = parseMathNumeric(strippedUnitCandidate);
      if (
        userNumeric !== null &&
        unitCandNumeric !== null &&
        Math.abs(userNumeric - unitCandNumeric) < 1e-4
      ) {
        return true;
      }
    }
  }

  return false;
}

const COMMON_UNITS_REGEX =
  /\b(?:quyển sách|quyển|viên gạch|học sinh|công nhân|đồng|chiếc|máy|cây|quả|chai mật ong|chai|tấn|yến|tạ|kg|gam|g|km\/giờ|km\/h|m\/s|giờ|phút|giây|ngày|năm|tháng|tuần|km2|hm2|dam2|m2|dm2|cm2|mm2|km3|m3|dm3|cm3|mm3|km|hm|dam|dm|cm|mm|m|ha|lít|lit|ml|l|độ|do)\b/gi;

function stripUnitsAndLabels(raw: string): string {
  return normalizeMathToken(raw)
    .replace(COMMON_UNITS_REGEX, ' ')
    .replace(/\b(?:đáp số|kết quả|góc|tỉ số|tỉ lệ|là|và|hoặc|cần dùng|muối tinh khiết|thành|lúc|cách a)\b/gi, ' ')
    .replace(/[°.:,;()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isPolynomialLike(raw: string): boolean {
  const s = normalizeMathToken(raw);
  // Matches things like 10x + 8, -3x^2, 40x + 5y, x^3 - 6x^2
  return /(?:^|[^a-z])(?:\d+[xyz]|[xyz]\d|\^[23]|[xyz]\s*[+-]\s*\d)/.test(s);
}

function extractNumericValues(raw: string): number[] {
  let s = normalizeMathToken(raw);
  // Remove class names like 5A, 7B, and function call args like P(-1), K(-1) =
  s = s.replace(/\b\d+[a-z]\b/gi, ' ');
  s = s.replace(/[a-z]\([^)]*\)\s*=/gi, ' ');
  // Remove unit exponents like m2, cm2, dm3, m3
  s = s.replace(/\b(?:km|hm|dam|dm|cm|mm|m)[23]\b/gi, ' ');
  // Remove repeating decimal notation like 0.58(3) -> 0.58333
  s = s.replace(/(\d+\.\d+)\((\d+)\)/g, '$1$2$2');

  const matches = s.match(/[+-]?\d+(?:\+\d+\/\d+|\/\d+|\.\d+)?%?/g) || [];
  const nums: number[] = [];
  for (const m of matches) {
    const val = parseMathNumeric(m);
    if (val !== null) nums.push(val);
  }
  return nums;
}

function expandCandidateVariants(candidate: string): string[] {
  const variants = new Set<string>([candidate]);

  // Without parenthetical hints e.g. "△ABM = △ACM (c.c.c)" -> "△ABM = △ACM"
  const noParens = candidate.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  if (noParens) variants.add(noParens);

  // Extract meaningful alternative values inside parentheses (e.g. "(hay 0,3)", "(576 dm³)", "(0,55)", "(50 quyển)")
  const parenMatches = candidate.matchAll(/\(([^)]+)\)/g);
  for (const match of parenMatches) {
    const inner = match[1].replace(/^(?:hay|hoặc|tức là|chính xác)\s+/i, '').trim();
    if (/\d/.test(inner)) {
      variants.add(inner);
    }
  }

  // Split by ; when candidate contains alternative forms or strip LHS of single assignment (x = 2 -> 2)
  for (const v of Array.from(variants)) {
    // Handle single assignment like "x = 15", "K(-1) = -41", "\widehat{xOz} = 130^\circ", "P(x) = 10x + 8"
    if (/^[^=;]+=\s*[^=]+$/.test(v) && !/[<>]/.test(v)) {
      const rhs = v.split('=')[1].trim();
      if (rhs) variants.add(rhs);
    }
    // Handle "x = 3 hoặc x = -4" -> "3 hoặc -4"
    if (/\bhoặc\b/i.test(v)) {
      const parts = v.split(/\bhoặc\b/i).map((p) => {
        const eq = p.match(/^[^=]+=\s*(.+)$/);
        return eq ? eq[1].trim() : p.trim();
      });
      variants.add(parts.join('; '));
    }
    // Handle percent vs plain number
    const pctMatch = v.match(/^([+-]?\d+(?:[.,]\d+)?)\s*%$/);
    if (pctMatch) {
      variants.add(pctMatch[1]);
      const n = parseMathNumeric(pctMatch[1]);
      if (n !== null) variants.add(String(n / 100));
    }
  }

  return Array.from(variants);
}

/**
 * Flexible answer checker used for local grading of short answers & essay final results.
 * Supports Vietnamese decimals, fractions, units, variable prefixes (x = ...),
 * geometry symbols (//, ⊥, △, góc), polynomials, and multi-value answers.
 */
export function isFlexibleAnswerMatch(
  userInput: string,
  acceptedAnswers: string[],
): boolean {
  const rawUser = userInput.trim();
  if (!rawUser) return false;

  const expanded: string[] = [];
  for (const cand of acceptedAnswers) {
    if (!cand || !cand.trim()) continue;
    for (const variant of expandCandidateVariants(cand)) {
      expanded.push(variant);
    }
  }

  // 1. Direct / standard math match against all expanded variants
  if (isMathAnswerMatch(rawUser, expanded)) {
    return true;
  }

  // Also test user input stripped of leading "x =" or units
  const userRhs =
    /^[^=;]+=\s*[^=]+$/.test(rawUser) && !/[<>]/.test(rawUser)
      ? rawUser.split('=')[1].trim()
      : rawUser;
  if (userRhs !== rawUser && isMathAnswerMatch(userRhs, expanded)) {
    return true;
  }

  const userCleanText = stripUnitsAndLabels(rawUser);
  const userNoAccents = stripDiacritics(userCleanText).replace(/\s+/g, '');
  const userCompact = normalizeMathToken(rawUser).replace(/\s+/g, '');

  for (const cand of expanded) {
    const candCompact = normalizeMathToken(cand).replace(/\s+/g, '');
    if (userCompact && candCompact && userCompact === candCompact) {
      return true;
    }

    const candCleanText = stripUnitsAndLabels(cand);
    const candNoAccents = stripDiacritics(candCleanText).replace(/\s+/g, '');
    if (userNoAccents && candNoAccents && userNoAccents === candNoAccents) {
      return true;
    }

    // Polynomial expression match (keep exact symbols/signs, ignore spaces & outer label)
    if (isPolynomialLike(cand)) {
      const uPoly = normalizeMathToken(userRhs).replace(/\s+/g, '');
      const cPoly = normalizeMathToken(cand).replace(/\s+/g, '');
      if (uPoly === cPoly) return true;
      continue;
    }

    // Numeric tuple comparison (for multi-number answers like "x = 25; y = 40" vs "25; 40", "1 giờ 20 phút" vs "1h20")
    const candNums = extractNumericValues(cand);
    const userNums = extractNumericValues(rawUser);
    if (candNums.length > 0 && userNums.length === candNums.length) {
      const exactOrderMatch = candNums.every((c, i) => Math.abs(c - userNums[i]) < 1e-3);
      if (exactOrderMatch) return true;

      // For "hoặc" (roots unordered, e.g. x = 3 hoặc x = -4), allow any order
      if (/\bhoặc\b|;/i.test(cand)) {
        const sortedC = [...candNums].sort((a, b) => a - b);
        const sortedU = [...userNums].sort((a, b) => a - b);
        if (sortedC.every((c, i) => Math.abs(c - sortedU[i]) < 1e-3)) {
          return true;
        }
      }
    }
  }

  return false;
}
