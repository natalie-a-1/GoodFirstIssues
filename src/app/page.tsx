"use client";

import React, { useState, useEffect } from 'react';
import { AppleButton } from '@/components/ui/apple-button';

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
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  // Apply all filters (tags and search query)
  useEffect(() => {
    applyFilters(selectedTags, searchQuery);
  }, [searchQuery, selectedTags, issues]);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle tag selection changes
  const handleTagChange = (tag: string) => {
    setSelectedTags(prevSelectedTags => {
      const newSelectedTags = prevSelectedTags.includes(tag)
        ? prevSelectedTags.filter(t => t !== tag)
        : [...prevSelectedTags, tag];
      return newSelectedTags;
    });
  };

  // Apply both tag filters and search query
  const applyFilters = (currentSelectedTags: string[], query: string) => {
    // First, filter by tags
    let results = issues;
    
    if (currentSelectedTags.length > 0) {
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
      results = issues.filter(issue => {
        return Object.values(selectedByCategory).every(selectedTags => {
          if (selectedTags.length === 0) return true;
          return selectedTags.some(tag => issue.tags.includes(tag));
        });
      });
    }

    // Then, filter by search query if it exists
    if (query.trim()) {
      const lowerQuery = query.toLowerCase().trim();
      results = results.filter(issue => 
        issue.title.toLowerCase().includes(lowerQuery) || 
        issue.repository.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredIssues(results);
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

  const clearAllFilters = () => {
    setSelectedTags([]);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gradient-to-b dark:from-[#0c0c0c] dark:to-background">
      <header className="py-16 px-8 text-center max-w-5xl mx-auto">
        <h1 className="text-xl md:text-3xl font-medium mb-4 tracking-tight dark:text-white">Good First Issues</h1>
        <p className="text-l text-muted-foreground max-w-2xl mx-auto">
          Find beginner-friendly issues in popular blockchain projects.
        </p>
        {lastUpdated && (
          <p className="text-sm text-muted-foreground mt-4 italic font-bold">
            Last updated: {lastUpdated}
          </p>
        )}
        
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search issues by title or repository..."
              className="w-full py-3 pl-12 pr-4 rounded-full border border-border dark:border-[#ffffff12] bg-white/80 dark:bg-[#1a1a1a] backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-primary/70 transition-all duration-300 dark:placeholder:text-muted-foreground/70 dark:focus:border-primary"
            />
            <svg 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-5xl mx-auto px-4 mb-8">
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg" role="alert">
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Section */}
          <aside className="w-full lg:w-1/4">
            <div className="sticky top-8 apple-card">
              <div className="flex justify-between items-center mb-6 p-6 border-b dark:border-[#ffffff12]">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filter by Tag</h2>
                {(selectedTags.length > 0 || searchQuery) && (
                  <AppleButton 
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs"
                  >
                    Clear All
                  </AppleButton>
                )}
              </div>
              
              {loading ? (
                <div className="p-6 pt-0 animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              ) : allTags.length > 0 ? (
                <div className="space-y-6 p-6 pt-0">
                  {Object.entries(categorizedTags).map(([category, tags]) =>
                    tags.length > 0 ? (
                      <div key={category}>
                        <h3 className="text-sm font-medium text-foreground mb-3">{category}</h3>
                        <div className="flex flex-wrap gap-2">
                          {tags.map(tag => (
                            <button
                              key={tag}
                              onClick={() => handleTagChange(tag)}
                              className={`${
                                selectedTags.includes(tag)
                                  ? 'bg-primary text-primary-foreground dark:text-white dark:bg-primary shadow-sm'
                                  : 'tag hover:bg-secondary/80 dark:hover:bg-[#252525]'
                              } transition-all duration-300`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              ) : (
                !error && <p className="text-muted-foreground text-sm p-6 pt-0">No tags available.</p>
              )}
            </div>
          </aside>

          {/* Issues List Section */}
          <main className="w-full lg:w-3/4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
              <h2 className="text-2xl font-medium text-foreground">
                <span className="text-primary">{filteredIssues.length}</span> Issues
              </h2>
              <div className="flex items-center mt-4 sm:mt-0">
                <label htmlFor="sortOrder" className="text-sm text-muted-foreground mr-2">Sort:</label>
                <select
                  id="sortOrder"
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="text-sm text-muted-foreground border-0 bg-transparent focus:ring-0 focus:outline-none dark:text-muted-foreground cursor-pointer"
                >
                  <option value="desc">Newest first</option>
                  <option value="asc">Oldest first</option>
                </select>
              </div>
            </div>
            
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="apple-card p-6 animate-pulse">
                    <div className="h-5 bg-muted rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
                    <div className="flex gap-2 mt-4">
                      <div className="h-6 w-16 bg-muted rounded-full"></div>
                      <div className="h-6 w-16 bg-muted rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredIssues.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                {sortedIssues.map(issue => (
                  <div key={issue.id} className="apple-card apple-hover">
                    <div className="p-6">
                      <h3 className="text-lg font-medium mb-2 line-clamp-2">
                        <a 
                          href={issue.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-foreground hover:text-primary transition-colors"
                        >
                          {issue.title}
                        </a>
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        <a 
                          href={`https://github.com/${issue.repository}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:text-primary transition-colors"
                        >
                          {issue.repository}
                        </a> • #{issue.number}
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {new Date(issue.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {issue.tags.slice(0, 4).map(tag => (
                          <span key={tag} className="tag">
                            {tag}
                          </span>
                        ))}
                        {issue.tags.length > 4 && (
                          <span className="tag">
                            +{issue.tags.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !error && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No issues match the selected filters.</p>
                  {(selectedTags.length > 0 || searchQuery) && (
                    <AppleButton 
                      variant="link" 
                      onClick={clearAllFilters}
                      className="mt-4"
                    >
                      Clear all filters
                    </AppleButton>
                  )}
                </div>
              )
            )}
          </main>
        </div>
      </div>
      
      <footer className="py-8 border-t border-border dark:border-[#ffffff12]">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Crypto & Web3 Good First Issues</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

