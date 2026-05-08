import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function UsersIndex({ users }) {
    const deleteUser = (id) => {
        if (confirm('Are you sure you want to delete this user?')) router.delete(`/users/${id}`);
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Registered Customers</h2>}>
            <Head title="Customers" />
            <div className="py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="p-4">Name</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-semibold">{user.name}</td>
                                    <td className="p-4">{user.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-sm font-medium ${user.role === 'Admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {user.role !== 'Admin' && (
                                            <button onClick={() => deleteUser(user.id)} className="text-red-500 hover:text-red-700 font-medium transition">Remove Account</button>
                                        )}
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
