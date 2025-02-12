'use client'

import React, { useState } from 'react';
import { PieChart, Pie, Sector, ResponsiveContainer, Cell } from 'recharts';

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={payload.color}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={payload.color}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={payload.color}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={payload.color} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={payload.color} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill={payload.color}>{`${value} dispositivos`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill={payload.color}>
        {`(percentual ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

interface ChartProps {
  numberOfDevicesRecovered: number
  numberOfDevicesRobbed: number
  numberOfDevicesLost: number
  numberOfDevicesRegistered: number
  numbeOfDevicesTheft: number
}

const PieChartRechart = ({ numberOfDevicesRecovered, numberOfDevicesRobbed, numbeOfDevicesTheft, numberOfDevicesLost, numberOfDevicesRegistered }: ChartProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const newData = [
    { name: 'Recuperado', value: numberOfDevicesRecovered, color: "#409A00" },
    { name: 'Furtado', value: numbeOfDevicesTheft, color: "rgb(249 115 22)" },
    { name: 'Roubado', value: numberOfDevicesRobbed, color: "#D04228" },
    { name: 'Perdido', value: numberOfDevicesLost, color: 'rgb(234 179 8)' },
    { name: 'Cadastrado', value: numberOfDevicesRegistered, color: '#002E72' },
  ]

  return (
    <>
      {
        numberOfDevicesLost === 0 && numberOfDevicesRecovered === 0 && numberOfDevicesRobbed === 0 && numberOfDevicesRegistered === 0 ? (
          <div className='h-full w-full flex items-center justify-center'>
            <span>Nenhum dispositivo cadastrado</span>
          </div>
        ) : (

          <ResponsiveContainer width="100%" height="80%">
            <PieChart width={400} height={200}>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={newData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill={"#8884d8"}
                dataKey="value"
                onMouseEnter={onPieEnter}
              >
                {newData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )
      }
    </>
  );
};

export default PieChartRechart;
