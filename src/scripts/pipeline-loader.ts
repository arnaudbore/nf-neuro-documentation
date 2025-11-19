/**
 * Client-side pipeline data loader
 * Fetches GitHub data directly from the browser
 */

interface PipelineData {
  repository: {
    name: string;
    fullName: string;
    description: string | null;
    stars: number;
    forks: number;
    updatedAt: string;
    topics: string[];
    license: {
      name: string;
      spdxId: string;
      url: string;
    } | null;
  };
  readmeDescription: string;
  latestRelease: {
    tagName: string;
    name: string;
    url: string;
    publishedAt: string;
  } | null;
  mainContributor: {
    login: string;
    url: string;
    avatarUrl: string;
    contributions: number;
  } | null;
}

const GITHUB_TOKEN = import.meta.env.PUBLIC_GITHUB_TOKEN;

function getGitHubHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };
  
  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }
  
  return headers;
}

async function fetchGitHubAPI(endpoint: string): Promise<Response> {
  const response = await fetch(`https://api.github.com${endpoint}`, {
    headers: getGitHubHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }
  
  return response;
}

async function checkLicenseFile(org: string, repo: string, branch: string): Promise<string | null> {
  const possibleFiles = [
    'LICENSE', 'LICENSE.md', 'LICENSE.txt',
    'LICENCE', 'LICENCE.md', 'LICENCE.txt',
    'license', 'license.md', 'license.txt'
  ];
  
  for (const filename of possibleFiles) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${org}/${repo}/contents/${filename}`,
        { method: 'HEAD', headers: getGitHubHeaders() }
      );
      if (response.ok) {
        return `https://github.com/${org}/${repo}/blob/${branch}/${filename}`;
      }
    } catch {
      continue;
    }
  }
  
  return null;
}

async function fetchReadmeDescription(org: string, repo: string): Promise<string> {
  try {
    const response = await fetchGitHubAPI(`/repos/${org}/${repo}/readme`);
    const data = await response.json();
    const content = atob(data.content);
    
    // Remove frontmatter if present
    let markdown = content.replace(/^---[\s\S]*?---\n/m, '');
    
    // Split by lines
    const lines = markdown.split('\n');
    const paragraphLines: string[] = [];
    let inCodeBlock = false;
    let foundFirstParagraph = false;
    let emptyLineCount = 0;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Track code blocks
      if (trimmed.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      
      // Skip if in code block
      if (inCodeBlock) continue;
      
      // Skip headers, images, badges, HTML tags, and empty lines before finding content
      if (!foundFirstParagraph) {
        if (
          trimmed === '' ||
          trimmed.startsWith('#') ||
          trimmed.startsWith('![') || // Markdown image
          trimmed.startsWith('[!') || // Badge
          trimmed.startsWith('<') ||
          trimmed.match(/^\[.*\]\(.*\)$/) // Standalone links/badges
        ) {
          continue;
        }
        // Found the start of content
        foundFirstParagraph = true;
        paragraphLines.push(line);
        continue;
      }
      
      // Process remaining lines of the paragraph
      if (foundFirstParagraph) {
        // Count consecutive empty lines
        if (trimmed === '') {
          emptyLineCount++;
          // Break on double empty line or single empty line after substantial content
          if (emptyLineCount >= 2 || (emptyLineCount >= 1 && paragraphLines.length > 3)) {
            break;
          }
          continue;
        }
        
        // Reset empty line counter
        emptyLineCount = 0;
        
        // Stop at headers, images, badges, or HTML
        if (
          trimmed.startsWith('#') ||
          trimmed.startsWith('![') || // Markdown image
          trimmed.startsWith('[!') || // Badge
          trimmed.startsWith('<')
        ) {
          break;
        }
        
        paragraphLines.push(line);
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
  } catch {
    return '';
  }
}

export async function loadPipelineData(
  org: string,
  repo: string,
  variant: 'compact' | 'detailed' = 'compact'
): Promise<PipelineData> {
  // Fetch repository data
  const repoResponse = await fetchGitHubAPI(`/repos/${org}/${repo}`);
  const repoData = await repoResponse.json();
  
  // Fetch README description
  const readmeDescription = await fetchReadmeDescription(org, repo);
  
  let latestRelease = null;
  let mainContributor = null;
  let licenseUrl = repoData.license?.url || null;
  
  // Fetch additional data for detailed variant
  if (variant === 'detailed') {
    // Fetch contributors
    try {
      const contributorsResponse = await fetchGitHubAPI(`/repos/${org}/${repo}/contributors`);
      const contributors = await contributorsResponse.json();
      if (contributors.length > 0) {
        mainContributor = {
          login: contributors[0].login,
          url: contributors[0].html_url,
          avatarUrl: contributors[0].avatar_url,
          contributions: contributors[0].contributions,
        };
      }
    } catch (error) {
      console.warn('Failed to fetch contributors:', error);
    }
    
    // Fetch latest release
    try {
      const releaseResponse = await fetchGitHubAPI(`/repos/${org}/${repo}/releases/latest`);
      const release = await releaseResponse.json();
      latestRelease = {
        tagName: release.tag_name,
        name: release.name,
        url: release.html_url,
        publishedAt: release.published_at,
      };
    } catch (error) {
      console.warn('Failed to fetch latest release:', error);
    }
    
    // Check for license file in repository
    if (repoData.license) {
      const repoLicenseUrl = await checkLicenseFile(org, repo, repoData.default_branch);
      if (repoLicenseUrl) {
        licenseUrl = repoLicenseUrl;
      }
    }
  }
  
  return {
    repository: {
      name: repoData.name,
      fullName: repoData.full_name,
      description: repoData.description,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      updatedAt: repoData.updated_at,
      topics: repoData.topics || [],
      license: repoData.license ? {
        name: repoData.license.name,
        spdxId: repoData.license.spdx_id,
        url: licenseUrl,
      } : null,
    },
    readmeDescription,
    latestRelease,
    mainContributor,
  };
}
