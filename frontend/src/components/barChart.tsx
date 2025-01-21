import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BarChartComponentProps {
    data: { name: string; isTaken: boolean }[];
}

const BarChartComponent = ({ data }: BarChartComponentProps) => {

    const transformedData = data.map((item) => ({
        name: item.name,
        Tiffin: item.isTaken ? 1 : 0,
        fill: item.isTaken ? 'url(#greenGradient)' : 'url(#redGradient)',
    }));

    return (
        <div className="h-72 sm:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transformedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />
                    <XAxis dataKey="name" tick={{ fill: '#6B7280' }} />
                    <YAxis tick={{ fill: '#6B7280' }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#F9FAFB',
                            borderColor: '#D1D5DB',
                        }}
                        cursor={{ fill: '#E5E7EB' }}
                    />
                    <Legend />
                    <Bar
                        dataKey="Tiffin"
                        key="tiffin-bar"
                        radius={[5, 5, 0, 0]}
                        isAnimationActive={false}
                    >
                        {transformedData.map((entry, index) => (
                            <Bar
                                key={`bar-${index}`}
                                dataKey="Tiffin"
                                fill={entry.fill}
                            />
                        ))}
                    </Bar>
                    <defs>
                        <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22C55E" stopOpacity={0.9} />
                            <stop offset="95%" stopColor="#6EE7B7" stopOpacity={0.7} />
                        </linearGradient>
                        <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.9} />
                            <stop offset="95%" stopColor="#FCA5A5" stopOpacity={0.7} />
                        </linearGradient>
                    </defs>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BarChartComponent;
