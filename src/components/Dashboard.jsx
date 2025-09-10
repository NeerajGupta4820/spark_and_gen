import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import ProductDetailsModal from './ProductDetailsModal';
import UpdateProductModal from './UpdateProductModal';

import { UserContext } from '../context/UserContext';
import ProductList from './ProductList';
import Pagination from './Pagination';

// Helper to get local products from localStorage
const getLocalProducts = () => {
  const data = localStorage.getItem('localProducts');
  return data ? JSON.parse(data) : [];
};


// Singleton cache for products (in-memory, per session)
let productCache = null;
// let apiProductIds = null; // No longer used

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [modalProduct, setModalProduct] = useState(null);
  const [deletedApiIds, setDeletedApiIds] = useState([]);
  const [updateProduct, setUpdateProduct] = useState(null);
  // const navigate = useNavigate(); // No longer used

  // Fetch products from API only once per session, cache in memory
  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!productCache) {
          const res = await fetch(`${import.meta.env.VITE_PRODUCT_API}`);
          if (!res.ok) throw new Error('Failed to fetch products');
          const data = await res.json();
          if (data.success && data.products) {
            const apiProducts = data.products.map(product => ({
              id: product._id,
              title: product.title,
              description: product.description,
              price: product.price,
              category: product.category?.name || 'Uncategorized',
              image: product.images?.[0]?.imageLinks?.[0] || '/placeholder-image.jpg',
              images: product.images?.flatMap(img => img.imageLinks) || [],
              rating: product.ratings,
              brand: product.brand,
              stock: product.stock,
              isApi: true
            }));
            // apiProductIds = apiProducts.map(p => p.id); // removed
            productCache = [...apiProducts, ...getLocalProducts()];
          } else {
            throw new Error('Invalid API response format');
          }
        }
        // Always merge with latest local products
        const localProducts = getLocalProducts();
        let allProducts = productCache.filter(p => p.isApi || !p.isApi);
        // Remove deleted API products from UI
        if (deletedApiIds.length > 0) {
          allProducts = allProducts.filter(p => !(p.isApi && deletedApiIds.includes(p.id)));
        }
        setProducts([...allProducts.filter(p => p.isApi), ...localProducts]);
      } catch (err) {
        setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => { isMounted = false; };
  //
  }, [deletedApiIds]);

  // Retry fetch on error (clear cache)
  const handleRetry = () => {
    productCache = null;
  // apiProductIds = null;
    setLoading(true);
    setError(null);
    setDeletedApiIds([]);
  };

  // Get unique categories and brands for filter dropdowns
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));

  // Filter products by search, category, brand
  let filteredProducts = products.filter((p) => {
    const name = p.name || p.title || '';
    const category = p.category || '';
    const brand = p.brand || '';
    let match = (
      name.toLowerCase().includes(search.toLowerCase()) ||
      category.toLowerCase().includes(search.toLowerCase()) ||
      brand.toLowerCase().includes(search.toLowerCase())
    );
    if (filterCategory && category !== filterCategory) match = false;
    if (filterBrand && brand !== filterBrand) match = false;
    return match;
  });

  // Sort products
  if (sortBy === 'priceLowHigh') {
    filteredProducts = [...filteredProducts].sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sortBy === 'priceHighLow') {
    filteredProducts = [...filteredProducts].sort((a, b) => Number(b.price) - Number(a.price));
  } else if (sortBy === 'ratingHighLow') {
    filteredProducts = [...filteredProducts].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sortBy === 'stockHighLow') {
    filteredProducts = [...filteredProducts].sort((a, b) => (b.stock || 0) - (a.stock || 0));
  }

  // Pagination logic
  const PRODUCTS_PER_PAGE = 12;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-0 px-0">
      {/* Dashboard Header */}
      <div className="bg-white dark:bg-gray-900 shadow-lg rounded-b-2xl px-8 pt-8 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-4xl font-extrabold text-blue-700 dark:text-blue-400 mb-2 tracking-tight">Product Dashboard</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Manage your products, inventory, and details in one place.</p>
        </div>
<Link
  to="/add"
  className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
    location.pathname === '/add' 
      ? 'bg-white text-purple-600 shadow-md' 
      : 'bg-purple-500 hover:bg-purple-700'
  }`}
>
  ✚ Add Product
</Link>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow flex items-center gap-4 border border-gray-200 dark:border-gray-800">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-16" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{products.length}</h3>
            <p className="text-gray-600 dark:text-gray-300">Total Products</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow flex items-center gap-4 border border-gray-200 dark:border-gray-800">
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{products.filter(p => p.stock > 0).length}</h3>
            <p className="text-gray-600 dark:text-gray-300">In Stock</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow flex items-center gap-4 border border-gray-200 dark:border-gray-800">
          <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{new Set(products.map(p => p.brand)).size}</h3>
            <p className="text-gray-600 dark:text-gray-300">Brands</p>
          </div>
        </div>
      </div>

      {/* Search, Filter, Sort Bar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center gap-4 mb-8 px-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search products by name, category, or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={filterBrand}
          onChange={e => setFilterBrand(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="">All Brands</option>
          {brands.map(brand => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="">Sort By</option>
          <option value="priceLowHigh">Price: Low to High</option>
          <option value="priceHighLow">Price: High to Low</option>
          <option value="ratingHighLow">Rating: High to Low</option>
          <option value="stockHighLow">Stock: High to Low</option>
        </select>
        <button
          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
          onClick={() => {
            setSearch('');
            setFilterCategory('');
            setFilterBrand('');
            setSortBy('');
          }}
        >
          Reset
        </button>
      </div>

      {/* Loading and Error States */}
      <div className="max-w-7xl mx-auto px-2">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-14 w-14 border-b-4 border-blue-600"></div>
            <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 font-semibold">Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-6 py-5 rounded-xl max-w-md mx-auto shadow">
              <svg className="w-7 h-7 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Error: {error}
              <button
                className="ml-4 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                onClick={handleRetry}
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
                Showing <span className="font-bold text-blue-600 dark:text-blue-400">{filteredProducts.length}</span> of <span className="font-bold text-blue-600 dark:text-blue-400">{products.length}</span> products
                {search && <span> for <span className="font-semibold">"{search}"</span></span>}
              </p>
            </div>

            {/* Product List with click to view details and delete */}
            <ProductList
              products={paginatedProducts}
              theme={user.theme}
              onProductClick={setModalProduct}
              onDeleteProduct={(product) => {
                if (product.isApi) {
                  setDeletedApiIds(ids => [...ids, product.id]);
                } else {
                  // Remove from localStorage
                  const localProducts = getLocalProducts().filter(p => p.localId !== product.localId);
                  localStorage.setItem('localProducts', JSON.stringify(localProducts));
                  // Remove from cache
                  if (productCache) productCache = productCache.filter(p => p.localId !== product.localId);
                  setProducts(ps => ps.filter(p => p.localId !== product.localId));
                }
              }}
              onUpdateProduct={(product) => {
                setUpdateProduct(product);
              }}
            />
            {/* Product Details Modal */}
            {modalProduct && (
              <ProductDetailsModal
                product={modalProduct}
                onClose={() => setModalProduct(null)}
              />
            )}
            {/* Update Modal */}
            {updateProduct && (
              <UpdateProductModal
                product={updateProduct}
                onClose={() => setUpdateProduct(null)}
                theme={user.theme}
                onUpdate={(updated) => {
                  if (updated.isApi) {
                    // Update API product only in UI (temporary)
                    setProducts(ps => ps.map(p => p.id === updated.id ? { ...p, ...updated } : p));
                    if (productCache) productCache = productCache.map(p => p.id === updated.id ? { ...p, ...updated } : p);
                  } else {
                    // Update local product permanently
                    const localProducts = getLocalProducts().map(p => p.localId === updated.localId ? { ...p, ...updated } : p);
                    localStorage.setItem('localProducts', JSON.stringify(localProducts));
                    if (productCache) productCache = productCache.map(p => p.localId === updated.localId ? { ...p, ...updated } : p);
                    setProducts(ps => ps.map(p => p.localId === updated.localId ? { ...p, ...updated } : p));
                  }
                }}
              />
            )}
            {/* Add Product Modal */}
            {showAddProduct && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-2xl p-8 relative animate-fadeIn">
                  <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-2xl font-bold"
                    onClick={() => setShowAddProduct(false)}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                  {/* Lazy load AddProduct to avoid import issues */}
                  {React.createElement(require('./AddProduct').default, {
                    onClose: () => setShowAddProduct(false),
                    onProductAdded: (newProduct) => {
                      // Add to localStorage and cache
                      const localProducts = [...getLocalProducts(), newProduct];
                      localStorage.setItem('localProducts', JSON.stringify(localProducts));
                      if (productCache) productCache = [...productCache, newProduct];
                      setProducts(ps => [...ps, newProduct]);
                      setShowAddProduct(false);
                    }
                  })}
                </div>
              </div>
            )}
            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;