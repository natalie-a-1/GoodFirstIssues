import requests
import json
import os
import time

# Define repositories, their tags, and the specific label for 'good first issue'
REPOS = [
    {"owner": "ethereum", "repo": "go-ethereum", "label": "good first issue", "tags": ["ethereum", "core", "go"]},
    {"owner": "prysmaticlabs", "repo": "prysm", "label": "good first issue", "tags": ["ethereum", "consensus", "go"]},
    {"owner": "sigp", "repo": "lighthouse", "label": "good first issue", "tags": ["ethereum", "consensus", "rust"]},
    {"owner": "ethereum", "repo": "ethereum-org-website", "label": "good first issue", "tags": ["ethereum", "docs", "frontend"]},
    {"owner": "ethereum", "repo": "web3.py", "label": "Good First Issue", "tags": ["ethereum", "python", "tooling"]},
    {"owner": "eth-brownie", "repo": "brownie", "label": "Good First Issue", "tags": ["ethereum", "smartcontracts", "python"]},
    {"owner": "OpenZeppelin", "repo": "openzeppelin-contracts", "label": "good first issue", "tags": ["ethereum", "smartcontracts", "solidity"]},
    {"owner": "ethereum", "repo": "fe", "label": "good first issue", "tags": ["ethereum", "language", "rust"]},
    {"owner": "paritytech", "repo": "substrate-connect", "label": "good first issue", "tags": ["polkadot", "infrastructure", "javascript"]},
    {"owner": "cosmos", "repo": "gaia", "label": "good first issue", "tags": ["cosmos", "core", "go"]},
    {"owner": "solana-labs", "repo": "solana", "label": "good first issue", "tags": ["solana", "core", "rust"]},
    {"owner": "solana-labs", "repo": "solana-program-library", "label": "good first issue", "tags": ["solana", "smartcontracts", "rust"]},
    {"owner": "metaplex-foundation", "repo": "mpl-token-metadata", "label": "good first issue", "tags": ["solana", "nft", "rust"]},
    {"owner": "bitcoin", "repo": "bitcoin", "label": "good first issue", "tags": ["bitcoin", "core", "cpp"]},
    {"owner": "lightningnetwork", "repo": "lnd", "label": "good first issue", "tags": ["bitcoin", "lightning", "go"]},
    {"owner": "ElementsProject", "repo": "lightning", "label": "good first issue", "tags": ["bitcoin", "lightning", "c"]},
    {"owner": "ipfs", "repo": "kubo", "label": "good first issue", "tags": ["ipfs", "web3", "go"]},
    {"owner": "Uniswap", "repo": "uniswap-interface", "label": "good first issue", "tags": ["defi", "frontend", "react"]}
]

OUTPUT_FILE = "/home/ubuntu/crypto-good-first-issues/public/issues.json"

def fetch_issues():
    all_issues = []
    headers = {
        "Accept": "application/vnd.github.v3+json"
        # Consider adding an Authorization header with a GitHub token if rate limits are hit
        # "Authorization": "token YOUR_GITHUB_TOKEN"
    }

    print(f"Fetching issues from {len(REPOS)} repositories...")

    for repo_info in REPOS:
        owner = repo_info["owner"]
        repo = repo_info["repo"]
        label = repo_info["label"]
        tags = repo_info["tags"]
        repo_full_name = f"{owner}/{repo}"

        print(f"Fetching issues for {repo_full_name} with label '{label}'...")

        # Construct the API URL
        # Note: GitHub API requires labels to be comma-separated if multiple, but here we need exact match for one label.
        # We need to URL encode the label name if it contains special characters, but these seem safe.
        api_url = f"https://api.github.com/repos/{owner}/{repo}/issues?state=open&labels={label}"

        try:
            response = requests.get(api_url, headers=headers, timeout=30)
            response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
            issues = response.json()

            print(f"Found {len(issues)} issues for {repo_full_name}.")

            for issue in issues:
                # Filter out pull requests if the API includes them
                if 'pull_request' not in issue:
                    all_issues.append({
                        "id": issue["id"],
                        "title": issue["title"],
                        "url": issue["html_url"],
                        "repository": repo_full_name,
                        "tags": tags,
                        "created_at": issue["created_at"],
                        "number": issue["number"]
                    })

            # Add a small delay to avoid hitting rate limits too quickly
            time.sleep(1)

        except requests.exceptions.RequestException as e:
            print(f"Error fetching issues for {repo_full_name}: {e}")
        except Exception as e:
            print(f"An unexpected error occurred for {repo_full_name}: {e}")

    print(f"Total issues fetched: {len(all_issues)}")

    # Save the issues to a JSON file
    try:
        os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(all_issues, f, ensure_ascii=False, indent=4)
        print(f"Successfully saved issues to {OUTPUT_FILE}")
    except IOError as e:
        print(f"Error writing issues to file {OUTPUT_FILE}: {e}")

if __name__ == "__main__":
    fetch_issues()

