import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import PossibilityAnalysis from './PossibilityAnalysis';
import NavBar from './Navbar';
import './css/Mypage.css';
const AnalysisDetail = () => {
  const { logId } = useParams();
  const [analysisData, setAnalysisData] = useState(null);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/analysis_data/${logId}`);
        setAnalysisData(response.data.analysis_data);
      } catch (error) {
        console.error('Error fetching analysis data:', error);
      }
    };

    fetchAnalysisData();
  }, [logId]);

  if (!analysisData) return <div>Loading...</div>;

  return (
    
    <div className="mypage-container mb-10">
        <NavBar />
        <p>{analysisData.keyword}</p>
    <PossibilityAnalysis analysis={analysisData} />
    </div>
  );
};

export default AnalysisDetail;