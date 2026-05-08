import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function Edit({ auth, fish, categories }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        name: fish.name,
        category_id: fish.category_id,
        price: fish.price,
        stock: fish.stock,
        size: fish.size,
        temperament: fish.temperament,
        description: fish.description,
        image: null,
    });

    const currentImage = fish.image
        ? (fish.image.startsWith('http') ? fish.image : `/storage/${fish.image}`)
        : null;

    const submit = (e) => {
        e.preventDefault();
        post(route('fish.update', fish.id), { forceFormData: true });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Edit Fish Listing</h2>}
        >
            <Head title="Edit Fish" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="name" value="Fish Name" />
                                <TextInput id="name" type="text" value={data.name} className="mt-1 block w-full" onChange={(e) => setData('name', e.target.value)} />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="category_id" value="Category" />
                                <select 
                                    id="category_id" 
                                    value={data.category_id} 
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                    onChange={(e) => setData('category_id', e.target.value)}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                                <InputError message={errors.category_id} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="price" value="Price ($)" />
                                <TextInput id="price" type="number" step="0.01" value={data.price} className="mt-1 block w-full" onChange={(e) => setData('price', e.target.value)} />
                                <InputError message={errors.price} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="stock" value="Stock" />
                                <TextInput id="stock" type="number" value={data.stock} className="mt-1 block w-full" onChange={(e) => setData('stock', e.target.value)} />
                                <InputError message={errors.stock} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="size" value="Size" />
                                <TextInput id="size" type="text" value={data.size} className="mt-1 block w-full" onChange={(e) => setData('size', e.target.value)} />
                                <InputError message={errors.size} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="temperament" value="Temperament" />
                                <TextInput id="temperament" type="text" value={data.temperament} className="mt-1 block w-full" onChange={(e) => setData('temperament', e.target.value)} />
                                <InputError message={errors.temperament} className="mt-2" />
                            </div>

                            <div className="md:col-span-2">
                                <InputLabel htmlFor="description" value="Description" />
                                <textarea 
                                    id="description" 
                                    value={data.description} 
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                    rows="4"
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            <div className="md:col-span-2">
                                <InputLabel htmlFor="image" value="Fish Image" />
                                {currentImage && (
                                    <img
                                        src={currentImage}
                                        alt={fish.name}
                                        className="mb-3 h-32 w-32 rounded-md object-cover border border-gray-300"
                                    />
                                )}
                                <TextInput
                                    id="image"
                                    type="file"
                                    className="mt-1 block w-full"
                                    accept="image/*"
                                    onChange={(e) => setData('image', e.target.files[0])}
                                />
                                <InputError message={errors.image} className="mt-2" />
                            </div>

                            <div className="md:col-span-2 flex items-center">
                                <PrimaryButton disabled={processing}>
                                    Update Listing
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
