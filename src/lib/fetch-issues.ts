import { kv } from '@vercel/kv';

// Define repositories, their tags, and the specific label for 'good first issue'
const REPOS = [
  { owner: "ethereum", repo: "go-ethereum", label: "good first issue", tags: ["ethereum", "core", "go"] },
  { owner: "prysmaticlabs", repo: "prysm", label: "good first issue", tags: ["ethereum", "consensus", "go"] },
  { owner: "sigp", repo: "lighthouse", label: "good first issue", tags: ["ethereum", "consensus", "rust"] },
  { owner: "ethereum", repo: "ethereum-org-website", label: "good first issue", tags: ["ethereum", "docs", "frontend"] },
  { owner: "ethereum", repo: "web3.py", label: "Good First Issue", tags: ["ethereum", "python", "tooling"] },
  { owner: "eth-brownie", repo: "brownie", label: "Good First Issue", tags: ["ethereum", "smartcontracts", "python"] },
  { owner: "OpenZeppelin", repo: "openzeppelin-contracts", label: "good first issue", tags: ["ethereum", "smartcontracts", "solidity"] },
  { owner: "ethereum", repo: "fe", label: "good first issue", tags: ["ethereum", "language", "rust"] },
  { owner: "paritytech", repo: "substrate-connect", label: "good first issue", tags: ["polkadot", "infrastructure", "javascript"] },
  { owner: "cosmos", repo: "gaia", label: "good first issue", tags: ["cosmos", "core", "go"] },
  { owner: "solana-labs", repo: "solana", label: "good first issue", tags: ["solana", "core", "rust"] },
  { owner: "solana-labs", repo: "solana-program-library", label: "good first issue", tags: ["solana", "smartcontracts", "rust"] },
  { owner: "metaplex-foundation", repo: "mpl-token-metadata", label: "good first issue", tags: ["solana", "nft", "rust"] },
  { owner: "bitcoin", repo: "bitcoin", label: "good first issue", tags: ["bitcoin", "core", "cpp"] },
  { owner: "lightningnetwork", repo: "lnd", label: "good first issue", tags: ["bitcoin", "lightning", "go"] },
  { owner: "ElementsProject", repo: "lightning", label: "good first issue", tags: ["bitcoin", "lightning", "c"] },
  { owner: "ipfs", repo: "kubo", label: "good first issue", tags: ["ipfs", "web3", "go"] },
  { owner: "Uniswap", repo: "uniswap-interface", label: "good first issue", tags: ["defi", "frontend", "react"] },
];

interface Issue {
  id: number;
  title: string;
  url: string;
  repository: string;
  tags: string[];
  created_at: string;
  number: number;
}

interface GitHubIssue {
  id: number;
  title: string;
  html_url: string;
  created_at: string;
  number: number;
  pull_request?: { url: string };
}

export async function fetchIssues(): Promise<{ issues: Issue[], log: string[] }> {
  const allIssues: Issue[] = [];
  const logs: string[] = [];

  logs.push(`Fetching issues from ${REPOS.length} repositories...`);

  for (const repoInfo of REPOS) {
    const { owner, repo, label, tags } = repoInfo;
    const repoFullName = `${owner}/${repo}`;

    logs.push(`Fetching issues for ${repoFullName} with label '${label}'...`);

    // Construct the API URL
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues?state=open&labels=${encodeURIComponent(label)}`;

    try {
      const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json',
      };

      // Use GitHub token if available in environment
      if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
      }

      const response = await fetch(apiUrl, { headers });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const issues = await response.json() as GitHubIssue[];

      logs.push(`Found ${issues.length} issues for ${repoFullName}.`);

      for (const issue of issues) {
        // Filter out pull requests
        if (!issue.pull_request) {
          allIssues.push({
            id: issue.id,
            title: issue.title,
            url: issue.html_url,
            repository: repoFullName,
            tags,
            created_at: issue.created_at,
            number: issue.number
          });
        }
      }

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logs.push(`Error fetching issues for ${repoFullName}: ${errorMessage}`);
    }
  }

  logs.push(`Total issues fetched: ${allIssues.length}`);

  // Save the issues to Vercel KV
  try {
    await kv.set('all_issues_data', allIssues);
    logs.push(`Successfully saved ${allIssues.length} issues to Vercel KV.`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logs.push(`Error saving issues to Vercel KV: ${errorMessage}`);
    // Re-throw the error so the cron job status reflects the failure if KV save fails
    throw error; 
  }

  return { issues: allIssues, log: logs };
} 