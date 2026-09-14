import React from 'react';
import Chart, { Series, ArgumentAxis, ValueAxis, Legend, CommonSeriesSettings } from 'devextreme-react/chart';

const chartData = [
  { month: 'Apr', series1: 20, series2: 30, series3: 40, series4: 35 },
  { month: 'May', series1: 40, series2: 50, series3: 55, series4: 48 },
  { month: 'Jun', series1: 65, series2: 70, series3: 68, series4: 62 },
  { month: 'Jul', series1: 85, series2: 80, series3: 75, series4: 72 },
  { month: 'Aug', series1: 70, series2: 65, series3: 58, series4: 60 },
  { month: 'Sep', series1: 50, series2: 45, series3: 40, series4: 48 },
  { month: 'Oct', series1: 30, series2: 25, series3: 28, series4: 32 }
];

export const DensityCurveChart = () => {
  return (
    <div className="chart-card">
      <h3 className="chart-title">Density curve - multiple, smooth</h3>
      <Chart
        dataSource={chartData}
        className="chart-standard"
      >
        <CommonSeriesSettings
          argumentField="month"
          type="splinearea"
        />
        <Series
          valueField="series1"
          name="Label"
          color="#5236ab"
          opacity={0.8}
        />
        <Series
          valueField="series2"
          name="Label"
          color="#e31937"
          opacity={0.8}
        />
        <Series
          valueField="series3"
          name="Label"
          color="#ff978a"
          opacity={0.8}
        />
        <Series
          valueField="series4"
          name="Label"
          color="#fde5a7"
          opacity={0.8}
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
