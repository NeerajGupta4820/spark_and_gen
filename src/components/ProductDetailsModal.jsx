import React, { useState } from 'react';

// ProductDetailsModal: shows product details in a modal popup
const ProductDetailsModal = ({ product, onClose }) => {
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const [showFullDesc, setShowFullDesc] = useState(false);
  if (!product) return null;
  const images = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
  const descWords = (product.description || '').split(' ');
  const truncatedDesc = descWords.length > 50 ? descWords.slice(0, 50).join(' ') + '...' : product.description;
  const rating = Math.round(product.rating || 0);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-xl p-8 relative animate-fadeIn" style={{ minHeight: '520px', maxHeight: '90vh', overflow: 'hidden' }}>
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="flex flex-col md:flex-row gap-8 h-full">
          {/* Image Gallery */}
          <div className="flex flex-col items-center md:w-1/2 relative">
            <img
              src={images[mainImageIdx] || 'https://via.placeholder.com/300x300?text=No+Image'}
              alt={product.name || product.title}
              className="w-56 h-56 object-cover rounded mb-3 border transition-all duration-200"
            />
            <div className="flex gap-2 flex-wrap justify-center mb-2">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumb ${idx+1}`}
                  className={`w-12 h-12 object-cover rounded border cursor-pointer ${mainImageIdx === idx ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setMainImageIdx(idx)}
                  onError={e => {e.target.src='https://via.placeholder.com/50x50?text=No+Image'}}
                />
              ))}
            </div>
            {/* Stock below image, larger */}
            <div className="mt-2">
              <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400 px-4 py-2 rounded-full font-bold text-lg shadow">
                Stock: {product.stock}
              </span>
            </div>
            {/* Price below image, larger and green */}
            <div className="mt-2">
              <span className="text-green-700 dark:text-green-400 font-bold text-2xl">₹{product.price}</span>
            </div>
          </div>
          {/* Details */}
          <div className="flex-1 flex flex-col justify-center h-full">
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">{product.name || product.title}</h2>
            <div className="mb-2 flex flex-wrap gap-4 items-center">
              <span className="font-semibold text-gray-700 dark:text-gray-200">Category:</span>
              <span className="text-purple-700 dark:text-purple-400 font-bold">{product.category}</span>
            </div>
            <div className="mb-2 flex flex-wrap gap-4 items-center">
              <span className="font-semibold text-gray-700 dark:text-gray-200">Brand:</span>
              <span className="text-pink-700 dark:text-pink-400 font-bold">{product.brand}</span>
            </div>
            <div className="mb-2 flex items-center gap-2">
              <span className="font-semibold text-gray-700 dark:text-gray-200">Rating:</span>
              <span className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-6 h-6 mx-0.5 ${i < rating ? 'fill-yellow-400' : 'fill-none'} ${i < rating ? 'stroke-yellow-500' : 'stroke-yellow-400'}`}
                    viewBox="0 0 20 20"
                    fill={i < rating ? '#FFD700' : 'none'}
                    stroke="#FFD700"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </span>
            </div>
            <div className="mb-2">
              <div className="font-semibold text-gray-700 dark:text-gray-200 mb-1">Description:</div>
              <div
                className={`text-gray-600 dark:text-gray-300 mb-2 ${showFullDesc ? 'max-h-60 overflow-y-auto pr-2 custom-scrollbar' : ''}`}
                style={showFullDesc ? { scrollbarWidth: 'thin', scrollbarColor: '#888 #eee' } : {}}
              >
                {showFullDesc ? product.description : truncatedDesc}
                {descWords.length > 50 && (
                  <button
                    className="ml-2 text-blue-600 dark:text-blue-400 underline text-sm"
                    onClick={() => setShowFullDesc(v => !v)}
                  >
                    {showFullDesc ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
