import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WeeklyIssueFrequencyChart = ({ issues }) => {
  const data = useMemo(() => {
    const weekData = {};
    issues.forEach(issue => {
      const [year, month, week] = issue.topic_id.split('_').slice(1, 4);
      const key = `${year}-${month}-${week}`;
      if (!weekData[key]) {
        weekData[key] = { date: key, count: 0, keywords: {} };
      }
      weekData[key].count += 1;
      const keywords = issue.topic_iss_kwd.split(' ');
      keywords.forEach(keyword => {
        weekData[key].keywords[keyword] = (weekData[key].keywords[keyword] || 0) + 1;
      });
    });

    return Object.values(weekData).map(week => ({
      ...week,
      topKeywords: Object.entries(week.keywords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([keyword, count]) => `${keyword} (${count})`)
        .join(', ')
    }));
  }, [issues]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const weekData = payload[0].payload;
      return (
        <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc' }}>
          <p><strong>{label}</strong></p>
          <p>이슈 수: {weekData.count}</p>
          <p>주요 키워드:</p>
          <ul>
            {weekData.topKeywords.split(', ').map((keyword, index) => (
              <li key={index}>{keyword}</li>
            ))}
          </ul>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 400 }}>
      <h3>주차별 이슈 빈도</h3>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyIssueFrequencyChart;