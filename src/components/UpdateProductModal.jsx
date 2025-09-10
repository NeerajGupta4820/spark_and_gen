import React, { useState, useRef } from 'react';
import { FaStar, FaRegStar, FaImage, FaTag, FaBoxOpen, FaRupeeSign, FaList, FaIndustry, FaInfoCircle, FaUpload, FaTrash, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

// Cloudinary configuration
const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME || 'your_cloud_name';
const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET || 'your_upload_preset';

// UpdateProductModal: allows editing product details with Cloudinary upload
const UpdateProductModal = ({ product, onClose, onUpdate, theme }) => {
  const [form, setForm] = useState({
    name: product.name || product.title || '',
    price: product.price || '',
    category: product.category || '',
    brand: product.brand || '',
    description: product.description || '',
    stock: product.stock || '',
    rating: product.rating || 0,
    images: product.images || [],
  });
  
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState({});

  // Cloudinary upload function
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'ecommerce_products');

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Image upload failed');
    }
  };

  // Handle file upload to Cloudinary
  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (!file.type.startsWith('image/')) {
          throw new Error('Only image files are allowed');
        }
        
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('File size should be less than 5MB');
        }

        const imageUrl = await uploadToCloudinary(file);
        return {
          url: imageUrl,
          name: file.name,
          type: file.type
        };
      });

      const uploadedResults = await Promise.all(uploadPromises);
      setUploadedImages(prev => [...prev, ...uploadedResults]);
      
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  // Remove uploaded image
  const removeUploadedImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Remove existing image
  const removeExistingImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Form validation
  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) newErrors.price = 'Valid price required';
    if (!form.category.trim()) newErrors.category = 'Category is required';
    if (!form.brand.trim()) newErrors.brand = 'Brand is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.stock || isNaN(form.stock) || Number(form.stock) < 0) newErrors.stock = 'Valid stock required';
    if (form.rating < 0 || form.rating > 5) newErrors.rating = 'Rating must be 0-5';
    if (form.images.length === 0 && uploadedImages.length === 0) newErrors.images = 'At least one image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle rating change
  const handleRatingChange = (value) => {
    setForm((prev) => ({ ...prev, rating: value }));
  };

  // Handle update
  const handleUpdate = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    const allImages = [
      ...form.images,
      ...uploadedImages.map(img => img.url)
    ];
    
    onUpdate({ 
      ...product, 
      ...form,
      images: allImages
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto transition-all duration-300 ${theme === 'dark' ? 'border border-gray-700' : ''}`}>
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <FaBoxOpen className="text-blue-500" /> Update Product
        </h2>
        
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200 mb-1">
                <FaTag className="text-blue-500 text-sm" /> Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 h-10"
                required
              />
              {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
            </div>

            {/* Price */}
            <div>
              <label className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200 mb-1">
                <FaRupeeSign className="text-green-500 text-sm" /> Price
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 h-10"
                required
                min="0"
                step="0.01"
              />
              {errors.price && <span className="text-red-500 text-sm">{errors.price}</span>}
            </div>

            {/* Category */}
            <div>
              <label className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200 mb-1">
                <FaList className="text-purple-500 text-sm" /> Category
              </label>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 h-10"
                required
              />
              {errors.category && <span className="text-red-500 text-sm">{errors.category}</span>}
            </div>

            {/* Brand */}
            <div>
              <label className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200 mb-1">
                <FaIndustry className="text-orange-500 text-sm" /> Brand
              </label>
              <input
                type="text"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 h-10"
                required
              />
              {errors.brand && <span className="text-red-500 text-sm">{errors.brand}</span>}
            </div>

            {/* Stock */}
            <div>
              <label className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200 mb-1">
                <FaBoxOpen className="text-teal-500 text-sm" /> Stock
              </label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 h-10"
                required
                min="0"
              />
              {errors.stock && <span className="text-red-500 text-sm">{errors.stock}</span>}
            </div>

            {/* Rating */}
            <div>
              <label className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200 mb-1">
                <FaStar className="text-yellow-500 text-sm" /> Rating
              </label>
              <div className="flex gap-1 items-center h-10">
                {[...Array(5)].map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => handleRatingChange(i + 1)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    {i < form.rating ? 
                      <FaStar className="text-yellow-400" /> : 
                      <FaRegStar className="text-gray-400" />
                    }
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                  ({form.rating})
                </span>
              </div>
              {errors.rating && <span className="text-red-500 text-sm">{errors.rating}</span>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200 mb-1">
              <FaInfoCircle className="text-indigo-500 text-sm" /> Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
              rows={3}
            />
            {errors.description && <span className="text-red-500 text-sm">{errors.description}</span>}
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200 mb-2">
              <FaImage className="text-pink-500 text-sm" /> Product Images
            </label>

            {/* Existing Images */}
            {form.images.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Existing Images:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {form.images.map((image, index) => (
                    <div key={index} className="relative group bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-20 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Upload Input */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center mb-4 transition-colors hover:border-blue-400">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                accept="image/*"
                className="hidden"
              />
              
              {uploading ? (
                <div className="flex flex-col items-center">
                  <FaSpinner className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Uploading to Cloudinary...</p>
                </div>
              ) : (
                <>
                  <FaUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                    Drag & drop images here or click to browse
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    Select Images
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Supports JPG, PNG, WEBP - Max 5MB per image
                  </p>
                </>
              )}
            </div>

            {/* New Image Previews */}
            {uploadedImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">New Images:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
                      <img
                        src={image.url}
                        alt={`Uploaded ${index + 1}`}
                        className="w-full h-20 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeUploadedImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                        {image.name.length > 15 ? image.name.substring(0, 12) + '...' : image.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {errors.images && (
              <span className="text-red-500 text-sm">{errors.images}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <FaSpinner className="animate-spin" />
                Updating...
              </>
            ) : (
              'Update Product'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateProductModal;