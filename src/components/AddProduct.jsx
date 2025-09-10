import React, { useState, useRef } from 'react';
import { FaStar, FaRegStar, FaImage, FaTag, FaBoxOpen, FaRupeeSign, FaList, FaIndustry, FaInfoCircle, FaUpload, FaTrash, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

// Cloudinary configuration
const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME || 'your_cloud_name';
const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET || 'your_upload_preset';

// Helper to save product to localStorage
const saveProduct = (product) => {
  const products = JSON.parse(localStorage.getItem('localProducts') || '[]');
  products.push({ ...product, localId: Date.now() });
  localStorage.setItem('localProducts', JSON.stringify(products));
};

// AddProduct page component with Cloudinary upload
const AddProduct = () => {
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: '',
    brand: '',
    description: '',
    stock: '',
    rating: 0,
  });
  
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
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
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${progress}%`);
          }
        }
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
      showSnackbar('Images uploaded successfully!');
      
    } catch (error) {
      console.error('Upload error:', error);
      showSnackbar(error.message || 'Failed to upload images');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  // Remove uploaded image
  const removeUploadedImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle rating change
  const handleRatingChange = (value) => {
    setForm((prev) => ({ ...prev, rating: value }));
  };

  // Form validation
  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) newErrors.price = 'Valid price required';
    if (!form.category.trim()) newErrors.category = 'Category is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.stock || isNaN(form.stock) || Number(form.stock) < 0) newErrors.stock = 'Valid stock required';
    if (form.rating < 0 || form.rating > 5) newErrors.rating = 'Rating must be 0-5';
    if (uploadedImages.length === 0) newErrors.images = 'At least one image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Snackbar helper
  const showSnackbar = (message) => {
    setSnackbar({ open: true, message });
    setTimeout(() => setSnackbar({ open: false, message: '' }), 3000);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      saveProduct({
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        images: uploadedImages.map(img => img.url),
        uploadedFrom: 'cloudinary'
      });
      
      // Reset form
      setForm({
        name: '', price: '', category: '', brand: '', description: '', stock: '', rating: 0
      });
      setUploadedImages([]);
      setErrors({});
      showSnackbar('Product added successfully with Cloudinary images!');
      
    } catch (error) {
      console.error('Submission error:', error);
      showSnackbar('Error adding product. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 flex items-center gap-2">
        <FaBoxOpen className="text-blue-500" /> Add Product with Cloudinary Upload
      </h1>
      
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 space-y-6">
        {/* Basic Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200 mb-2">
              <FaTag className="text-blue-500" /> Product Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              placeholder="Enter product name"
            />
            {errors.name && <span className="text-red-500 text-sm mt-1">{errors.name}</span>}
          </div>

          {/* Price */}
          <div>
            <label className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200 mb-2">
              <FaRupeeSign className="text-green-500" /> Price
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
            {errors.price && <span className="text-red-500 text-sm mt-1">{errors.price}</span>}
          </div>

          {/* Category */}
          <div>
            <label className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200 mb-2">
              <FaList className="text-purple-500" /> Category
            </label>
            <input
              type="text"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              placeholder="e.g., Electronics, Clothing"
            />
            {errors.category && <span className="text-red-500 text-sm mt-1">{errors.category}</span>}
          </div>

          {/* Brand */}
          <div>
            <label className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200 mb-2">
              <FaIndustry className="text-orange-500" /> Brand
            </label>
            <input
              type="text"
              name="brand"
              value={form.brand}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              placeholder="Brand name"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200 mb-2">
              <FaBoxOpen className="text-teal-500" /> Stock Quantity
            </label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              min="0"
              placeholder="0"
            />
            {errors.stock && <span className="text-red-500 text-sm mt-1">{errors.stock}</span>}
          </div>

          {/* Rating */}
          <div>
            <label className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200 mb-2">
              <FaStar className="text-yellow-500" /> Rating
            </label>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => handleRatingChange(i + 1)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  {i < form.rating ? 
                    <FaStar className="text-yellow-400 text-xl" /> : 
                    <FaRegStar className="text-gray-400 text-xl" />
                  }
                </button>
              ))}
            </div>
            {errors.rating && <span className="text-red-500 text-sm mt-1">{errors.rating}</span>}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200 mb-2">
            <FaInfoCircle className="text-indigo-500" /> Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            rows={4}
            placeholder="Describe the product features and details..."
          />
          {errors.description && <span className="text-red-500 text-sm mt-1">{errors.description}</span>}
        </div>

        {/* Image Upload Section */}
        <div>
          <label className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200 mb-3">
            <FaImage className="text-pink-500" /> Product Images (Cloudinary Upload)
          </label>

          {/* File Upload Input */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center mb-4 transition-colors hover:border-blue-400">
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
                <FaSpinner className="w-12 h-12 text-blue-500 animate-spin mb-3" />
                <p className="text-gray-600 dark:text-gray-300">Uploading to Cloudinary...</p>
              </div>
            ) : (
              <>
                <FaUpload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Drag & drop images here or click to browse
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Select Images
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Supports JPG, PNG, WEBP - Max 5MB per image
                </p>
              </>
            )}
          </div>

          {/* Image Previews */}
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative group bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
                  <img
                    src={image.url}
                    alt={`Uploaded ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeUploadedImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {image.name.length > 15 ? image.name.substring(0, 12) + '...' : image.name}
                  </div>
                </div>
              ))}
            </div>
          )}

          {errors.images && (
            <span className="text-red-500 text-sm">{errors.images}</span>
          )}

          <p className="text-sm text-gray-600 dark:text-gray-400">
            {uploadedImages.length} image(s) uploaded to Cloudinary
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <FaSpinner className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FaBoxOpen />
              Add Product with Cloudinary
            </>
          )}
        </button>
      </form>

      {/* Snackbar Notification */}
      {snackbar.open && (
        <div className="fixed left-1/2 bottom-8 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fadeIn">
          {snackbar.message}
        </div>
      )}
    </div>
  );
};

export default AddProduct;