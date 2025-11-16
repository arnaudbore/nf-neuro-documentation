/**
 * Utility functions for parsing README files from GitHub repositories
 */

import { fetchFileContent } from './github-api';

/**
 * Extract the first paragraph from markdown content
 * Strips everything before the first paragraph of actual content
 * @param markdown Raw markdown content
 * @returns First paragraph text
 */
function extractFirstParagraph(markdown: string): string {
  // Remove frontmatter if present
  let content = markdown.replace(/^---[\s\S]*?---\n/m, '');

  // Split by lines
  const lines = content.split('\n');
  const paragraphLines: string[] = [];
  let inCodeBlock = false;
  let foundFirstParagraph = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Track code blocks
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    // Skip if in code block
    if (inCodeBlock) continue;

    // Skip headers, images, badges, and empty lines before finding content
    if (!foundFirstParagraph) {
      if (
        trimmed === '' ||
        trimmed.startsWith('#') ||
        trimmed.startsWith('!') ||
        trimmed.startsWith('[!') ||
        trimmed.startsWith('<') ||
        trimmed.match(/^\[.*\]\(.*\)$/) // Standalone links
      ) {
        continue;
      }
      foundFirstParagraph = true;
    }

    // If we've found the start of the paragraph
    if (foundFirstParagraph) {
      // Break on empty line (end of paragraph)
      if (trimmed === '' && paragraphLines.length > 0) {
        break;
      }

      // Add non-empty lines
      if (trimmed !== '') {
        paragraphLines.push(line);
      }
    }
  }

  // Join and clean up markdown syntax
  let paragraph = paragraphLines.join(' ').trim();

  // Remove markdown links but keep text: [text](url) -> text
  paragraph = paragraph.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove bold/italic markers
  paragraph = paragraph.replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1');

  // Remove inline code markers
  paragraph = paragraph.replace(/`([^`]+)`/g, '$1');

  return paragraph;
}

/**
 * Try to fetch README with common filename variations
 * @param org Organization name
 * @param repo Repository name
 * @returns README content or empty string if not found
 */
async function fetchReadmeContent(org: string, repo: string): Promise<string> {
  const readmeVariants = ['README.md', 'readme.md', 'README'];
  
  for (const filename of readmeVariants) {
    try {
      return await fetchFileContent(org, repo, filename);
    } catch {
      // Continue to next variant
    }
  }
  
  throw new Error('No README file found');
}

/**
 * Fetch and parse README from a GitHub repository
 * Returns the first paragraph of content
 * @param org Organization name
 * @param repo Repository name
 * @returns First paragraph from README
 */
export async function fetchReadmeDescription(
  org: string,
  repo: string
): Promise<string> {
  try {
    const content = await fetchReadmeContent(org, repo);
    return extractFirstParagraph(content);
  } catch (error) {
    console.error(`Failed to fetch README for ${org}/${repo}:`, error);
    return '';
  }
}
