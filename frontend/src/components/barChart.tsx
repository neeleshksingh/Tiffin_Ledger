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
    <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {/* Ensure unique keys for the Bar component */}
            <Bar dataKey="Tiffin" fill="#4F46E5" key="tiffin-bar" />
        </BarChart>
    </ResponsiveContainer>
);

export default BarChartComponent;
