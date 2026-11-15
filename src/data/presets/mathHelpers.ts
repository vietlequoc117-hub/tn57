export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function simplifyFrac(num: number, den: number): [number, number] {
  if (den === 0) return [num, 1];
  const sign = den < 0 ? -1 : 1;
  const g = gcd(num, den);
  return [(num / g) * sign, Math.abs(den / g)];
}

export function fracTex(num: number, den: number): string {
  const [n, d] = simplifyFrac(num, den);
  if (d === 1) return String(n);
  return `\\frac{${n}}{${d}}`;
}

export function rawFracTex(num: number | string, den: number | string): string {
  return `\\frac{${num}}{${den}}`;
}

export function fmtVi(val: number, maxDecimals = 4): string {
  const factor = Math.pow(10, maxDecimals);
  const rounded = Math.round((val + Number.EPSILON) * factor) / factor;
  const str = Number.isInteger(rounded) ? String(rounded) : String(rounded);
  const [intPart, decPart] = str.split('.');
  const isNeg = intPart.startsWith('-');
  const absInt = isNeg ? intPart.slice(1) : intPart;
  const spacedInt =
    absInt.length >= 4 ? absInt.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : absInt;
  const signedInt = isNeg ? `-${spacedInt}` : spacedInt;
  return decPart ? `${signedInt},${decPart}` : signedInt;
}

export function fmtDot(val: number, maxDecimals = 4): string {
  const factor = Math.pow(10, maxDecimals);
  const rounded = Math.round((val + Number.EPSILON) * factor) / factor;
  return String(rounded);
}

export function numAccepted(val: number, unit = ''): string[] {
  const vi = fmtVi(val);
  const dot = fmtDot(val);
  const noSpaceVi = vi.replace(/\s+/g, '');
  const list = Array.from(new Set([vi, noSpaceVi, dot]));
  if (unit) {
    return [...list, `${vi} ${unit}`, `${dot} ${unit}`];
  }
  return list;
}

export function fracAccepted(num: number, den: number): string[] {
  const [n, d] = simplifyFrac(num, den);
  if (d === 1) return [String(n)];
  const dec = n / d;
  const list = [`${n}/${d}`, `${num}/${den}`, `\\frac{${n}}{${d}}`];
  if (Number.isInteger(dec * 1000)) {
    list.push(fmtVi(dec), fmtDot(dec));
  }
  return Array.from(new Set(list));
}

// ==========================================
// MATHEMATICALLY ACCURATE SVG GENERATORS
// ==========================================

export function svgFractionBar(
  totalParts: number,
  shadedParts: number,
  label = '',
): string {
  const w = 280;
  const h = 76;
  const barX = 20;
  const barY = 16;
  const barW = 240;
  const barH = 34;
  const cellW = barW / totalParts;
  let cells = '';
  for (let i = 0; i < totalParts; i++) {
    const fill = i < shadedParts ? '#bae6fd' : '#ffffff';
    cells += `<rect x="${(barX + i * cellW).toFixed(1)}" y="${barY}" width="${cellW.toFixed(1)}" height="${barH}" fill="${fill}" stroke="#0284c7" stroke-width="1.5"/>`;
  }
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${cells}${
    label
      ? `<text x="140" y="68" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="12" fill="#334155">${label}</text>`
      : ''
  }</svg>`;
}

export function svgNumberLine(
  minVal: number,
  maxVal: number,
  step: number,
  markers: Array<{ value: number; label: string; color?: string }>,
): string {
  const w = 380;
  const h = 84;
  const xStart = 34;
  const xEnd = 346;
  const y = 44;
  const span = maxVal - minVal || 1;
  const toX = (v: number) => xStart + ((v - minVal) / span) * (xEnd - xStart);

  let ticks = '';
  const count = Math.round(span / step);
  for (let i = 0; i <= count; i++) {
    const v = minVal + i * step;
    const x = toX(v);
    const isInt = Math.abs(v - Math.round(v)) < 1e-6;
    const tickH = isInt ? 8 : 5;
    ticks += `<line x1="${x.toFixed(1)}" y1="${y - tickH}" x2="${x.toFixed(1)}" y2="${y + tickH}" stroke="#475569" stroke-width="${isInt ? 1.8 : 1.1}"/>`;
    if (isInt || count <= 8) {
      ticks += `<text x="${x.toFixed(1)}" y="${y + 22}" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="12" fill="#334155">${fmtVi(v)}</text>`;
    }
  }

  let marks = '';
  for (const m of markers) {
    const x = toX(m.value);
    const c = m.color || '#dc2626';
    marks += `<circle cx="${x.toFixed(1)}" cy="${y}" r="4.5" fill="${c}" stroke="#ffffff" stroke-width="1.5"/>`;
    marks += `<text x="${x.toFixed(1)}" y="${y - 14}" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" font-style="italic" fill="${c}">${m.label}</text>`;
  }

  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <line x1="20" y1="${y}" x2="362" y2="${y}" stroke="#0f172a" stroke-width="1.8"/>
    <polygon points="362,${y} 353,${y - 4.5} 353,${y + 4.5}" fill="#0f172a"/>
    ${ticks}
    ${marks}
  </svg>`;
}

export function svgAnglePair(
  angleDeg: number,
  pointLeft = 'x',
  vertex = 'O',
  pointRight = 'y',
  rayUp = 'z',
  bisectorRay?: string,
): string {
  const w = 320;
  const h = 165;
  const ox = 160;
  const oy = 128;
  const r = 105;
  const rad = (angleDeg * Math.PI) / 180;
  const rx = ox + r * Math.cos(rad);
  const ry = oy - r * Math.sin(rad);

  const arcR = 30;
  const ax = ox + arcR * Math.cos(rad);
  const ay = oy - arcR * Math.sin(rad);
  const labelMidRad = rad / 2;
  const lx = ox + 48 * Math.cos(labelMidRad);
  const ly = oy - 48 * Math.sin(labelMidRad);

  let extra = '';
  if (bisectorRay) {
    const halfRad = rad / 2;
    const bx = ox + r * Math.cos(halfRad);
    const by = oy - r * Math.sin(halfRad);
    extra += `<line x1="${ox}" y1="${oy}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" stroke="#0284c7" stroke-width="1.8" stroke-dasharray="5 3"/>`;
    extra += `<text x="${(ox + (r + 16) * Math.cos(halfRad)).toFixed(1)}" y="${(oy - (r + 16) * Math.sin(halfRad)).toFixed(1)}" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" font-style="italic" fill="#0284c7">${bisectorRay}</text>`;
  }

  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <line x1="40" y1="${oy}" x2="280" y2="${oy}" stroke="#0f172a" stroke-width="2"/>
    <line x1="${ox}" y1="${oy}" x2="${rx.toFixed(1)}" y2="${ry.toFixed(1)}" stroke="#0f172a" stroke-width="2"/>
    ${extra}
    <path d="M ${ox + arcR},${oy} A ${arcR},${arcR} 0 0,0 ${ax.toFixed(1)},${ay.toFixed(1)}" fill="none" stroke="#dc2626" stroke-width="1.6"/>
    <circle cx="${ox}" cy="${oy}" r="3" fill="#0f172a"/>
    <text x="30" y="${oy + 4}" text-anchor="end" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" font-style="italic" fill="#0f172a">${pointLeft}</text>
    <text x="${ox}" y="${oy + 20}" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" font-style="italic" fill="#0f172a">${vertex}</text>
    <text x="288" y="${oy + 4}" text-anchor="start" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" font-style="italic" fill="#0f172a">${pointRight}</text>
    <text x="${(ox + (r + 16) * Math.cos(rad)).toFixed(1)}" y="${(oy - (r + 14) * Math.sin(rad)).toFixed(1)}" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" font-style="italic" fill="#0f172a">${rayUp}</text>
    ${!bisectorRay ? `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="600" fill="#dc2626">${angleDeg}°</text>` : ''}
  </svg>`;
}

export function svgParallelTransversal(
  angleDeg: number,
  topLabel = 'a',
  botLabel = 'b',
): string {
  const w = 340;
  const h = 180;
  const y1 = 55;
  const y2 = 128;
  const rad = (angleDeg * Math.PI) / 180;
  const dx = (y2 - y1) / Math.tan(rad);
  const cx1 = 165 + dx / 2;
  const cx2 = 165 - dx / 2;
  const ext = 36;
  const tx1 = cx1 + ext * Math.cos(rad);
  const ty1 = y1 - ext * Math.sin(rad);
  const tx2 = cx2 - ext * Math.cos(rad);
  const ty2 = y2 + ext * Math.sin(rad);

  const arcR = 22;
  const a1x = cx1 + arcR * Math.cos(rad);
  const a1y = y1 - arcR * Math.sin(rad);
  const a2x = cx2 + arcR * Math.cos(rad);
  const a2y = y2 - arcR * Math.sin(rad);

  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <line x1="40" y1="${y1}" x2="300" y2="${y1}" stroke="#0f172a" stroke-width="2"/>
    <line x1="40" y1="${y2}" x2="300" y2="${y2}" stroke="#0f172a" stroke-width="2"/>
    <line x1="${tx2.toFixed(1)}" y1="${ty2.toFixed(1)}" x2="${tx1.toFixed(1)}" y2="${ty1.toFixed(1)}" stroke="#0284c7" stroke-width="2"/>
    <path d="M ${(cx1 + arcR).toFixed(1)},${y1} A ${arcR},${arcR} 0 0,0 ${a1x.toFixed(1)},${a1y.toFixed(1)}" fill="none" stroke="#dc2626" stroke-width="1.6"/>
    <path d="M ${(cx2 + arcR).toFixed(1)},${y2} A ${arcR},${arcR} 0 0,0 ${a2x.toFixed(1)},${a2y.toFixed(1)}" fill="none" stroke="#059669" stroke-width="1.6"/>
    <circle cx="${cx1.toFixed(1)}" cy="${y1}" r="3" fill="#0f172a"/>
    <circle cx="${cx2.toFixed(1)}" cy="${y2}" r="3" fill="#0f172a"/>
    <text x="30" y="${y1 + 4}" text-anchor="end" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" font-style="italic" fill="#0f172a">${topLabel}</text>
    <text x="30" y="${y2 + 4}" text-anchor="end" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" font-style="italic" fill="#0f172a">${botLabel}</text>
    <text x="${(cx1 - 12).toFixed(1)}" y="${y1 - 8}" text-anchor="end" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" font-style="italic" fill="#0f172a">A</text>
    <text x="${(cx2 - 12).toFixed(1)}" y="${y2 - 8}" text-anchor="end" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" font-style="italic" fill="#0f172a">B</text>
    <text x="${(cx1 + 36).toFixed(1)}" y="${y1 - 10}" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="600" fill="#dc2626">${angleDeg}°</text>
    <text x="${(tx1 + 8).toFixed(1)}" y="${ty1 + 6}" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" font-style="italic" fill="#0284c7">c</text>
  </svg>`;
}

export function svgRightTriangle(
  labels: [string, string, string],
  sideA: string,
  sideB: string,
  angleDeg?: number,
): string {
  const w = 300;
  const h = 175;
  const ax = 60;
  const ay = 30;
  const bx = 60;
  const by = 140;
  const cx = 235;
  const cy = 140;
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <polygon points="${ax},${ay} ${bx},${by} ${cx},${cy}" fill="#f0f9ff" stroke="#0f172a" stroke-width="2" stroke-linejoin="round"/>
    <polyline points="${bx},${by - 12} ${bx + 12},${by - 12} ${bx + 12},${by}" fill="none" stroke="#0f172a" stroke-width="1.4"/>
    <text x="${ax - 10}" y="${ay}" text-anchor="end" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" font-style="italic" fill="#0f172a">${labels[0]}</text>
    <text x="${bx - 10}" y="${by + 12}" text-anchor="end" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" font-style="italic" fill="#0f172a">${labels[1]}</text>
    <text x="${cx + 10}" y="${cy + 12}" text-anchor="start" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" font-style="italic" fill="#0f172a">${labels[2]}</text>
    <text x="${ax - 12}" y="${(ay + by) / 2}" text-anchor="end" font-family="Plus Jakarta Sans, sans-serif" font-size="12" fill="#0284c7">${sideA}</text>
    <text x="${(bx + cx) / 2}" y="${by + 20}" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="12" fill="#0284c7">${sideB}</text>
    ${angleDeg ? `<text x="${cx - 42}" y="${cy - 10}" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="600" fill="#dc2626">${angleDeg}°</text>` : ''}
  </svg>`;
}

export function svgGeneralTriangle(
  labels: [string, string, string],
  opts?: {
    heightLabel?: string;
    baseLabel?: string;
    angleTop?: string;
    angleLeft?: string;
    angleRight?: string;
    isosceles?: boolean;
    medianPoint?: string;
  },
): string {
  const w = 310;
  const h = 180;
  const ax = opts?.isosceles ? 155 : 130;
  const ay = 32;
  const bx = 55;
  const by = 142;
  const cx = 255;
  const cy = 142;

  let extras = '';
  if (opts?.heightLabel) {
    extras += `<line x1="${ax}" y1="${ay}" x2="${ax}" y2="${by}" stroke="#0284c7" stroke-width="1.6" stroke-dasharray="5 3"/>`;
    extras += `<polyline points="${ax},${by - 10} ${ax + 10},${by - 10} ${ax + 10},${by}" fill="none" stroke="#0284c7" stroke-width="1.2"/>`;
    extras += `<text x="${ax + 6}" y="${(ay + by) / 2}" font-family="Plus Jakarta Sans, sans-serif" font-size="12" fill="#0284c7">${opts.heightLabel}</text>`;
    extras += `<text x="${ax}" y="${by + 18}" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700" font-style="italic" fill="#0284c7">H</text>`;
  }
  if (opts?.medianPoint) {
    const mx = (bx + cx) / 2;
    extras += `<line x1="${ax}" y1="${ay}" x2="${mx}" y2="${by}" stroke="#0284c7" stroke-width="1.6"/>`;
    extras += `<circle cx="${mx}" cy="${by}" r="3" fill="#0284c7"/>`;
    extras += `<text x="${mx}" y="${by + 18}" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" font-style="italic" fill="#0284c7">${opts.medianPoint}</text>`;
  }
  if (opts?.isosceles) {
    const m1x = (ax + bx) / 2;
    const m1y = (ay + by) / 2;
    const m2x = (ax + cx) / 2;
    const m2y = (ay + cy) / 2;
    extras += `<line x1="${m1x - 5}" y1="${m1y - 4}" x2="${m1x + 5}" y2="${m1y + 4}" stroke="#dc2626" stroke-width="1.8"/>`;
    extras += `<line x1="${m2x - 5}" y1="${m2y + 4}" x2="${m2x + 5}" y2="${m2y - 4}" stroke="#dc2626" stroke-width="1.8"/>`;
  }

  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <polygon points="${ax},${ay} ${bx},${by} ${cx},${cy}" fill="#f8fafc" stroke="#0f172a" stroke-width="2" stroke-linejoin="round"/>
    ${extras}
    <text x="${ax}" y="${ay - 10}" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" font-style="italic" fill="#0f172a">${labels[0]}</text>
    <text x="${bx - 10}" y="${by + 12}" text-anchor="end" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" font-style="italic" fill="#0f172a">${labels[1]}</text>
    <text x="${cx + 10}" y="${cy + 12}" text-anchor="start" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" font-style="italic" fill="#0f172a">${labels[2]}</text>
    ${opts?.baseLabel ? `<text x="${(bx + cx) / 2}" y="${by + 22}" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="12" fill="#0284c7">${opts.baseLabel}</text>` : ''}
    ${opts?.angleTop ? `<text x="${ax}" y="${ay + 24}" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="600" fill="#dc2626">${opts.angleTop}</text>` : ''}
    ${opts?.angleLeft ? `<text x="${bx + 26}" y="${by - 8}" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="600" fill="#dc2626">${opts.angleLeft}</text>` : ''}
    ${opts?.angleRight ? `<text x="${cx - 46}" y="${cy - 8}" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="600" fill="#dc2626">${opts.angleRight}</text>` : ''}
  </svg>`;
}

export function svgCongruentTriangles(
  leftLabels: [string, string, string],
  rightLabels: [string, string, string],
): string {
  const w = 360;
  const h = 165;
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <polygon points="85,32 35,135 145,135" fill="#f0f9ff" stroke="#0f172a" stroke-width="2" stroke-linejoin="round"/>
    <text x="85" y="22" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" font-style="italic" fill="#0f172a">${leftLabels[0]}</text>
    <text x="26" y="146" text-anchor="end" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" font-style="italic" fill="#0f172a">${leftLabels[1]}</text>
    <text x="152" y="146" text-anchor="start" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" font-style="italic" fill="#0f172a">${leftLabels[2]}</text>
    <line x1="56" y1="80" x2="66" y2="85" stroke="#dc2626" stroke-width="1.8"/>
    <line x1="110" y1="85" x2="120" y2="80" stroke="#0284c7" stroke-width="1.8"/>
    <line x1="113" y1="89" x2="123" y2="84" stroke="#0284c7" stroke-width="1.8"/>

    <polygon points="265,32 215,135 325,135" fill="#f0f9ff" stroke="#0f172a" stroke-width="2" stroke-linejoin="round"/>
    <text x="265" y="22" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" font-style="italic" fill="#0f172a">${rightLabels[0]}</text>
    <text x="206" y="146" text-anchor="end" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" font-style="italic" fill="#0f172a">${rightLabels[1]}</text>
    <text x="332" y="146" text-anchor="start" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" font-style="italic" fill="#0f172a">${rightLabels[2]}</text>
    <line x1="236" y1="80" x2="246" y2="85" stroke="#dc2626" stroke-width="1.8"/>
    <line x1="290" y1="85" x2="300" y2="80" stroke="#0284c7" stroke-width="1.8"/>
    <line x1="293" y1="89" x2="303" y2="84" stroke="#0284c7" stroke-width="1.8"/>
  </svg>`;
}

export function svgTrapezoid(topLabel: string, botLabel: string, hLabel: string): string {
  const w = 310;
  const h = 165;
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <polygon points="95,35 205,35 255,130 55,130" fill="#f0f9ff" stroke="#0f172a" stroke-width="2" stroke-linejoin="round"/>
    <line x1="95" y1="35" x2="95" y2="130" stroke="#0284c7" stroke-width="1.6" stroke-dasharray="5 3"/>
    <polyline points="95,120 105,120 105,130" fill="none" stroke="#0284c7" stroke-width="1.2"/>
    <text x="150" y="25" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="600" fill="#0f172a">${topLabel}</text>
    <text x="155" y="150" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="600" fill="#0f172a">${botLabel}</text>
    <text x="102" y="88" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="600" fill="#0284c7">${hLabel}</text>
  </svg>`;
}

export function svgCircle(radiusLabel: string, center = 'O'): string {
  const w = 220;
  const h = 160;
  const cx = 110;
  const cy = 80;
  const r = 56;
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#f0f9ff" stroke="#0f172a" stroke-width="2"/>
    <line x1="${cx}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke="#dc2626" stroke-width="1.8"/>
    <circle cx="${cx}" cy="${cy}" r="3" fill="#0f172a"/>
    <text x="${cx - 10}" y="${cy + 4}" text-anchor="end" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="700" font-style="italic" fill="#0f172a">${center}</text>
    <text x="${cx + r / 2}" y="${cy - 8}" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="600" fill="#dc2626">${radiusLabel}</text>
  </svg>`;
}

export function svgCuboid(lLabel: string, wLabel: string, hLabel: string): string {
  const w = 290;
  const h = 180;
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <polygon points="55,65 185,65 230,35 100,35" fill="#e0f2fe" stroke="#0f172a" stroke-width="1.8" stroke-linejoin="round"/>
    <rect x="55" y="65" width="130" height="80" fill="#f8fafc" stroke="#0f172a" stroke-width="1.8"/>
    <polygon points="185,65 230,35 230,115 185,145" fill="#f1f5f9" stroke="#0f172a" stroke-width="1.8" stroke-linejoin="round"/>
    <line x1="100" y1="35" x2="100" y2="115" stroke="#64748b" stroke-width="1.2" stroke-dasharray="4 3"/>
    <line x1="55" y1="145" x2="100" y2="115" stroke="#64748b" stroke-width="1.2" stroke-dasharray="4 3"/>
    <line x1="100" y1="115" x2="230" y2="115" stroke="#64748b" stroke-width="1.2" stroke-dasharray="4 3"/>
    <text x="120" y="164" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="600" fill="#0284c7">${lLabel}</text>
    <text x="220" y="140" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="600" fill="#0284c7">${wLabel}</text>
    <text x="45" y="110" text-anchor="end" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="600" fill="#dc2626">${hLabel}</text>
  </svg>`;
}

export function svgTriangularPrism(baseA: string, baseH: string, heightH: string): string {
  const w = 290;
  const h = 185;
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <polygon points="65,45 145,25 195,55" fill="#e0f2fe" stroke="#0f172a" stroke-width="1.8" stroke-linejoin="round"/>
    <line x1="65" y1="45" x2="65" y2="140" stroke="#0f172a" stroke-width="1.8"/>
    <line x1="145" y1="25" x2="145" y2="120" stroke="#64748b" stroke-width="1.3" stroke-dasharray="4 3"/>
    <line x1="195" y1="55" x2="195" y2="150" stroke="#0f172a" stroke-width="1.8"/>
    <line x1="65" y1="140" x2="195" y2="150" stroke="#0f172a" stroke-width="1.8"/>
    <line x1="65" y1="140" x2="145" y2="120" stroke="#64748b" stroke-width="1.3" stroke-dasharray="4 3"/>
    <line x1="145" y1="120" x2="195" y2="150" stroke="#64748b" stroke-width="1.3" stroke-dasharray="4 3"/>
    <text x="125" y="166" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="600" fill="#0284c7">Đáy ${baseA}; cao đáy ${baseH}</text>
    <text x="205" y="105" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="600" fill="#dc2626">${heightH}</text>
  </svg>`;
}

export function svgPieChart(
  slices: Array<{ label: string; percent: number; color: string }>,
): string {
  const w = 360;
  const h = 180;
  const cx = 100;
  const cy = 90;
  const r = 68;
  let currentAngle = -Math.PI / 2;
  let paths = '';
  let legend = '';

  slices.forEach((slice, idx) => {
    const angle = (slice.percent / 100) * Math.PI * 2;
    const endAngle = currentAngle + angle;
    const x1 = cx + r * Math.cos(currentAngle);
    const y1 = cy + r * Math.sin(currentAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const midAngle = currentAngle + angle / 2;
    const tx = cx + r * 0.62 * Math.cos(midAngle);
    const ty = cy + r * 0.62 * Math.sin(midAngle);

    paths += `<path d="M ${cx},${cy} L ${x1.toFixed(1)},${y1.toFixed(1)} A ${r},${r} 0 ${largeArc},1 ${x2.toFixed(1)},${y2.toFixed(1)} Z" fill="${slice.color}" stroke="#ffffff" stroke-width="1.8"/>`;
    if (slice.percent >= 10) {
      paths += `<text x="${tx.toFixed(1)}" y="${(ty + 4).toFixed(1)}" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="700" fill="#0f172a">${slice.percent}%</text>`;
    }

    const ly = 36 + idx * 28;
    legend += `<rect x="195" y="${ly}" width="14" height="14" rx="3" fill="${slice.color}" stroke="#94a3b8" stroke-width="0.8"/>`;
    legend += `<text x="216" y="${ly + 11}" font-family="Plus Jakarta Sans, sans-serif" font-size="12" fill="#0f172a">${slice.label} (${slice.percent}%)</text>`;

    currentAngle = endAngle;
  });

  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${paths}${legend}</svg>`;
}

export function svgLineChart(
  title: string,
  labels: string[],
  values: number[],
  unit = '',
): string {
  const w = 360;
  const h = 190;
  const left = 48;
  const right = 330;
  const top = 36;
  const bottom = 152;
  const maxVal = Math.max(...values, 10);
  const stepX = (right - left) / Math.max(1, labels.length - 1);

  const pts = values.map((v, idx) => {
    const x = left + idx * stepX;
    const y = bottom - (v / (maxVal * 1.15)) * (bottom - top);
    return { x, y, v, label: labels[idx] };
  });

  const polyline = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const dots = pts
    .map(
      (p) =>
        `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="#0284c7" stroke="#ffffff" stroke-width="1.5"/>` +
        `<text x="${p.x.toFixed(1)}" y="${(p.y - 9).toFixed(1)}" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="700" fill="#0284c7">${fmtVi(p.v)}</text>` +
        `<text x="${p.x.toFixed(1)}" y="${bottom + 18}" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="#334155">${p.label}</text>`,
    )
    .join('');

  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <text x="180" y="18" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="700" fill="#0f172a">${title}${unit ? ` (${unit})` : ''}</text>
    <line x1="${left}" y1="${top}" x2="${left}" y2="${bottom}" stroke="#475569" stroke-width="1.5"/>
    <line x1="${left}" y1="${bottom}" x2="${right + 12}" y2="${bottom}" stroke="#475569" stroke-width="1.5"/>
    <polyline points="${polyline}" fill="none" stroke="#0284c7" stroke-width="2.2"/>
    ${dots}
  </svg>`;
}
