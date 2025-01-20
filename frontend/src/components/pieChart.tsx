import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Veggie', value: 70 },
    { name: 'Non-Veg', value: 30 },
];

const COLORS = ['#34D399', '#FB923C'];

const PieChartComponent = () => (
    <div className="h-72 sm:h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    label={(entry) => `${entry.name} (${entry.value}%)`}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#F3F4F6',
                        borderRadius: '8px',
                        border: 'none',
                        padding: '10px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                    itemStyle={{ color: '#374151', fontSize: '14px' }}
                />
            </PieChart>
        </ResponsiveContainer>
    </div>
);

export default PieChartComponent;