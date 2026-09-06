export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
  originalLineNumber?: number;
  rewrittenLineNumber?: number;
}

export function computeLineDiff(originalSql: string, rewrittenSql: string): DiffLine[] {
  const origLines = originalSql.trim().split('\n');
  const rewLines = rewrittenSql.trim().split('\n');

  const diff: DiffLine[] = [];
  let origIdx = 0;
  let rewIdx = 0;

  // Simple and robust LCS or Myers line comparator for SQL blocks
  while (origIdx < origLines.length || rewIdx < rewLines.length) {
    const orig = origLines[origIdx]?.trim();
    const rew = rewLines[rewIdx]?.trim();

    if (origIdx < origLines.length && rewIdx < rewLines.length && orig === rew) {
      diff.push({
        type: 'unchanged',
        text: rewLines[rewIdx],
        originalLineNumber: origIdx + 1,
        rewrittenLineNumber: rewIdx + 1,
      });
      origIdx++;
      rewIdx++;
    } else {
      // Line is different
      if (origIdx < origLines.length && (rewIdx >= rewLines.length || !rewLines.slice(rewIdx).some(l => l.trim() === orig))) {
        diff.push({
          type: 'removed',
          text: origLines[origIdx],
          originalLineNumber: origIdx + 1,
        });
        origIdx++;
      } else if (rewIdx < rewLines.length) {
        diff.push({
          type: 'added',
          text: rewLines[rewIdx],
          rewrittenLineNumber: rewIdx + 1,
        });
        rewIdx++;
      }
    }
  }

  return diff;
}
