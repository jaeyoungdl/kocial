// TimeSeriesHeatmap.js
import React, { useMemo } from 'react';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, Rectangle, ScatterChart } from 'recharts';

const TimeSeriesHeatmap = ({ issues }) => {
  const data = useMemo(() => {
    const keywordCounts = {};
    const dates = new Set();
    issues.forEach(issue => {
      const [year, month, week] = issue.topic_id.split('_').slice(1, 4);
      const date = `${year}-${month}-${week}`;
      dates.add(date);
      const keywords = issue.topic_iss_kwd.split(' ');
      keywords.forEach(keyword => {
        if (!keywordCounts[keyword]) {
          keywordCounts[keyword] = {};
        }
        keywordCounts[keyword][date] = (keywordCounts[keyword][date] || 0) + 1;
      });
    });

    const sortedDates = Array.from(dates).sort();
    const topKeywords = Object.entries(keywordCounts)
      .sort((a, b) => Object.values(b[1]).reduce((sum, count) => sum + count, 0) - 
                      Object.values(a[1]).reduce((sum, count) => sum + count, 0))
      .slice(0, 20)
      .map(([keyword]) => keyword);

    const result = [];
    topKeywords.forEach((keyword, index) => {
      sortedDates.forEach(date => {
        result.push({
          keyword,
          date,
          count: keywordCounts[keyword][date] || 0,
          index // for Y-axis
        });
      });
    });

    return result;
  }, [issues]);

  const CustomizedCell = ({ x, y, width, height, value }) => {
    const opacity = value / 30;
    return <Rectangle x={x} y={y} width={width} height={height} fill="#8884d8" fillOpacity={opacity} />;
  };

  return (
    <div style={{ width: '100%', height: 600 }}>
      <h3>시계열 히트맵</h3>
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 100 }}>
          <XAxis dataKey="date" type="category" interval={0} angle={-45} textAnchor="end" height={100} />
          <YAxis dataKey="index" type="number" domain={[0, 19]} ticks={Array.from({length: 20}, (_, i) => i)} 
                 tickFormatter={(value) => data[value * data.length / 20]?.keyword || ''} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <scatter data={data} shape={<CustomizedCell />} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimeSeriesHeatmap;