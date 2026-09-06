/**
 * SQL File Upload & Validation Utilities
 */

export interface SqlFileReadResult {
  content: string;
  filename: string;
  sizeBytes: number;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Reads a .sql or .txt file as text with size and extension validation
 */
export function readSqlFile(file: File): Promise<SqlFileReadResult> {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file selected.'));
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return reject(
        new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 5MB limit.`)
      );
    }

    // Validate extension
    const name = file.name.toLowerCase();
    const isSql = name.endsWith('.sql');
    const isTxt = name.endsWith('.txt');

    if (!isSql && !isTxt && file.type && !file.type.includes('text') && !file.type.includes('sql')) {
      return reject(new Error('Please upload a valid .sql or .txt SQL script file.'));
    }

    const reader = new FileReader();

    reader.onload = () => {
      const content = reader.result as string;
      if (!content || !content.trim()) {
        return reject(new Error('The uploaded file is empty.'));
      }
      resolve({
        content,
        filename: file.name,
        sizeBytes: file.size,
      });
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file from disk.'));
    };

    reader.readAsText(file, 'utf-8');
  });
}

/**
 * Formats byte size into human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
