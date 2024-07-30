import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import id from './img/ID.jpg';
import my from './img/MY.jpg';
import ta from './img/TA.jpg';
import th from './img/TH.gif';
import vn from './img/VN.jpg';
import './css/PossibilityAnalysis.css'; // Import the CSS file

const countryFlags = {
  '인도네시아': id,
  '말레이시아': my,
  '대만': ta,
  '태국': th,
  '베트남': vn
};

const Log = ({ keyword, u_id }) => {
  const [analysis, setAnalysis] = useState(null); // 분석 데이터를 저장할 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(''); // 에러 상태
  const [expandedCountry, setExpandedCountry] = useState(null);

  const splitTextToSpans = (text) => {
    return text.split(' ').map((word, index) => (
      <span key={index} className="po-description-word">
        {word}
      </span>
    ));
  };

  const toggleCountry = (country) => {
    setExpandedCountry(expandedCountry === country ? null : country);
  };

  const renderMarkdown = (text) => {
    return (
      <ReactMarkdown
        components={{
          ol: ({ node, ...props }) => <div className="ana-space-y-2" {...props} />,
          ul: ({ node, ...props }) => <div className="ana-space-y-2" {...props} />,
          li: ({ node, ...props }) => <p className="ana-mb-2" {...props} />,
        }}
      >
        {text}
      </ReactMarkdown>
    );
  };

  // JSON 문자열을 정제하고 파싱
  const cleanAndParseJSON = (jsonString) => {
    try {
      const cleanJson = jsonString.replace(/^```json/, '').replace(/```$/, '').trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return {};
    }
  };

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        const response = await fetch(`/log?keyword=${encodeURIComponent(keyword)}&u_id=${encodeURIComponent(u_id)}`);
        
        // Check if the response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Expected JSON, but received non-JSON content');
        }
        
        const data = await response.json();
        setAnalysis(data); // 분석 데이터를 설정
        setLoading(false); // 로딩 완료
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message); // 에러 설정
        setLoading(false); // 로딩 완료
      }
    };

    if (keyword && u_id) {
      fetchAnalysisData();
    }
  }, [keyword, u_id]);

  if (loading) {
    return <p>Loading...</p>; // 로딩 중일 때
  }

  if (error) {
    return <p>Error: {error}</p>; // 에러 발생 시
  }

  if (!analysis) {
    return <p>No analysis data available.</p>; // 데이터가 없을 때
  }

  const parsedAnalysis = cleanAndParseJSON(analysis);

  // Prepare data for the chart
  const chartData = Object.keys(parsedAnalysis.ratings || {}).map(country => ({
    name: country,
    ...parsedAnalysis.ratings[country]
  }));

  const renderCountryAnalysis = (country, data) => {
    const isExpanded = expandedCountry === country;
    return (
      <div key={country} className="ana-country-analysis">
        <button
          className="ana-country-button"
          onClick={() => toggleCountry(country)}
        >
          <h3 className="ana-country-title">{country}</h3>
        </button>
        {isExpanded && (
          <div className="ana-country-details">
            <h4 className="ana-section-title">주요 키워드 및 트렌드</h4>
            <ul className="ana-keywords-list">
              {data.keywords.map((keyword, index) => (
                <li key={index} className='ana-keyword-item list-none'>{keyword}</li>
              ))}
            </ul>
            <h4 className="ana-section-title">현지화 정도</h4>
            <p>{splitTextToSpans(data.localization)}</p>
            <h4 className="ana-section-title">시장 잠재력</h4>
            <p>{splitTextToSpans(data.marketPotential)}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="ana-possibility-analysis">
      <div className="ana-chart-container">
        <ResponsiveContainer width="70%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ className: 'chart-text' }} />
            <YAxis tick={{ className: 'chart-text' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="관심도" fill="#8884d8" barSize={40} />
            <Bar dataKey="현지화가능성" fill="#82ca9d" barSize={40} />
            <Bar dataKey="시장잠재력" fill="#ffc658" barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="ana-recommendation-grid-container">
        <div className="ana-recommendation-grid">
          <div className="ana-recommendation-card">
            <h2 className="ana-results-title">국가별 분석 결과</h2>
            {Object.entries(parsedAnalysis.countries || {}).map(([country, data]) =>
              renderCountryAnalysis(country, data)
            )}
          </div>
          <div className="ana-recommendation-card">
            <div className="ana-best-country">
              <div className="ana-best-country-header">
                <h2 className="ana-best-country-title">최적 진출국</h2>
              </div>
              <div className="ana-best-country-content">
                {countryFlags[parsedAnalysis.bestCountry] && (
                  <img src={countryFlags[parsedAnalysis.bestCountry]} alt={`${parsedAnalysis.bestCountry} 국기`} className="ana-best-country-flag" />
                )}
                <div className="ana-best-country-name">
                  {parsedAnalysis.bestCountry}
                </div>
                <p className="ana-best-country-reason">{splitTextToSpans(parsedAnalysis.selectionReason)}</p>
              </div>
            </div>

            <div className="ana-entry-strategies">
              <div className="ana-entry-strategies-header">
                <h2 className="ana-entry-strategies-title">진출 전략</h2>
              </div>
              <div className="ana-entry-strategies-content">
                <ul className="ana-strategies-list">
                  {parsedAnalysis.entryStrategies.map((strategy, index) => (
                    <li key={index} className="ana-strategy-item list-none">{strategy}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Log;
