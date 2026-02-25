import { useState, useEffect } from 'react';
import api from '../services/api';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const res = await api.get('/categories');
        setCategories(res.data);
    };

    const handleAdd = async () => {
        if (!newCategory) return;
        try {
            await api.post('/categories', { name: newCategory });
            setNewCategory('');
            fetchCategories();
        } catch (error) {
            alert('Error adding category');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Category Management</h2>
            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="border p-2 rounded flex-1"
                        placeholder="New Category Name"
                    />
                    <button onClick={handleAdd} className="bg-green-600 text-white px-4 py-2 rounded">Add</button>
                </div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
                <ul>
                    {categories.map(cat => (
                        <li key={cat._id} className="border-b py-2 last:border-0">{cat.name}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default CategoryManagement;
