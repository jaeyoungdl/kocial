import React, { useEffect, useState } from 'react';
import { Cloud, Newspaper, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom'; // useParams 훅을 임포트합니다.
import axios from 'axios';
import NavBar from './Navbar';
import ReactMarkdown from 'react-markdown';
import './css/Trend.css';
import topicCardImage1 from './img/ID.jpg';
import topicCardImage2 from './img/MY.jpg';
import topicCardImage3 from './img/TA.jpg';
import topicCardImage4 from './img/TH.gif';
import topicCardImage5 from './img/VN.jpg';
import TimeSeriesChart from './TimeSeriesChart';
import SortedBarChart from './SortedBarChart';
const countries = [
    { name: "인도네시아", flag: topicCardImage1 },
    { name: "말레이시아", flag: topicCardImage2 },
    { name: "대만", flag: topicCardImage3 },
    { name: "태국", flag: topicCardImage4 },
    { name: "베트남", flag: topicCardImage5 },
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

const Trend = () => {
    const { country } = useParams(); // URL 파라미터에서 국가 이름을 가져옵니다.
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [issueSummary, setIssueSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [timeSeriesData, setTimeSeriesData] = useState([]);
    const [barSeriesData, setBarSeriesData] = useState([]);
    const navigate = useNavigate();

    const splitTextToSpans = (text) => {
        return text.split(' ').map((word, index) => (
          <span key={index} className="description-word">
            {word}
          </span>
        ));
      };

    useEffect(() => {
        if (country) {
            const foundCountry = countries.find(c => c.name === decodeURIComponent(country));
            if (foundCountry) {
                setSelectedCountry(foundCountry);
            } else {
                setSelectedCountry(countries[0]); // 기본 국가를 설정합니다.
            }
        }
    }, [country]);

    useEffect(() => {
        if (selectedCountry) {
            fetchSummary();
            fetchTimeSeriesData();
            fetchBarSeriesData();
        }
    }, [selectedCountry]);

    const handleMainButtonClick = () => {
        navigate(`/Main`);
    };

    const handlePoButtonClick = () => {
        navigate(`/Possibility`);
    };



    const fetchSummary = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:8000/summarize', {
                country: selectedCountry.name
            });
            setIssueSummary(response.data.summary);
        } catch (error) {
            console.error('Error fetching summary:', error);
            setIssueSummary('데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTimeSeriesData = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/timeseries/${encodeURIComponent(selectedCountry.name)}`);
            setTimeSeriesData(response.data);
        } catch (error) {
            console.error('Error fetching time series data:', error);
        }
    };

    const fetchBarSeriesData = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/top_words/${encodeURIComponent(selectedCountry.name)}`);
            setBarSeriesData(response.data);
        } catch (error) {
            console.error('Error fetching time series data:', error);
        }
    };


    if (!selectedCountry) {
        return <div>Loading...</div>;
    }

    return (
        <div className="trend-analysis-container">
            <NavBar />
            <main className="main">
                <div className="arrow-container">
                    <LeftArrowClick onClick={handleMainButtonClick} />
                    <span className="leftarrow-text">이전<br></br>STEP!</span>
                </div>
                <div className="search-section">
                    <div className="search-container">
                        <h1 className="trend-main-logo">STEP 2</h1>
                        <div className="image-wrapper">
                            <h1 className="image-text">{selectedCountry.name.toUpperCase()}</h1>
                            <img src={selectedCountry.flag} className="custom-image" alt={`${selectedCountry.name} Flag`} />
                        </div>
                    </div>
                </div>
                <div className="content">
                    <div className="recommendation-container">
                        <div className="issue-keywords-card">
                            <h2>
                                <Cloud size={20} />
                                <span className="card-title-text">이슈 요약</span>
                            </h2>
                            {isLoading ? (
                                <p>이슈 요약을 불러오는 중...</p>
                            ) : (
                                <ReactMarkdown className="markdown-content">{issueSummary}</ReactMarkdown>
                            )}
                        </div>
                        <div className="issue-topic-card">
                            <h2>
                                <Newspaper size={20} />
                                <span className="card-title-text">토픽그래프</span>
                            </h2>
                            <SortedBarChart country={selectedCountry.name} chartId="chartdiv" />
                        </div>
                    </div>
                </div>
                <div className="content">
                    <div className="recommendation-container">
                        <div className="issue-history-card">
                            <h2>
                                <Newspaper size={20} />
                                <span className="card-title-text">이슈 히스토리</span>
                            </h2>
                            <TimeSeriesChart country={selectedCountry.name} chartId="timeseriesdiv" />
                        </div>
                    </div>
                </div>
            </main>
            <div className="arrow-container">
        <RightArrowClick onClick={handlePoButtonClick} />
        <span className="arrow-text">다음<br></br>STEP!</span>
      </div>
        </div>
    );
};

export default Trend;
