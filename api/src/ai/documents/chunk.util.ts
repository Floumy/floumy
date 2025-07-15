// Utility to chunk text by max length (characters or tokens)

/**
 * Splits a string into chunks of a given max length (in characters).
 * Optionally, can be extended to use tokens if a tokenizer is available.
 * @param text The input string
 * @param maxLength The maximum chunk length (default 4000 chars)
 * @returns Array of chunked strings
 */
export function chunkText(text: string, maxLength = 4000): string[] {
  if (!text || text.length <= maxLength) return [text];
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + maxLength));
    i += maxLength;
  }
  return chunks;
}
