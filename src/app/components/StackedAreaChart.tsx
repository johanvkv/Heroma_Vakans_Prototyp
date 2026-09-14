import React from 'react';
import Chart, { Series, ArgumentAxis, ValueAxis, Legend, CommonSeriesSettings } from 'devextreme-react/chart';

const chartData = [
  { month: 'Apr', series1: 30, series2: 20, series3: 15, series4: 10 },
  { month: 'May', series1: 35, series2: 18, series3: 12, series4: 8 },
  { month: 'Jun', series1: 25, series2: 22, series3: 18, series4: 12 },
  { month: 'Jul', series1: 40, series2: 15, series3: 10, series4: 15 },
  { month: 'Aug', series1: 32, series2: 25, series3: 20, series4: 10 },
  { month: 'Sep', series1: 38, series2: 20, series3: 15, series4: 12 },
  { month: 'Oct', series1: 30, series2: 28, series3: 16, series4: 8 }
];

export const StackedAreaChart = () => {
  return (
    <div className="chart-card">
      <h3 className="chart-title">Stacked area chart</h3>
      <Chart
        dataSource={chartData}
        className="chart-standard"
      >
        <CommonSeriesSettings
          argumentField="month"
          type="stackedarea"
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
        <Series
          valueField="series3"
          name="Label"
          color="#ff978a"
        />
        <Series
          valueField="series4"
          name="Label"
          color="#fde5a7"
        />
        <ArgumentAxis />
        <ValueAxis
          valueMarginsEnabled={false}
        />
        <Legend
          verticalAlignment="bottom"
          horizontalAlignment="center"
          itemTextPosition="right"
        />
      </Chart>
    </div>
  );
};
