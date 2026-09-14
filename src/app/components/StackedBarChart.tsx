import React from 'react';
import Chart, { Series, ArgumentAxis, ValueAxis, Legend, CommonSeriesSettings } from 'devextreme-react/chart';

const chartData = [
  { quarter: 'Q1', series1: 8000, series2: 5000 },
  { quarter: 'Q2', series1: 6000, series2: 4500 },
  { quarter: 'Q3', series1: 7000, series2: 7000 },
  { quarter: 'Q4', series1: 5500, series2: 2500 }
];

export const StackedBarChart = () => {
  return (
    <div className="chart-card">
      <h3 className="chart-title">Stacked bar chart</h3>
      <Chart
        dataSource={chartData}
        className="chart-standard"
      >
        <CommonSeriesSettings
          argumentField="quarter"
          type="stackedbar"
        />
        <Series
          valueField="series1"
          name="Label"
          color="#5236ab"
        />
        <Series
          valueField="series2"
          name="Label"
          color="#e31937"
        />
        <ArgumentAxis />
        <ValueAxis />
        <Legend
          verticalAlignment="bottom"
          horizontalAlignment="center"
          itemTextPosition="right"
        />
      </Chart>
    </div>
  );
};
