import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function VendorsIndex({ vendors, users }) {
    const { data, setData, post, delete: destroy, reset } = useForm({ store_name: '', user_id: '' });

    const submit = (e) => {
        e.preventDefault();
        post('/vendors', { onSuccess: () => reset() });
    };

    const approveVendor = (id) => {
        if (confirm('Approve this vendor?')) router.post(`/vendors/${id}/approve`);
    };

    const deleteVendor = (id) => {
        if (confirm('Delete this vendor application?')) destroy(`/vendors/${id}`);
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Manage Vendors</h2>}>
            <Head title="Vendors" />
            <div className="py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <h3 className="text-lg font-bold mb-4">Register New Vendor</h3>
                    <form onSubmit={submit} className="flex gap-4">
                        <select className="p-2 border rounded flex-1" value={data.user_id} onChange={e => setData('user_id', e.target.value)} required>
                            <option value="">Select User</option>
                            {users.map(user => <option key={user.id} value={user.id}>{user.name} ({user.email})</option>)}
                        </select>
                        <input type="text" placeholder="Store Name" className="p-2 border rounded flex-1" value={data.store_name} onChange={e => setData('store_name', e.target.value)} required />
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Register</button>
                    </form>
                </div>

                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="p-4">Store Name</th>
                                <th className="p-4">Owner</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vendors.map(vendor => (
                                <tr key={vendor.id} className="border-b">
                                    <td className="p-4 font-semibold">{vendor.store_name}</td>
                                    <td className="p-4">{vendor.user?.name || 'Unknown'}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-white ${vendor.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                                            {vendor.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4 flex gap-4">
                                        {vendor.status === 'pending' && <button onClick={() => approveVendor(vendor.id)} className="text-green-600 font-bold">Approve</button>}
                                        <button onClick={() => deleteVendor(vendor.id)} className="text-red-500">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
