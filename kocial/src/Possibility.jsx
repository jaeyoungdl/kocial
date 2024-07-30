import React, { useState } from 'react';
import NavBar from './Navbar'
import './css/Possibility.css';
import ReactMarkdown from 'react-markdown';
import PossibilityAnalysis from './PossibilityAnalysis';
import analysis from './img/bigdata.svg'
import { ArrowLeft, FileQuestion } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
const LeftArrowClick = ({ onClick }) => {
  return (
    <div className="leftarrow-click">
      <ArrowLeft
        size={48}
        className="arrow-icon"
        onClick={onClick}
      />
    </div>

  );
};



const Possibility = () => {
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [possibilityAnalysis, setPossibilityAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [heritage, setHeritage] = useState('');
  const [food, setFood] = useState('');
  const { isLoggedIn, logout, userName } = useAuth();
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const navigate = useNavigate();
  const handleleftButtonClick = () => {
    Navigate('/Trend');
  };


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
      setIsAnalysisLoading(true);
      const analysisResponse = await fetch('http://localhost:8000/analyze_possibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          keyword: keyword,
          user_id: userName 
        }),
      });

      if (!searchResponse.ok) {
        const errorData = await searchResponse.json();
        throw new Error(errorData.detail || 'An error occurred while fetching search data');
      }

      if (!analysisResponse.ok) {
        if (analysisResponse.status === 402) {
          alert('사용 가능한 이용권이 없습니다. 이용권을 구매해 주세요.');
          navigate('/mypage');
          return;
        }
        const errorData = await analysisResponse.json();
        throw new Error(errorData.detail || 'An error occurred while fetching analysis data');
      }

      const searchData = await searchResponse.json();
      const analysisData = await analysisResponse.json();

      setSearchResults(searchData);
      setPossibilityAnalysis(analysisData.analysis);
    } catch (error) {
      console.error('Error in handleSearch:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsAnalysisLoading(false);
      setIsLoading(false);
    }
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };


  
  return (
    <div className="possibility-container">
      <NavBar />
      <main className="main">
        {/* <LeftArrowClick onClick={handleleftButtonClick} /> */}
        <div className="search-section">
          <div className="po-search-container">
            <div className="search-header">
              <h1 className="po-main-logo">STEP3</h1>
              <div className="search-input-container">
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  className="search-input"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
                <button className="search-button" onClick={handleSearch} disabled={isLoading}>
                    {isLoading ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
            </div>
            <img src={analysis} className="bigdata" />
          </div>
        </div>

        <div>
          <div className="content-section">
              {isAnalysisLoading && (
              <div className="loading-overlay">
                <div className="loading-content">
                  <div className="spinner"></div>
                  <p>분석 중입니다...</p>
                </div>
              </div>
            )}
            <h1 className="main-title">Your Possibility</h1>
            {searchResults ? (
              <div className="search-results">
                {/* <h2>Search Results for "{keyword}"</h2> */}
                <table className="results-table">
                  <thead>
                    {/* <tr>
                      <th>Country</th>
                      <th>Title</th>
                      <th>Content</th>
                    </tr> */}
                  </thead>
                  {/* <tbody>
                    {searchResults.map((result, index) => (
                      <tr key={index}>
                        <td>{result.country}</td>
                        <td>{result.title}</td>
                        <td>
                          <ReactMarkdown>
                            {truncateText(result.sentence, 50)}
                          </ReactMarkdown>
                        </td>
                      </tr>
                    ))}
                  </tbody> */}
                </table>
              </div>
            ) : (
              <p className="main-description">
             
              </p>
            )}
            {possibilityAnalysis && (
              <PossibilityAnalysis analysis={possibilityAnalysis} />
            )}
            {/* <h2 className="sub-title">추천</h2>
            <div class="recommendation-grid-container">
              <div class="recommendation-grid">
                <div className="recommendation-card">
                </div>
                <div className="recommendation-card">
                  <p className="card-text">
                    Most people start with "freelancing skills" they already have as a side hustle to build up income. This extra cash can be used for expenses, to boost savings or investing, build business...
                  </p>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </main>
    </div>

  );
};

export default Possibility;