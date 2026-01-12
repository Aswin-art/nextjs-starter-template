import { Block } from "@blocknote/core";

/**
 * Extracts plain text from BlockNote JSON blocks.
 * Useful for SEO descriptions, search indexing, or article previews.
 */
export function extractTextFromBlocks(
  blocks: Block[],
  maxLength?: number,
): string {
  if (!blocks || !Array.isArray(blocks)) return "";

  let text = "";

  for (const block of blocks) {
    if (!block.content) continue;

    if (Array.isArray(block.content)) {
      const blockText = block.content
        .map((segment) => {
          if (typeof segment === "string") return segment;
          if (typeof segment === "object" && "text" in segment)
            return segment.text;
          return "";
        })
        .join("");

      text += blockText + " ";
    }
  }

  text = text.trim();

  if (maxLength && text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  }

  return text;
}

/**
 * Calculates estimated reading time from blocks.
 */
export function calculateReadingTime(blocks: Block[]): string {
  const text = extractTextFromBlocks(blocks);
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}
