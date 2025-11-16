/**
 * Utility functions for interacting with the GitHub API
 */

export interface GitHubRepository {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  topics: string[];
  owner: {
    login: string;
  };
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  default_branch: string;
  license: {
    key: string;
    name: string;
    spdx_id: string;
    url: string;
  } | null;
}

export interface GitHubContributor {
  login: string;
  html_url: string;
  avatar_url: string;
  contributions: number;
}

export interface GitHubRelease {
  tag_name: string;
  name: string;
  html_url: string;
  published_at: string;
}

export interface GitHubContent {
  content: string;
  encoding: string;
}

/**
 * Get GitHub API headers with authentication if token is available
 * @returns Headers for GitHub API requests
 */
function getGitHubHeaders(): HeadersInit {
  const token = import.meta.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN;
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Generic GitHub API fetch wrapper
 * @param endpoint API endpoint (relative to https://api.github.com)
 * @param method HTTP method
 * @param errorMessage Custom error message
 * @returns Response object
 */
async function fetchGitHubAPI(
  endpoint: string,
  method: 'GET' | 'HEAD' = 'GET',
  errorMessage: string
): Promise<Response> {
  const response = await fetch(`https://api.github.com${endpoint}`, {
    headers: getGitHubHeaders(),
    method,
  });

  if (!response.ok) {
    throw new Error(`${errorMessage}: ${response.statusText}`);
  }

  return response;
}

/**
 * Fetch repository information from GitHub API
 * @param org Organization name
 * @param repo Repository name
 * @returns Repository data
 */
export async function fetchRepository(
  org: string,
  repo: string
): Promise<GitHubRepository> {
  const response = await fetchGitHubAPI(
    `/repos/${org}/${repo}`,
    'GET',
    `Failed to fetch repository ${org}/${repo}`
  );
  return response.json();
}

/**
 * Fetch file content from GitHub repository
 * @param org Organization name
 * @param repo Repository name
 * @param path File path in repository
 * @returns File content (decoded)
 */
export async function fetchFileContent(
  org: string,
  repo: string,
  path: string
): Promise<string> {
  const response = await fetchGitHubAPI(
    `/repos/${org}/${repo}/contents/${path}`,
    'GET',
    `Failed to fetch file ${path} from ${org}/${repo}`
  );
  
  const data: GitHubContent = await response.json();

  // Decode base64 content
  if (data.encoding === 'base64') {
    return Buffer.from(data.content, 'base64').toString('utf-8');
  }

  return data.content;
}

/**
 * Check if a file exists in a GitHub repository
 * @param org Organization name
 * @param repo Repository name
 * @param path File path in repository
 * @returns True if file exists, false otherwise
 */
export async function fileExists(
  org: string,
  repo: string,
  path: string
): Promise<boolean> {
  try {
    await fetchGitHubAPI(
      `/repos/${org}/${repo}/contents/${path}`,
      'HEAD',
      `File ${path} not found in ${org}/${repo}`
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch contributors for a GitHub repository
 * @param org Organization name
 * @param repo Repository name
 * @returns Array of contributors sorted by contributions
 */
export async function fetchContributors(
  org: string,
  repo: string
): Promise<GitHubContributor[]> {
  const response = await fetchGitHubAPI(
    `/repos/${org}/${repo}/contributors`,
    'GET',
    `Failed to fetch contributors for ${org}/${repo}`
  );
  return response.json();
}

/**
 * Fetch the latest release for a GitHub repository
 * @param org Organization name
 * @param repo Repository name
 * @returns Latest release data or null if no releases
 */
export async function fetchLatestRelease(
  org: string,
  repo: string
): Promise<GitHubRelease | null> {
  try {
    const response = await fetchGitHubAPI(
      `/repos/${org}/${repo}/releases/latest`,
      'GET',
      `Failed to fetch latest release for ${org}/${repo}`
    );
    return response.json();
  } catch {
    return null;
  }
}

/**
 * Get the license URL for a repository, preferring the repository's LICENSE file
 * @param org Organization name
 * @param repo Repository name
 * @param branch Default branch name
 * @param fallbackUrl Generic license URL from repository metadata
 * @returns URL to the license (repository file or generic)
 */
export async function getLicenseUrl(
  org: string,
  repo: string,
  branch: string,
  fallbackUrl: string
): Promise<string> {
  const possibleLicenseFiles = [
    'LICENSE',
    'LICENSE.md',
    'LICENSE.txt',
    'LICENCE',
    'LICENCE.md',
    'LICENCE.txt',
    'license',
    'license.md',
    'license.txt'
  ];

  for (const filename of possibleLicenseFiles) {
    if (await fileExists(org, repo, filename)) {
      return `https://github.com/${org}/${repo}/blob/${branch}/${filename}`;
    }
  }

  return fallbackUrl;
}
