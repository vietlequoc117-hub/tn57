import React from 'react';

interface MathRendererProps {
  text: string;
  className?: string;
}

const SYMBOL_MAP: Array<[RegExp, string]> = [
  [/\\triangle/g, '△'],
  [/\\perp/g, '⊥'],
  [/\\parallel/g, '∥'],
  [/\\approx/g, '≈'],
  [/\\leq?/g, '≤'],
  [/\\geq?/g, '≥'],
  [/\\neq?/g, '≠'],
  [/\\cdot/g, '·'],
  [/\\times/g, '×'],
  [/\\div/g, ':'],
  [/\\pm/g, '±'],
  [/\\in\b/g, '∈'],
  [/\\notin\b/g, '∉'],
  [/\\subset\b/g, '⊂'],
  [/\\mathbb\{N\}/g, 'ℕ'],
  [/\\mathbb\{Z\}/g, 'ℤ'],
  [/\\mathbb\{Q\}/g, 'ℚ'],
  [/\\mathbb\{R\}/g, 'ℝ'],
  [/\\pi\b/g, 'π'],
  [/\\alpha\b/g, 'α'],
  [/\\beta\b/g, 'β'],
  [/\\gamma\b/g, 'γ'],
  [/\\Delta\b/g, 'Δ'],
  [/\^\\circ/g, '°'],
  [/\\circ/g, '°'],
  [/\\text\{([^{}]+)\}/g, '$1'],
  [/\\mathrm\{([^{}]+)\}/g, '$1'],
  [/\\left\(/g, '('],
  [/\\right\)/g, ')'],
  [/\\left\[/g, '['],
  [/\\right\]/g, ']'],
  [/\\left\|/g, '|'],
  [/\\right\|/g, '|'],
  [/\\,/g, ' '],
  [/\\;/g, ' '],
];

function cleanMathSymbols(raw: string): string {
  let out = raw;
  for (const [pattern, replacement] of SYMBOL_MAP) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

function readBracedGroup(str: string, startIdx: number): { content: string; endIdx: number } | null {
  if (str[startIdx] !== '{') return null;
  let depth = 0;
  for (let i = startIdx; i < str.length; i++) {
    if (str[i] === '{') depth++;
    else if (str[i] === '}') {
      depth--;
      if (depth === 0) {
        return { content: str.slice(startIdx + 1, i), endIdx: i };
      }
    }
  }
  return null;
}

function renderInlineExpression(input: string, keyPrefix: string): React.ReactNode[] {
  const cleaned = cleanMathSymbols(input);
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let textBuffer = '';

  const flushText = () => {
    if (textBuffer) {
      nodes.push(<React.Fragment key={`${keyPrefix}-t-${nodes.length}`}>{textBuffer}</React.Fragment>);
      textBuffer = '';
    }
  };

  while (i < cleaned.length) {
    // 1. \frac{num}{den} or \dfrac{num}{den}
    if (cleaned.startsWith('\\frac{', i) || cleaned.startsWith('\\dfrac{', i)) {
      const braceStart = cleaned.indexOf('{', i);
      const numGroup = readBracedGroup(cleaned, braceStart);
      if (numGroup && cleaned[numGroup.endIdx + 1] === '{') {
        const denGroup = readBracedGroup(cleaned, numGroup.endIdx + 1);
        if (denGroup) {
          flushText();
          nodes.push(
            <span key={`${keyPrefix}-f-${nodes.length}`} className="math-frac">
              <span className="math-frac-num">
                {renderInlineExpression(numGroup.content, `${keyPrefix}-fn-${nodes.length}`)}
              </span>
              <span className="math-frac-den">
                {renderInlineExpression(denGroup.content, `${keyPrefix}-fd-${nodes.length}`)}
              </span>
            </span>,
          );
          i = denGroup.endIdx + 1;
          continue;
        }
      }
    }

    // 2. \sqrt{expr}
    if (cleaned.startsWith('\\sqrt{', i)) {
      const group = readBracedGroup(cleaned, i + 5);
      if (group) {
        flushText();
        nodes.push(
          <span key={`${keyPrefix}-sq-${nodes.length}`} className="inline-flex items-center">
            <span aria-hidden="true">√</span>
            <span className="border-t border-current px-0.5 leading-tight">
              {renderInlineExpression(group.content, `${keyPrefix}-sqc-${nodes.length}`)}
            </span>
          </span>,
        );
        i = group.endIdx + 1;
        continue;
      }
    }

    // 3. \widehat{ABC} or \hat{x}
    if (cleaned.startsWith('\\widehat{', i) || cleaned.startsWith('\\hat{', i)) {
      const braceStart = cleaned.indexOf('{', i);
      const group = readBracedGroup(cleaned, braceStart);
      if (group) {
        flushText();
        nodes.push(
          <span
            key={`${keyPrefix}-ang-${nodes.length}`}
            className="inline-flex flex-col items-center leading-none align-baseline"
          >
            <span className="text-[0.65em] -mb-1">^</span>
            <span>{renderInlineExpression(group.content, `${keyPrefix}-angc-${nodes.length}`)}</span>
          </span>,
        );
        i = group.endIdx + 1;
        continue;
      }
    }

    // 4. \overline{AB}
    if (cleaned.startsWith('\\overline{', i)) {
      const group = readBracedGroup(cleaned, i + 9);
      if (group) {
        flushText();
        nodes.push(
          <span
            key={`${keyPrefix}-ov-${nodes.length}`}
            className="border-t border-current inline-block leading-tight"
          >
            {renderInlineExpression(group.content, `${keyPrefix}-ovc-${nodes.length}`)}
          </span>,
        );
        i = group.endIdx + 1;
        continue;
      }
    }

    // 5. Superscripts ^{...} or ^x
    if (cleaned[i] === '^') {
      if (cleaned[i + 1] === '{') {
        const group = readBracedGroup(cleaned, i + 1);
        if (group) {
          flushText();
          nodes.push(
            <sup key={`${keyPrefix}-sup-${nodes.length}`} className="text-[0.75em] leading-none">
              {renderInlineExpression(group.content, `${keyPrefix}-supc-${nodes.length}`)}
            </sup>,
          );
          i = group.endIdx + 1;
          continue;
        }
      } else if (i + 1 < cleaned.length && /[0-9a-zA-Z+\-n]/.test(cleaned[i + 1])) {
        flushText();
        nodes.push(
          <sup key={`${keyPrefix}-sup-${nodes.length}`} className="text-[0.75em] leading-none">
            {cleaned[i + 1]}
          </sup>,
        );
        i += 2;
        continue;
      }
    }

    // 6. Subscripts _{...} or _x
    if (cleaned[i] === '_') {
      if (cleaned[i + 1] === '{') {
        const group = readBracedGroup(cleaned, i + 1);
        if (group) {
          flushText();
          nodes.push(
            <sub key={`${keyPrefix}-sub-${nodes.length}`} className="text-[0.75em] leading-none">
              {renderInlineExpression(group.content, `${keyPrefix}-subc-${nodes.length}`)}
            </sub>,
          );
          i = group.endIdx + 1;
          continue;
        }
      } else if (i + 1 < cleaned.length && /[0-9a-zA-Z]/.test(cleaned[i + 1])) {
        flushText();
        nodes.push(
          <sub key={`${keyPrefix}-sub-${nodes.length}`} className="text-[0.75em] leading-none">
            {cleaned[i + 1]}
          </sub>,
        );
        i += 2;
        continue;
      }
    }

    textBuffer += cleaned[i];
    i++;
  }

  flushText();
  return nodes;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Strip $ delimiters while preserving their contents for math parsing
  const normalized = text.replace(/\$\$([\s\S]*?)\$\$/g, '$1').replace(/\$([^$]+)\$/g, '$1');
  const lines = normalized.split('\n');

  return (
    <span className={className}>
      {lines.map((line, lineIdx) => (
        <React.Fragment key={`line-${lineIdx}`}>
          {lineIdx > 0 && <br />}
          {renderInlineExpression(line, `l${lineIdx}`)}
        </React.Fragment>
      ))}
    </span>
  );
};
