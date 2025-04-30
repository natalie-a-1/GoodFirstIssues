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

  // Fetch issues data on component mount
  useEffect(() => {
    const fetchIssuesData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/issues.json');
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

  // Filter issues based on selected tags
  const filterIssues = (currentSelectedTags: string[]) => {
    if (currentSelectedTags.length === 0) {
      setFilteredIssues(issues); // Show all if no tags are selected
    } else {
      const newFilteredIssues = issues.filter(issue =>
        currentSelectedTags.every(tag => issue.tags.includes(tag))
      );
      setFilteredIssues(newFilteredIssues);
    }
  };

  return (
    <div className="container mx-auto p-4 font-sans">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Crypto/Web3 Good First Issues</h1>
        <p className="text-lg text-gray-600">Find beginner-friendly issues in popular blockchain projects.</p>
        <p className="text-sm text-gray-500 mt-2">Data last updated based on the latest run of the fetch script.</p>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Section */}
        <aside className="w-full md:w-1/4">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Filter by Tag</h2>
          {loading ? (
            <p>Loading tags...</p>
          ) : allTags.length > 0 ? (
            <div className="space-y-2">
              {allTags.map(tag => (
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
          ) : (
            !error && <p>No tags available.</p>
          )}
        </aside>

        {/* Issues List Section */}
        <main className="w-full md:w-3/4">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Issues ({filteredIssues.length})</h2>
          {loading ? (
            <p>Loading issues...</p>
          ) : filteredIssues.length > 0 ? (
            <ul className="space-y-4">
              {filteredIssues.map(issue => (
                <li key={issue.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white">
                  <h3 className="text-xl font-medium mb-1">
                    <a href={issue.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {issue.title}
                    </a>
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    <a href={`https://github.com/${issue.repository}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {issue.repository}
                    </a> - Issue #{issue.number}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {issue.tags.map(tag => (
                      <span key={tag} className="bg-gray-200 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded capitalize">
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

