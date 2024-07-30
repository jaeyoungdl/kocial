import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Globe, TrendingUp, ArrowRight } from 'lucide-react';
import axios from 'axios';
import './css/Main.css';
import NavBar from './Navbar';
import topicCardImage1 from './img/ID.jpg';
import topicCardImage2 from './img/MY.jpg';
import topicCardImage3 from './img/TA.jpg';
import topicCardImage4 from './img/TH.gif';
import topicCardImage5 from './img/VN.jpg';

const countries = [
  { name: "인도네시아", flag: topicCardImage1, description: "인도네시아는 동남아시아 최대의 군도 국가로, 17,000개 이상의 섬으로 이루어져 있습니다. 다양한 문화와 자연 환경으로 유명하며, 발리와 같은 관광지로 세계적으로 알려져 있습니다." },
  { name: "말레이시아", flag: topicCardImage2, description: "말레이시아는 동남아시아의 연방 입헌 군주국으로, 다민족 다문화 국가입니다. 쿠알라룸푸르의 페트로나스 트윈 타워와 같은 현대적인 랜드마크와 열대 우림의 자연이 공존하는 나라입니다." },
  { name: "대만", flag: topicCardImage3, description: "대만은 동아시아의 섬나라로, 하이테크 산업과 전통문화가 조화롭게 공존하는 곳입니다. 타이페이 101과 같은 현대적인 건축물과 야시장 문화로 유명합니다." },
  { name: "태국", flag: topicCardImage4, description: "태국은 동남아시아의 중심에 위치한 국가로, 풍부한 문화유산과 아름다운 해변으로 유명합니다. 방콕의 화려한 사원들과 푸켓의 열대 해변은 세계적인 관광지입니다." },
  { name: "베트남", flag: topicCardImage5, description: "베트남은 동남아시아의 역동적인 국가로, 긴 해안선과 풍부한 역사를 자랑합니다. 하롱 베이의 석회암 절벽과 호치민 시의 현대적인 도시 풍경이 공존하는 곳입니다." },
];

const RightArrowClick = ({ onClick }) => {
  return (
    <div className="arrow-click">
      <ArrowRight 
        size={48}
        className="arrow-icon"
        onClick={onClick}
      />
    </div>
  );
};

const Main = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [topWords, setTopWords] = useState([]);
  const navigate = useNavigate();

  const splitTextToSpans = (text) => {
    return text.split(' ').map((word, index) => (
      <span key={index} className="description-word">
        {word}
      </span>
    ));
  };

  useEffect(() => {
    const fetchTopWords = async () => {
      try {
        const encodedCountry = encodeURIComponent(selectedCountry.name);
        const response = await axios.get(`http://localhost:8000/top_words/${encodedCountry}`);
        setTopWords(response.data.words);
      } catch (error) {
        console.error("Error fetching top words:", error.response?.data || error.message);
        setTopWords([]);
      }
    };

    fetchTopWords();
  }, [selectedCountry]);

  const handleTrendButtonClick = () => {
    navigate(`/Trend/${encodeURIComponent(selectedCountry.name)}`);
  };

  return (
    <div className="main-container">
      <RightArrowClick onClick={handleTrendButtonClick} />
      <div className="arrow-container">
        <RightArrowClick onClick={handleTrendButtonClick} />
        <span className="arrow-text">다음<br></br>STEP!</span>
      </div>
      <NavBar />
      <div className="content">
        <div className="logo-container">
          <h1 className="main-main-logo">STEP 1</h1>
        </div>
        
        <div className="flex-wrapper">
          <div className="left-column">
            <h2 className="main-section-title">
              <Globe className="main-icon" />
              어느 국가가 궁금하세요?
            </h2>
            <div className={`dropdown-wrapper ${isDropdownOpen ? 'open' : ''}`}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="dropdown-button"
              >
                <span className="dropdown-label">
                  <img src={selectedCountry.flag} alt={selectedCountry.name} className="flag-icon" />
                  {selectedCountry.name}
                </span>
                <ChevronDown />
              </button>
              <div className="dropdown-menu">
                {countries.map((country, index) => (
                  <div 
                    key={index} 
                    className="dropdown-item"
                    onClick={() => {
                      setSelectedCountry(country);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <img src={country.flag} alt={country.name} className="flag-icon" />
                    {country.name}
                  </div>
                ))}
              </div>
            </div>
            {selectedCountry && (
              <div className="country-card">
                <div className="country-flag">
                  <img 
                    src={selectedCountry.flag} 
                    alt={selectedCountry.name} 
                    className="flag-image"
                  />
                </div>
                <div className="country-description">
                  <h3 className="country-name">{selectedCountry.name}</h3>
                  <p className="description-text">{splitTextToSpans(selectedCountry.description)}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="right-column">
          <h2 className="main-section-title">
              <TrendingUp className="main-icon" />
              TREND
            </h2>
            <div className="trend-card">
              <div className="table-wrapper">
                <table className="trend-table">
                  <thead>
                    <tr>
                      <th className="table-header">순위</th>
                      <th className="table-header">단어</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {topWords.map((word, index) => (
                      <tr 
                        key={word.rank}
                        className="table-row"
                      >
                        <td className="rank-cell">{word.rank}</td>
                        <td className="word-cell">{word.word}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Main;
