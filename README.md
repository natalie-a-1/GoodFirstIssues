# Crypto & Web3 Good First Issues Finder

This project displays beginner-friendly ("good first issue") GitHub issues from various crypto, web3, blockchain, and DeFi repositories. It allows users to filter issues by relevant tags.

## Project Structure

- `/public/issues.json`: Static data file containing the fetched GitHub issues. The frontend reads data from here.
- `/scripts/fetch_issues.py`: Python script to fetch the latest "good first issue" data from the configured GitHub repositories.
- `/src/app/page.tsx`: The main Next.js page component that displays the issues and provides filtering.
- `package.json`: Project configuration, including the script to update issues.

## Running Locally

1.  **Install Dependencies:**
    ```bash
    pnpm install
    ```
    *(Note: The Python script requires `requests`. Ensure you have Python 3.11 and run `python3.11 -m pip install requests` if you encounter issues running the update script directly.)*

2.  **Fetch/Update Issues:**
    To populate or update the `public/issues.json` file with the latest issues from GitHub, run:
    ```bash
    pnpm run update-issues
    ```
    This executes the `scripts/fetch_issues.py` script.

3.  **Run Development Server:**
    ```bash
    pnpm dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Updating Issues Data

Since automatic scheduling (cron jobs) is not directly supported in this setup, you need to manually update the issue data by running:

```bash
pnpm run update-issues
```

This command fetches the latest issues labeled as "good first issue" (or similar variants) from the predefined list of repositories and overwrites the `public/issues.json` file.

After updating the data, you will need to rebuild and redeploy the site if it's hosted statically (like on GitHub Pages) for the changes to be reflected.

## Potential Automation (GitHub Actions)

If you plan to host this project on GitHub Pages, you could potentially automate the `pnpm run update-issues` command using GitHub Actions. A scheduled workflow could run the script periodically, commit the updated `issues.json` file back to the repository, and trigger a redeployment of the GitHub Pages site.

## Building for Production

```bash
pnpm build
```

This command builds the Next.js application for production usage.

