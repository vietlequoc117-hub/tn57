import React from 'react';

interface MathSvgProps {
  svg?: string;
  caption?: string;
  className?: string;
}

function sanitizeSvg(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed.toLowerCase().includes('<svg')) return '';
  return trimmed
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/javascript:/gi, '');
}

export const MathSvg: React.FC<MathSvgProps> = ({ svg, caption, className = '' }) => {
  if (!svg) return null;
  const clean = sanitizeSvg(svg);
  if (!clean) return null;

  return (
    <div
      className={`my-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 flex flex-col items-center justify-center print-avoid-break ${className}`}
    >
      <div
        className="w-full flex justify-center [&>svg]:max-w-full [&>svg]:max-h-60 [&>svg]:h-auto [&>svg]:w-auto"
        dangerouslySetInnerHTML={{ __html: clean }}
      />
      {caption && <p className="mt-1.5 text-xs text-slate-500 italic">{caption}</p>}
    </div>
  );
};
