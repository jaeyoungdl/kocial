import React, { useEffect, useState, useRef } from 'react';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import axios from 'axios';

const SortedBarChart = ({ country, chartId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [country]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/top_words/${encodeURIComponent(country)}`);
      setData(response.data.words);
    } catch (error) {
      console.error('Error fetching bar chart data:', error);
    } finally {
      setLoading(false);
    }
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

    let yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "word",
        renderer: am5xy.AxisRendererY.new(root, {
          inversed: true,
          cellStartLocation: 0.1,
          cellEndLocation: 0.9
        })
      })
    );

    let xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererX.new(root, {})
      })
    );

    // 폰트 크기 설정
    yAxis.get("renderer").labels.template.setAll({
      fontSize: "15px"  // y 축 레이블의 폰트 크기 설정
    });

    xAxis.get("renderer").labels.template.setAll({
      fontSize: "15px"  // x 축 레이블의 폰트 크기 설정
    });

    let series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "Series 1",
        xAxis: xAxis,
        yAxis: yAxis,
        valueXField: "count",
        categoryYField: "word",
        tooltip: am5.Tooltip.new(root, {
          labelText: "{valueX}"
        })
      })
    );

    series.columns.template.setAll({
      cornerRadiusTR: 8,
      cornerRadiusBR: 5,
      strokeOpacity: 0
    });

    // 시리즈 툴팁의 폰트 크기 설정
    series.columns.template.setAll({
      tooltipText: "{valueX}",
      fontSize: "12px"
    });

    yAxis.data.setAll(data);
    series.data.setAll(data);

    series.appear(1000);
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [data, chartId]);

  if (loading) {
    return <div>Loading chart...</div>;
  }

  return <div id={chartId} style={{ width: "100%", height: "500px" }}></div>;
};

export default SortedBarChart;
