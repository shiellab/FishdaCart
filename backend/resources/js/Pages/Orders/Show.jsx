import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function Show({ auth, order }) {
    const handleStatusChange = (status) => {
        router.patch(route('orders.update', order.id), { status }, { preserveScroll: true });
    };

    const items = order?.items || [];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Order Details</h2>}
        >
            <Head title={`Order #${order.id}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-start gap-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Order #{order.id}</h3>
                                <p className="text-sm text-gray-500 mt-1">Placed: {new Date(order.created_at).toLocaleString()}</p>
                                <p className="text-sm text-gray-500">Customer UID: {order.firebase_uid || 'Guest'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Total</p>
                                <p className="text-xl font-extrabold text-gray-900 dark:text-gray-100">${Number(order.total).toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="mt-5">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Order Status</label>
                            <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md shadow-sm"
                            >
                                {STATUS_OPTIONS.map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-900/30">
                                <p className="text-xs uppercase tracking-wide text-gray-500">Shipping Address</p>
                                <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">{order.address || 'N/A'}</p>
                            </div>
                            <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-900/30">
                                <p className="text-xs uppercase tracking-wide text-gray-500">Phone</p>
                                <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">{order.phone || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4">Ordered Items</h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fish</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.fish?.name || `Fish #${item.fish_id}`}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{item.quantity}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${Number(item.price).toFixed(2)}</td>
                                            <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">${(Number(item.price) * Number(item.quantity)).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {items.length === 0 && (
                                <p className="text-sm text-gray-500 py-4">No items found for this order.</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <Link href={route('orders.index')} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                            Back to Orders
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}