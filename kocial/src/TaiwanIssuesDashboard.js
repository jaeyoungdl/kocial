import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TaiwanIssuesDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [monthlyIssues, setMonthlyIssues] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const issuesResponse = await axios.get('http://localhost:8000/taiwan_issues');
        setIssues(issuesResponse.data);

        const monthlyResponse = await axios.get('http://localhost:8000/monthly_taiwan_issues');
        setMonthlyIssues(monthlyResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard">
      <h1>대만 관련 이슈 대시보드</h1>
      
      <h2>월별 대만 관련 이슈 수</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={monthlyIssues}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      <h2>최근 대만 관련 이슈 목록</h2>
      <ul>
        {issues.slice(0, 10).map((issue, index) => (
          <li key={issue.topic_id}>
            {issue.topic_iss_kwd} (순위: {issue.kwd_rank})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaiwanIssuesDashboard;