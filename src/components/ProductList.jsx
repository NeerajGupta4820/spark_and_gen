import React from 'react';

const ProductList = ({ products, theme, onProductClick, onDeleteProduct, onUpdateProduct }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">No products found</p>
        <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => {
        // Use same image logic as ProductDetailsModal
        const images = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
        return (
          <div
            key={product.id || product.localId}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer relative ${
              theme === 'dark' ? 'border border-gray-700' : ''
            }`}
            onClick={(e) => {
              // Prevent modal open if clicking delete/update
              if (e.target.closest('.product-action-btn')) return;
              onProductClick && onProductClick(product);
            }}
          >
            {/* Category Badge - Top Right Corner */}
            <div className="absolute top-2 right-2 z-10">
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full font-medium">
                {product.category}
              </span>
            </div>

            {/* Out of Stock Badge - Top Left Corner */}
            {product.stock === 0 && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold z-10">
                Out of Stock
              </div>
            )}

            {/* Product Image */}
            <div className="relative h-48 overflow-hidden rounded-t-xl flex flex-col items-center justify-center">
              <img
                src={images[0] || 'https://via.placeholder.com/300x300?text=No+Image'}
                alt={product.title || product.name}
                className="w-full h-full object-contain p-4 transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                }}
              />
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 mb-2 line-clamp-2">
                {product.title}
              </h3>
              
              <p className="text-green-600 dark:text-green-400 text-xl font-bold mb-2">
                ₹{product.price}
              </p>

              {/* Brand and Rating */}
              <div className="flex items-center justify-between mb-3">
                {product.brand && (
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                    {product.brand}
                  </span>
                )}
                
                {product.rating > 0 && (
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-current' : 'stroke-current'}`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-1 text-xs text-gray-600 dark:text-gray-300">
                      ({product.rating})
                    </span>
                  </div>
                )}
              </div>

              {/* Stock Info */}
              <p className={`text-sm ${product.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </p>

              {/* Action Buttons for all products */}
              <div className="flex gap-2 mt-3">
                <button
                  className="product-action-btn px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProduct && onDeleteProduct(product);
                  }}
                >Delete</button>
                <button
                  className="product-action-btn px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateProduct && onUpdateProduct(product);
                  }}
                >Update</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductList;