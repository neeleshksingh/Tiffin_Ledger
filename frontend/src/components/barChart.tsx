import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
    { name: '1st Jan', Tiffin: 1 },
    { name: '2nd Jan', Tiffin: 0 },
    { name: '3rd Jan', Tiffin: 1 },
    { name: '4th Jan', Tiffin: 1 },
    { name: '5th Jan', Tiffin: 0 },
    { name: '6th Jan', Tiffin: 1 },
    { name: '7th Jan', Tiffin: 0 },
    { name: '8th Jan', Tiffin: 1 },
    { name: '9th Jan', Tiffin: 0 },
    { name: '10th Jan', Tiffin: 1 },
    { name: '11th Jan', Tiffin: 1 },
    { name: '12th Jan', Tiffin: 0 },
    { name: '13th Jan', Tiffin: 1 },
    { name: '14th Jan', Tiffin: 0 },
    { name: '15th Jan', Tiffin: 1 },
];

const BarChartComponent = () => (
    <div className="h-72 sm:h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
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
                    fill="url(#colorTiffin)"
                    key="tiffin-bar"
                    radius={[5, 5, 0, 0]}
                />
                <defs>
                    <linearGradient id="colorTiffin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#93C5FD" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#E0F2FE" stopOpacity={0.7} />
                    </linearGradient>
                </defs>
            </BarChart>
        </ResponsiveContainer>
    </div>
);

export default BarChartComponent;