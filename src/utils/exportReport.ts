import { AnalysisResult, IndexRecommendation, SuggestedQuery } from '../types';

export function generateAuditReport(
  analysis: AnalysisResult,
  suggested: SuggestedQuery | null,
  indexes: IndexRecommendation[]
): string {
  const timestamp = new Date().toISOString();

  let markdown = `# 🔍 QueryLens Optimization Audit Report\n\n`;
  markdown += `*Generated: ${timestamp}*\n`;
  markdown += `*Target Dialect: ${analysis.dialect.toUpperCase()}*\n\n`;

  markdown += `## 1. Executive Summary\n`;
  markdown += `- **Estimated Query Cost**: ${analysis.estimatedCost}%\n`;
  markdown += `- **Query Health Score**: ${analysis.score}/100\n`;
  markdown += `- **Total Issues Detected**: ${analysis.issues.length}\n`;
  markdown += `- **Resource Pressure**: CPU ${analysis.resourcePressure.cpu}% | I/O Read ${analysis.resourcePressure.io}% | Buffer Mem ${analysis.resourcePressure.memory}%\n\n`;

  markdown += `## 2. Issues & Anti-Patterns\n`;
  if (analysis.issues.length === 0) {
    markdown += `No critical anti-patterns detected.\n\n`;
  } else {
    analysis.issues.forEach((issue) => {
      markdown += `### [${issue.severity.toUpperCase()}] ${issue.title}\n`;
      markdown += `${issue.description}\n\n`;
      if (issue.remediation) {
        markdown += `> **Remediation**: ${issue.remediation}\n\n`;
      }
    });
  }

  markdown += `## 3. Original SQL\n\`\`\`sql\n${analysis.rawSql}\n\`\`\`\n\n`;

  if (suggested) {
    markdown += `## 4. Suggested Optimized Query\n\`\`\`sql\n${suggested.optimizedSql}\n\`\`\`\n\n`;
    markdown += `### Key Changes\n`;
    suggested.changes.forEach((change) => {
      markdown += `- ${change}\n`;
    });
    markdown += `\n`;
  }

  if (indexes.length > 0) {
    markdown += `## 5. Recommended Index DDL\n`;
    indexes.forEach((idx) => {
      markdown += `\`\`\`sql\n${idx.ddl}\n\`\`\`\n`;
      markdown += `*Reason: ${idx.reason}*\n\n`;
    });
  }

  return markdown;
}

export function downloadReportFile(content: string, filename = 'querylens-audit-report.md') {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
