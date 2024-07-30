import React, { useEffect, useState, useRef } from 'react';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { ChevronDown } from 'lucide-react';

const TimeSeriesChart = ({ country,chartId }) => {
  const [data, setData] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [chart, setChart] = useState(null);
  const chartRef = useRef(null);
  useEffect(() => {
    fetchData();
  }, [country]);

  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/timeseries/${encodeURIComponent(country)}`);
      const result = await response.json();
      const processedData = processDataByMonth(result);
      setData(processedData);
      if (processedData.length > 0) {
        setSelectedTopic(processedData[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const processDataByMonth = (rawData) => {
    const monthlyData = rawData.reduce((acc, item) => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[item.topic_num]) {
        acc[item.topic_num] = {
          topicData: {},
          mainKeyword: item.main_kwd
        };
      }
      
      if (!acc[item.topic_num].topicData[monthKey]) {
        acc[item.topic_num].topicData[monthKey] = {
          date: monthKey,
          frequency: 0
        };
      }
      
      acc[item.topic_num].topicData[monthKey].frequency += item.frequency;
      return acc;
    }, {});

    return Object.entries(monthlyData).map(([topic_num, { topicData, mainKeyword }]) => ({
      topic_num,
      mainKeyword,
      data: Object.values(topicData)
    }));
  };

  useEffect(() => {
    if (data.length === 0) return;

    if (chartRef.current) {
      chartRef.current.dispose();
    }

    let root = am5.Root.new(chartId);
    chartRef.current = root;

    root.setThemes([am5themes_Animated.new(root)]);

    let chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panY: false,
        layout: root.verticalLayout
      })
    );

    let xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "date",
        renderer: am5xy.AxisRendererX.new(root, {}),
        tooltip: am5.Tooltip.new(root, {})
      })
    );

    let yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {})
      })
    );

    let series = chart.series.push(
      am5xy.SmoothedXYLineSeries.new(root, {
        name: `${selectedTopic.mainKeyword}`,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "frequency",
        categoryXField: "date",
        tooltip: am5.Tooltip.new(root, {
          labelText: "{name}: {valueY}"
        }),
        tension: 0.1,
        stroke: am5.color(0x095256),
        strokeWidth: 2
      })
    );

    series.bullets.push(function() {
      return am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, {
          radius: 5,
          fill: series.get("fill")
        })
      });
    });

    series.data.setAll(selectedTopic.data);
    xAxis.data.setAll(selectedTopic.data);

    chart.set("cursor", am5xy.XYCursor.new(root, {
      behavior: "none",
      xAxis: xAxis,
      yAxis: yAxis
    }));

    chart.set("scrollbarX", am5.Scrollbar.new(root, {
      orientation: "horizontal"
    }));

    setChart(chart);

    return () => {
      root.dispose();
    };
  }, [data, selectedTopic]);
  
  const handleTopicChange = (topic) => {
    setSelectedTopic(topic);
    setIsDropdownOpen(false);
    
    if (chart) {
      let series = chart.series.getIndex(0);
      series.data.setAll(topic.data);
      series.set("name", `${topic.mainKeyword}`);
    }
  };

  return (
    <div className="flex flex-col items-start">
      <div className="w-full mb-4">
        <div className="relative inline-block text-left">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="inline-flex justify-center w-64 rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {selectedTopic ? `${selectedTopic.mainKeyword}` : 'Select a topic'}
            <ChevronDown className="-mr-1 ml-2 h-5 w-5" />
          </button>
          {isDropdownOpen && (
            <div className="origin-top-right absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                {data.map((topic) => (
                  <a
                    key={topic.topic_num}
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    role="menuitem"
                    onClick={() => handleTopicChange(topic)}
                  >
                    {topic.mainKeyword}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div  id={chartId} style={{ width: "100%", height: "500px" }}></div>
    </div>
  );
};

export default TimeSeriesChart;