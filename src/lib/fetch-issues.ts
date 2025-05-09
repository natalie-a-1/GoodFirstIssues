import { kv } from '@vercel/kv';

// Define repositories, their tags, and the specific label for 'good first issue'
const REPOS = [
  // Original repositories provided
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

  // Ethereum ecosystem additions
  { owner: "ethereum", repo: "web3.js", label: "good first issue", tags: ["ethereum", "tooling", "javascript"] },
  { owner: "trufflesuite", repo: "truffle", label: "good first issue", tags: ["ethereum", "tooling", "javascript"] },
  { owner: "ConsenSys", repo: "mythril", label: "good first issue", tags: ["ethereum", "security", "python"] },
  { owner: "foundry-rs", repo: "foundry", label: "good first issue", tags: ["ethereum", "smartcontracts", "rust"] },
  { owner: "ethereum", repo: "remix-project", label: "good first issue", tags: ["ethereum", "ide", "javascript"] },

  // Cardano ecosystem
  { owner: "input-output-hk", repo: "cardano-node", label: "Good First Issue", tags: ["cardano", "core", "haskell"] },
  { owner: "input-output-hk", repo: "cardano-wallet", label: "Good First Issue", tags: ["cardano", "wallet", "haskell"] },
  { owner: "input-output-hk", repo: "plutus", label: "Good First Issue", tags: ["cardano", "smartcontracts", "haskell"] },

  // Polkadot/Substrate ecosystem
  { owner: "paritytech", repo: "polkadot", label: "good first issue", tags: ["polkadot", "core", "rust"] },
  { owner: "paritytech", repo: "substrate", label: "good first issue", tags: ["polkadot", "framework", "rust"] },

  // Cosmos ecosystem
  { owner: "cosmos", repo: "cosmos-sdk", label: "good first issue", tags: ["cosmos", "framework", "go"] },
  { owner: "tendermint", repo: "tendermint", label: "good first issue", tags: ["cosmos", "consensus", "go"] },

  // Solana ecosystem
  { owner: "solana-labs", repo: "solana-web3.js", label: "good first issue", tags: ["solana", "tooling", "javascript"] },
  { owner: "metaplex-foundation", repo: "metaplex", label: "good first issue", tags: ["solana", "nft", "typescript"] },

  // Bitcoin ecosystem
  { owner: "btcsuite", repo: "btcd", label: "good first issue", tags: ["bitcoin", "core", "go"] },
  { owner: "bitcoinjs", repo: "bitcoinjs-lib", label: "good first issue", tags: ["bitcoin", "tooling", "javascript"] },

  // DeFi projects
  { owner: "aave", repo: "protocol-v2", label: "good first issue", tags: ["defi", "smartcontracts", "solidity"] },
  { owner: "compound-finance", repo: "compound-protocol", label: "good first issue", tags: ["defi", "smartcontracts", "solidity"] },
  { owner: "makerdao", repo: "dai.js", label: "good first issue", tags: ["defi", "tooling", "javascript"] },
  { owner: "sushiswap", repo: "sushiswap", label: "good first issue", tags: ["defi", "smartcontracts", "solidity"] },
  { owner: "yearn", repo: "yearn-vaults", label: "good first issue", tags: ["defi", "smartcontracts", "solidity"] },
  { owner: "balancer-labs", repo: "balancer-core", label: "good first issue", tags: ["defi", "smartcontracts", "solidity"] },

  // NFT projects
  { owner: "rarible", repo: "protocol", label: "good first issue", tags: ["nft", "smartcontracts", "solidity"] },
  { owner: "decentraland", repo: "marketplace", label: "good first issue", tags: ["nft", "frontend", "react"] },

  // Layer 2 solutions
  { owner: "ethereum-optimism", repo: "optimism", label: "good first issue", tags: ["layer2", "ethereum", "go"] },
  { owner: "OffchainLabs", repo: "arbitrum", label: "good first issue", tags: ["layer2", "ethereum", "go"] },
  { owner: "maticnetwork", repo: "matic.js", label: "good first issue", tags: ["layer2", "tooling", "javascript"] },
  { owner: "zkSync-Community-Hub", repo: "zksync", label: "good first issue", tags: ["layer2", "smartcontracts", "solidity"] },

  // Interoperability and oracles
  { owner: "smartcontractkit", repo: "chainlink", label: "good first issue", tags: ["oracles", "smartcontracts", "go"] },
  { owner: "interledger", repo: "rafiki", label: "good first issue", tags: ["interoperability", "javascript"] },
  { owner: "wormhole-foundation", repo: "wormhole", label: "good first issue", tags: ["interoperability", "smartcontracts", "solidity"] },

  // Decentralized storage
  { owner: "filecoin-project", repo: "lotus", label: "good first issue", tags: ["storage", "go"] },
  { owner: "storj", repo: "storj", label: "good first issue", tags: ["storage", "go"] },
  { owner: "sia-tech", repo: "siad", label: "good first issue", tags: ["storage", "go"] },

  // Identity and governance
  { owner: "ceramicnetwork", repo: "js-ceramic", label: "good first issue", tags: ["identity", "javascript"] },
  { owner: "ensdomains", repo: "ens", label: "good first issue", tags: ["identity", "smartcontracts", "solidity"] },
  { owner: "aragon", repo: "aragon-ui", label: "good first issue", tags: ["governance", "frontend", "react"] },
  { owner: "gnosis", repo: "conditional-tokens-contracts", label: "good first issue", tags: ["defi", "smartcontracts", "solidity"] },

  // Privacy-focused projects
  { owner: "zcash", repo: "zcash", label: "good first issue", tags: ["privacy", "core", "cpp"] },
  { owner: "monero-project", repo: "monero", label: "good first issue", tags: ["privacy", "core", "cpp"] },

  // Wallets
  { owner: "MetaMask", repo: "metamask-extension", label: "good first issue", tags: ["wallet", "frontend", "javascript"] },
  { owner: "trustwallet", repo: "assets", label: "good first issue", tags: ["wallet", "blockchain", "json"] },

  // Explorers and analytics
  { owner: "poanetwork", repo: "blockscout", label: "good first issue", tags: ["explorer", "elixir"] },
  { owner: "blockchain-etl", repo: "ethereum-etl", label: "good first issue", tags: ["analytics", "python"] },
  { owner: "graphprotocol", repo: "graph-node", label: "good first issue", tags: ["indexing", "rust"] },

  // Stablecoins
  { owner: "ampleforth", repo: "ampleforth-protocol", label: "good first issue", tags: ["stablecoin", "smartcontracts", "solidity"] },

  // Additional ecosystems and tools
  { owner: "near", repo: "nearcore", label: "good first issue", tags: ["near", "core", "rust"] },
  { owner: "avalanche-foundation", repo: "avalanchego", label: "good first issue", tags: ["avalanche", "core", "go"] },
  { owner: "hedera-hashgraph", repo: "hedera-services", label: "good first issue", tags: ["hedera", "core", "java"] },
  { owner: "stellar", repo: "stellar-core", label: "good first issue", tags: ["stellar", "core", "cpp"] },
  { owner: "algorand", repo: "go-algorand", label: "good first issue", tags: ["algorand", "core", "go"] },
  { owner: "tezos", repo: "tezos", label: "good first issue", tags: ["tezos", "core", "ocaml"] },
  { owner: "radicle-dev", repo: "radicle-link", label: "good first issue", tags: ["web3", "p2p", "rust"] },
  { owner: "hyperledger", repo: "fabric", label: "good first issue", tags: ["enterprise", "blockchain", "go"] }
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