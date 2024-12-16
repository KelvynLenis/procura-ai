import React from 'react';
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartProps {
  data: { item: string; value: number }[];
}

const RechartChart = ({ data }: ChartProps) => {
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  return (
    <ResponsiveContainer width="90%" height="100%">
      <BarChart
        width={500}
        height={300}
        data={sortedData}
        margin={{
          top: 5,
          right: 0,
          left: 0,
          bottom: 0,
        }}
        className='text-xs'
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="item" />
        <YAxis />
        <Tooltip />
        {/* <Legend /> */}
        <Bar
          dataKey="value"
          fill="#0F2498"
          activeBar={<Rectangle fill="gold" stroke="purple" />}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RechartChart;
