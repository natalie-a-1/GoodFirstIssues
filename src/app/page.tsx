"use client";

import React, { useState, useEffect } from 'react';

interface Issue {
  id: number;
  title: string;
  url: string;
  repository: string;
  tags: string[];
  created_at: string;
  number: number;
}

const HomePage: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Fetch issues data on component mount
  useEffect(() => {
    const fetchIssuesData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/issues.json');
        const lastModifiedHeader = response.headers.get('Last-Modified');
        if (lastModifiedHeader) {
          setLastUpdated(new Date(lastModifiedHeader).toLocaleString());
        }
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Issue[] = await response.json();
        setIssues(data);

        // Extract unique tags
        const tagsSet = new Set<string>();
        data.forEach(issue => {
          issue.tags.forEach(tag => tagsSet.add(tag));
        });
        const sortedTags = Array.from(tagsSet).sort();
        setAllTags(sortedTags);

        setFilteredIssues(data); // Initially show all issues
        setError(null);
      } catch (e) {
        console.error("Error fetching issues:", e);
        setError('Failed to load issues. Please try running the fetch script again or check the console.');
        setIssues([]);
        setAllTags([]);
        setFilteredIssues([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIssuesData();
  }, []);

  // Handle tag selection changes
  const handleTagChange = (tag: string) => {
    setSelectedTags(prevSelectedTags => {
      const newSelectedTags = prevSelectedTags.includes(tag)
        ? prevSelectedTags.filter(t => t !== tag)
        : [...prevSelectedTags, tag];

      // Filter issues based on new selected tags
      filterIssues(newSelectedTags);
      return newSelectedTags;
    });
  };

  // Filter issues based on selected tags (OR within categories, AND across categories)
  const filterIssues = (currentSelectedTags: string[]) => {
    if (currentSelectedTags.length === 0) {
      setFilteredIssues(issues);
      return;
    }

    // Build selected tags grouped by category
    const selectedByCategory: Record<string, string[]> = {};
    Object.entries(tagCategoryMap).forEach(([category, tags]) => {
      selectedByCategory[category] = currentSelectedTags.filter(tag => tags.includes(tag));
    });
    // Handle tags outside known categories
    const known = Object.values(tagCategoryMap).flat();
    const others = currentSelectedTags.filter(tag => !known.includes(tag));
    if (others.length > 0) {
      selectedByCategory["Other"] = others;
    }

    // Issue must match at least one selected tag per category
    const newFiltered = issues.filter(issue => {
      return Object.values(selectedByCategory).every(selectedTags => {
        if (selectedTags.length === 0) return true;
        return selectedTags.some(tag => issue.tags.includes(tag));
      });
    });

    setFilteredIssues(newFiltered);
  };

  // Group tags into categories
  const tagCategoryMap: Record<string, string[]> = {
    "Blockchains": ["ethereum", "polkadot", "cosmos", "solana", "bitcoin", "ipfs", "defi", "web3"],
    "Languages": ["go", "rust", "javascript", "python", "solidity", "cpp", "c", "react"],
    "Domains": ["core", "consensus", "docs", "frontend", "tooling", "smartcontracts", "language", "infrastructure", "nft", "lightning"]
  };
  let categorizedTags: Record<string, string[]> = Object.entries(tagCategoryMap).reduce((acc, [category, tags]) => {
    acc[category] = tags.filter(tag => allTags.includes(tag));
    return acc;
  }, {} as Record<string, string[]>);
  const knownTags = Object.values(tagCategoryMap).flat();
  const otherTags = allTags.filter(tag => !knownTags.includes(tag));
  if (otherTags.length > 0) {
    categorizedTags["Other"] = otherTags;
  }

  // Compute sorted issues by created date
  const sortedIssues = filteredIssues.slice().sort((a, b) => {
    const aTime = new Date(a.created_at).getTime();
    const bTime = new Date(b.created_at).getTime();
    return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      <header className="mb-12 text-center border-b pb-8">
        <h1 className="text-5xl font-extrabold mb-4">Good First Issues</h1>
        <p className="text-lg text-gray-600">Find beginner-friendly issues in popular blockchain projects.</p>
        <p className="text-sm text-gray-500 mt-2">
          {lastUpdated ? `Data last updated: ${lastUpdated}` : 'Loading last update...'}
        </p>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Section */}
        <aside className="w-full lg:w-1/4 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xs font-semibold text-gray-500 uppercase mb-4">Filter by Tag</h2>
          {loading ? (
            <p>Loading tags...</p>
          ) : allTags.length > 0 ? (
            <div>
              {Object.entries(categorizedTags).map(([category, tags]) =>
                tags.length > 0 ? (
                  <div key={category} className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase mt-4 mb-2">{category}</h3>
                    <div className="space-y-2 ml-4">
                      {tags.map(tag => (
                        <div key={tag} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`tag-${tag}`}
                            checked={selectedTags.includes(tag)}
                            onChange={() => handleTagChange(tag)}
                            className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`tag-${tag}`} className="text-gray-700 capitalize cursor-pointer">
                            {tag}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null
              )}
            </div>
          ) : (
            !error && <p>No tags available.</p>
          )}
        </aside>

        {/* Issues List Section */}
        <main className="w-full lg:w-3/4 bg-white p-6 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold border-b pb-2">Issues ({filteredIssues.length})</h2>
            <div className="flex items-center space-x-2">
              <label htmlFor="sortOrder" className="text-sm font-medium">Sort by date:</label>
              <select
                id="sortOrder"
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="border-gray-300 rounded"
              >
                <option value="asc">Oldest first</option>
                <option value="desc">Newest first</option>
              </select>
            </div>
          </div>
          {loading ? (
            <p>Loading issues...</p>
          ) : filteredIssues.length > 0 ? (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sortedIssues.map(issue => (
                <li key={issue.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-semibold mb-2">
                    <a href={issue.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {issue.title}
                    </a>
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    <a href={`https://github.com/${issue.repository}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {issue.repository}
                    </a> • #{issue.number}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    Opened: {new Date(issue.created_at).toLocaleDateString()}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {issue.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            !error && <p>No issues match the selected filters, or no issues were found.</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default HomePage;

