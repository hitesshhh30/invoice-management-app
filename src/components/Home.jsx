import React, { useState } from 'react';
import { Upload, Plus, DollarSign, Package, Image } from 'lucide-react';
import { nanoid } from 'nanoid';

const Home = () => {
    const [formData, setFormData] = useState({
        designName: '',
        designCode: '',
        category: '',
        price: '',
        image: null
    });

    const [previewImage, setPreviewImage] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file
            }));
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const designData = {
            ...formData,
            uniqueCode: nanoid(8)
        };

        try {
            // Add design to database
            await window.electronAPI.addDesign(designData);
            
            // Reset form
            setFormData({
                designName: '',
                designCode: '',
                category: '',
                price: '',
                image: null
            });
            setPreviewImage(null);
            
            alert('Design added successfully!');
        } catch (error) {
            console.error('Error adding design:', error);
            alert('Error adding design. Please try again.');
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Add New Design</h1>
                <p className="text-gray-600">Create and manage your design catalog</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <Package className="text-blue-500 mr-3" size={24} />
                        <div>
                            <p className="text-sm text-gray-600">Total Designs</p>
                            <p className="text-2xl font-bold">150</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <DollarSign className="text-green-500 mr-3" size={24} />
                        <div>
                            <p className="text-sm text-gray-600">This Month Revenue</p>
                            <p className="text-2xl font-bold">₹25,000</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <Users className="text-purple-500 mr-3" size={24} />
                        <div>
                            <p className="text-sm text-gray-600">Active Customers</p>
                            <p className="text-2xl font-bold">45</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Design Form */}
            <div className="bg-white rounded-lg shadow">
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Design Name *
                                </label>
                                <input
                                    type="text"
                                    name="designName"
                                    value={formData.designName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter design name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Design Code *
                                </label>
                                <input
                                    type="text"
                                    name="designCode"
                                    value={formData.designCode}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter design code"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category *
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select category</option>
                                    <option value="ethnic">Ethnic Wear</option>
                                    <option value="casual">Casual Wear</option>
                                    <option value="formal">Formal Wear</option>
                                    <option value="party">Party Wear</option>
                                    <option value="wedding">Wedding Collection</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price (₹) *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter price"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Design Image
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    {previewImage ? (
                                        <div className="space-y-4">
                                            <img
                                                src={previewImage}
                                                alt="Design preview"
                                                className="max-w-full h-48 object-cover mx-auto rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPreviewImage(null);
                                                    setFormData(prev => ({ ...prev, image: null }));
                                                }}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Remove Image
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <Image size={48} className="mx-auto text-gray-400" />
                                            <div>
                                                <label className="cursor-pointer">
                                                    <span className="text-blue-500 hover:text-blue-700 font-medium">
                                                        Click to upload
                                                    </span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        className="hidden"
                                                    />
                                                </label>
                                                <p className="text-gray-500 text-sm">PNG, JPG, GIF up to 10MB</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                        >
                            <Plus size={20} className="mr-2" />
                            Add Design
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};