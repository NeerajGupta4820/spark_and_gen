
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';

// Helper to get local products from localStorage
const getLocalProducts = () => {
  const data = localStorage.getItem('localProducts');
  return data ? JSON.parse(data) : [];
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch product by id from API or localStorage
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      // Try local first
      const localProducts = getLocalProducts();
      const local = localProducts.find(p => String(p.localId) === id);
      if (local) {
        setProduct(local);
        // Gather all images from all colors
        let allImages = [];
        if (Array.isArray(local.images)) {
          local.images.forEach(imgObj => {
            if (Array.isArray(imgObj.imageLinks)) {
              allImages = allImages.concat(imgObj.imageLinks);
            } else if (typeof imgObj === 'string') {
              allImages.push(imgObj);
            }
          });
        }
        setMainImage(allImages[0] || local.image || '/placeholder-image.jpg');
        local.allImages = allImages;
        setProduct(local);
        setLoading(false);
        return;
      }
      // Try API
      try {
        const res = await fetch('https://mern-ecommerce-backend-beige.vercel.app/api/product/allproducts');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        if (data.success && data.products) {
          const found = data.products.find(p => p._id === id);
          if (found) {
            // Gather all images from all colors
            let allImages = [];
            if (Array.isArray(found.images)) {
              found.images.forEach(imgObj => {
                if (Array.isArray(imgObj.imageLinks)) {
                  allImages = allImages.concat(imgObj.imageLinks);
                }
              });
            }
            const prod = {
              id: found._id,
              title: found.title,
              description: found.description,
              price: found.price,
              category: found.category?.name || 'Uncategorized',
              images: found.images,
              allImages,
              image: allImages[0] || '/placeholder-image.jpg',
              rating: found.ratings,
              brand: found.brand,
              stock: found.stock
            };
            setProduct(prod);
            setMainImage(prod.image);
          } else {
            setError('Product not found');
          }
        } else {
          setError('Invalid API response');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Helper to render rating stars
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= Math.round(rating)
          ? <FaStar key={i} className="text-yellow-400" />
          : <FaRegStar key={i} className="text-gray-300" />
      );
    }
    return stars;
  };

  // Header, search, and info
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Back Button */}
        <button
          className="mb-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          onClick={() => navigate(-1)}
        >
          ← Previous Page
        </button>
        {/* Product Details */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Loading product...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg max-w-md mx-auto">
              <svg className="w-6 h-6 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Error: {error}
            </div>
          </div>
        ) : product ? (
          <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg flex flex-col md:flex-row gap-8">
            {/* Images Gallery */}
            <div className="flex flex-col items-center md:w-1/2">
              <img src={mainImage} alt={product.title || product.name} className="w-72 h-72 object-cover rounded-lg border mb-4" />
              <div className="flex gap-2 flex-wrap justify-center">
                {(product.allImages || []).map((img, idx) => (
                  <img
                    key={idx}
                    src={img || '/placeholder-image.jpg'}
                    alt={`Thumbnail ${idx+1}`}
                    className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${mainImage === img ? 'border-blue-500' : 'border-transparent'}`}
                    onClick={() => setMainImage(img)}
                  />
                ))}
              </div>
            </div>
            {/* Details */}
            <div className="md:w-1/2 flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{product.title || product.name}</h2>
              <p className="text-gray-700 dark:text-gray-300">{product.description}</p>
              <div className="flex gap-4 items-center">
                <span className="text-xl font-semibold text-blue-600 dark:text-blue-400">₹{product.price}</span>
                <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">{product.category}</span>
                <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">Brand: {product.brand}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Rating:</span>
                {renderStars(product.rating || 0)}
                <span className="ml-2 text-gray-500">({product.rating || 0}/5)</span>
              </div>
              <div className="mt-2">
                <span className={`font-bold ${product.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                {typeof product.stock === 'number' && <span className="ml-2 text-gray-500">({product.stock} available)</span>}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ProductDetails;
