import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface SentimentChartProps {
  data: Array<{
    timeRange: string;
    sentiment: number;
  }>;
}

export default function SentimentChart({ data }: SentimentChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        <p>No sentiment timeline data available</p>
      </div>
    );
  }

  // Transform data for the chart
  const chartData = data.map(item => ({
    name: item.timeRange,
    sentiment: item.sentiment,
  }));

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            formatter={(value: number) => [`${value}%`, 'Sentiment']}
            labelStyle={{ color: '#374151' }}
            contentStyle={{ 
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="sentiment" 
            stroke="#059669" 
            strokeWidth={2}
            dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#059669', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
