import React from 'react';
import PieChart, { Series, Legend, Label } from 'devextreme-react/pie-chart';

const chartData = [
  { category: 'A', value: 20 },
  { category: 'B', value: 25 },
  { category: 'C', value: 20 },
  { category: 'D', value: 18 },
  { category: 'E', value: 17 }
];

const chartColors = ['#5236ab', '#e31937', '#ff978a', '#fde5a7', '#200a58'];

export const PieChartComponent = () => {
  return (
    <div className="chart-card">
      <h3 className="chart-title">Pie chart</h3>
      <PieChart
        dataSource={chartData}
        palette={chartColors}
        className="chart-standard"
      >
        <Series
          argumentField="category"
          valueField="value"
        >
          <Label visible={true} position="inside" customizeText={(arg: any) => arg.argument} />
        </Series>
        <Legend
          verticalAlignment="bottom"
          horizontalAlignment="center"
          itemTextPosition="right"
        />
      </PieChart>
    </div>
  );
};
