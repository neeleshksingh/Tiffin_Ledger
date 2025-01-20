import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Veggie', value: 70 },
    { name: 'Non-Veg', value: 30 },
];

const PieChartComponent = () => (
    <ResponsiveContainer width="100%" height={300}>
        <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#4F46E5" label>
                <Cell key="Veggie" fill="#4F46E5" />
                <Cell key="Non-Veg" fill="#F59E0B" />
            </Pie>
            <Tooltip />
        </PieChart>
    </ResponsiveContainer>
);

export default PieChartComponent;