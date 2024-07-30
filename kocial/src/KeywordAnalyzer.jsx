import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const KeywordAnalyzer = () => {
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError('Please enter a keyword to search.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const searchResponse = await fetch('http://localhost:8000/analyze_keyword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword }),
      });
      if (!searchResponse.ok) {
        const errorData = await searchResponse.json();
        throw new Error(errorData.detail || 'An error occurred while fetching search data');
      }
      const searchData = await searchResponse.json();
      setSearchResults(searchData);
    } catch (error) {
      console.error('Error in handleSearch:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="keyword-analyzer max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="search-input-container flex mb-6">
        <input
          type="text"
          placeholder="Enter a keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-grow px-4 py-2 text-gray-700 bg-gray-200 rounded-l-lg focus:outline-none focus:bg-white focus:border-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="px-6 py-2 text-white bg-blue-500 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:shadow-outline disabled:bg-blue-300"
        >
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>
      {error && <p className="error text-red-500 mb-4">{error}</p>}
      {searchResults && (
        <div className="search-results">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Analysis Results for "{keyword}"</h2>
          <div className="overflow-x-auto">
            <table className="results-table w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">Country</th>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Content</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {searchResults.map((result, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{result.country}</td>
                    <td className="px-4 py-2">{result.title}</td>
                    <td className="px-4 py-2">
                      <ReactMarkdown className="prose max-w-none">
                        {truncateText(result.sentence, 50)}
                      </ReactMarkdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeywordAnalyzer;