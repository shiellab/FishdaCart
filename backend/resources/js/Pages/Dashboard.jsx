import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function Dashboard({ stats, revenueData, fishData }) {
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Admin Dashboard</h2>}>
            <Head title="Dashboard" />
            <div className="py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow"><h3 className="text-gray-500 text-sm font-medium uppercase">Total Users</h3><p className="text-2xl font-bold">{stats.users}</p></div>
                    <div className="bg-white p-6 rounded-lg shadow"><h3 className="text-gray-500 text-sm font-medium uppercase">Categories</h3><p className="text-2xl font-bold">{stats.categories}</p></div>
                    <div className="bg-white p-6 rounded-lg shadow"><h3 className="text-gray-500 text-sm font-medium uppercase">Fish Listings</h3><p className="text-2xl font-bold">{stats.fish}</p></div>
                    <div className="bg-white p-6 rounded-lg shadow"><h3 className="text-gray-500 text-sm font-medium uppercase">Total Orders</h3><p className="text-2xl font-bold">{stats.orders}</p></div>
                    <div className="bg-white p-6 rounded-lg shadow"><h3 className="text-gray-500 text-sm font-medium uppercase">Total Revenue</h3><p className="text-2xl font-bold text-green-600">${stats.revenue}</p></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-bold mb-4">Daily Revenue</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-bold mb-4">Most Sold Fish Products</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={fishData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="sold" fill="#10b981" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

