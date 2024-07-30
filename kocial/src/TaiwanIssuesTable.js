// TaiwanIssuesTable.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WeeklyIssueFrequencyChart from './WeeklyIssueFrequencyChart';
import TimeSeriesHeatmap from './TimeSeriesHeatmap';

const TaiwanIssuesTable = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/taiwan_issues?limit=825');
        setIssues(response.data);
        setLoading(false);
      } catch (err) {
        setError('데이터를 가져오는 중 오류가 발생했습니다.');
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>대만 관련 이슈</h2>
      <WeeklyIssueFrequencyChart issues={issues} />
      <TimeSeriesHeatmap issues={issues} />
      <table>
        <thead>
          <tr>
            <th>Topic ID</th>
            <th>Keyword Rank</th>
            <th>Topic Issue Keyword</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr key={issue.topic_id}>
              <td>{issue.topic_id}</td>
              <td>{issue.kwd_rank}</td>
              <td>{issue.topic_iss_kwd}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaiwanIssuesTable;