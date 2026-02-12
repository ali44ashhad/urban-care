import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import servicesService from '../../services/services.service';
import categoriesService from '../../services/categories.service';
import reviewsService from '../../services/reviews.service';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAuthContext } from '../../context/AuthContext';
import { normalizeSlug, createSlug } from '../../utils/formatters';

export default function CategoryServices() {
  const { category: categoryParam, subCategory: subCategoryParam } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDetails, setCategoryDetails] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [subCategoryDetails, setSubCategoryDetails] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [serviceReviews, setServiceReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const PAGE_LIMIT = 20;

  const category = normalizeSlug(categoryParam || '');
  const subCategory = subCategoryParam ? normalizeSlug(subCategoryParam) : null;

  useEffect(() => {
    if (categoryParam && category && category !== categoryParam) {
      const path = subCategory ? `/services/${category}/${subCategory}` : `/services/${category}`;
      navigate(path, { replace: true });
    } else if (subCategoryParam && subCategory && subCategory !== subCategoryParam) {
      navigate(`/services/${category}/${subCategory}`, { replace: true });
    }
  }, [categoryParam, subCategoryParam, category, subCategory, navigate]);

  useEffect(() => {
    loadCategoryAndServices();
  }, [category, subCategory]);

  useEffect(() => {
    if (selectedService) {
      loadServiceReviews(selectedService._id);
    }
  }, [selectedService]);

  async function loadCategoryAndServices() {
    setLoading(true);
    setSubcategories([]);
    setSubCategoryDetails(null);
    try {
      const categoriesRes = await categoriesService.list();
      const categories = categoriesRes.data.items || categoriesRes.data || [];
      setAllCategories(categories);

      let matchedCategory = categories.find(cat => cat.slug === category);
      if (!matchedCategory) {
        matchedCategory = categories.find(cat => normalizeSlug(cat.slug) === category);
      }

      if (!matchedCategory) {
        console.warn('No category found for slug:', category);
        setCategoryName(category);
        setServices([]);
        setLoading(false);
        return;
      }

      setCategoryName(matchedCategory.name);
      setCategoryDetails(matchedCategory);

      if (subCategory) {
        // Sub-category in URL: fetch services for this category + subcategory
        const res = await servicesService.list({
          category: matchedCategory.name,
          subCategory,
          page: 1,
          limit: PAGE_LIMIT
        });
        const servicesList = res.data?.items || res.data || [];
        setServices(servicesList);
        setPage(1);
        setHasMore(servicesList.length === PAGE_LIMIT);
        setSelectedService(servicesList.length > 0 ? servicesList[0] : null);
        const subRes = await categoriesService.listSubcategories(category);
        const subs = subRes.data?.items || [];
        setSubcategories(Array.isArray(subs) ? subs : []);
        const currentSub = subs.find(s => (s.slug || '').toLowerCase() === subCategory.toLowerCase());
        setSubCategoryDetails(currentSub || null);
      } else {
        // No sub-category: fetch sub-categories for this category
        const subRes = await categoriesService.listSubcategories(category);
        const subs = subRes.data?.items || [];
        const subList = Array.isArray(subs) ? subs : [];
        setSubcategories(subList);

        if (subList.length > 0) {
          setServices([]);
          setSelectedService(null);
        } else {
          // No sub-categories: show all services in category (backward compatible)
          const res = await servicesService.list({
            category: matchedCategory.name,
            page: 1,
            limit: PAGE_LIMIT
          });
          const servicesList = res.data?.items || res.data || [];
          setServices(servicesList);
          setPage(1);
          setHasMore(servicesList.length === PAGE_LIMIT);
          setSelectedService(servicesList.length > 0 ? servicesList[0] : null);
        }
      }
    } catch (err) {
      console.error('Failed to load services:', err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadMoreServices() {
    if (loadingMore || !hasMore || !categoryDetails) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const params = { category: categoryDetails.name, page: nextPage, limit: PAGE_LIMIT };
      if (subCategory) params.subCategory = subCategory;
      const res = await servicesService.list(params);
      const newItems = res.data?.items || res.data || [];
      setServices(prev => [...prev, ...newItems]);
      setPage(nextPage);
      setHasMore(newItems.length === PAGE_LIMIT);
    } catch (err) {
      console.error('Failed to load more services:', err);
    } finally {
      setLoadingMore(false);
    }
  }

  async function loadServiceReviews(serviceId) {
    setReviewsLoading(true);
    try {
      const res = await reviewsService.listByService(serviceId);
      const reviews = res.data?.items || res.data || [];
      setServiceReviews(Array.isArray(reviews) ? reviews : []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
      setServiceReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }

  function handleServiceClick(service) {
    setSelectedService(service);
    // Scroll to detail section on mobile
    if (window.innerWidth < 1024) {
      document.getElementById('service-detail')?.scrollIntoView({ behavior: 'smooth' });
    }
  }


  function handleAddToCart(service) {
    // Check if user is logged in
    if (!user) {
      window.dispatchEvent(new CustomEvent('app:toast', {
        detail: { message: 'Please login to add service to cart', type: 'warning' }
      }))
      navigate('/auth/login', { state: { from: window.location.pathname } })
      return
    }

    // Prevent admin from adding to cart
    if (user.role === 'admin') {
      window.dispatchEvent(new CustomEvent('app:toast', {
        detail: { message: 'Admin users cannot add services to cart', type: 'info' }
      }))
      return
    }

    // Get existing cart
    const existingDraft = JSON.parse(sessionStorage.getItem('bookingDraft') || '{}');
    const cartItems = existingDraft.items || [];
    
    // Prepare images array
    let images = [];
    if (service.images && Array.isArray(service.images) && service.images.length > 0) {
      images = service.images;
    } else if (service.image) {
      images = [service.image];
    }
    
    // Add service to cart (maintain backward compatibility with old cart format)
    const cartItem = {
      service: {
        _id: service._id,
        title: service.title,
        category: service.category,
        basePrice: service.basePrice,
        images: images,
        description: service.description,
        durationMin: service.durationMin
      },
      selectedOption: null,
      quantity: 1
    };
    
    cartItems.push(cartItem);
    
    existingDraft.items = cartItems;
    sessionStorage.setItem('bookingDraft', JSON.stringify(existingDraft));
    window.dispatchEvent(new Event('cartUpdated'));
    
    // Show success message
    window.dispatchEvent(new CustomEvent('app:toast', {
      detail: { message: 'Service added to cart!', type: 'success' }
    }))
  }

  if (loading) {
    return (
      <LoadingSpinner/>
    );
  }

  const showSubcategoryGrid = subcategories.length > 0 && !subCategory;
  const showServicesList = services.length > 0 || (subCategory && !loading);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {subCategoryDetails ? subCategoryDetails.name : (categoryName || 'Services')}
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-2">
              {subCategoryDetails ? `Services under ${categoryName}` : (categoryDetails?.description || 'Choose a sub-category or browse services')}
            </p>
            {!showSubcategoryGrid && (
              <p className="text-blue-200">
                {services.length} services available
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Category Details */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Verified Professionals</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>On-time Service</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Quality Assured</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Sub-category grid: same layout & theme as main categories (ServiceCategories) */}
        {showSubcategoryGrid && (
          <section className="mb-10">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
                What are you looking for?
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Choose a sub-category to browse available services
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              {subcategories.map((sub, idx) => (
                <motion.div
                  key={sub._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  onClick={() => navigate(`/services/${createSlug(category)}/${createSlug(sub.slug)}`)}
                  className="group cursor-pointer"
                >
                  <div className="bg-white rounded-lg shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 transform hover:-translate-y-1">
                    {/* Icon/Image - use parent category color & icon for same theme */}
                    <div className={`h-32 sm:h-40 bg-gradient-to-br ${categoryDetails?.color || 'from-blue-500 to-cyan-500'} flex items-center justify-center relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                      <span className="text-5xl sm:text-6xl filter drop-shadow-lg">
                        {categoryDetails?.icon || '📋'}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-3 sm:p-4">
                      <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                        {sub.name}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        View services
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {!showSubcategoryGrid && services.length === 0 && !loading ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No services found</h3>
            <p className="text-gray-500 mb-4">Services in this {subCategory ? 'sub-category' : 'category'} will be available soon.</p>
            <Button onClick={() => navigate(subCategory ? `/services/${createSlug(category)}` : '/')}>
              {subCategory ? 'Back to category' : 'Browse Other Categories'}
            </Button>
          </div>
        ) : showServicesList ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN - Other Categories & UC Promise (below on mobile only) */}
            <div className="lg:col-span-3 space-y-6 order-3 md:order-1">
              {/* Other Categories */}
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Other Categories</h3>
                <div className="space-y-2">
                  {allCategories
                    .filter(cat => cat.slug !== category)
                    .slice(0, 8)
                    .map(cat => (
                      <button
                        key={cat._id}
                        onClick={() => navigate(`/services/${createSlug(cat.slug)}`)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-blue-600 transition-colors text-sm flex items-center justify-between group"
                      >
                        <span>{cat.name}</span>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                </div>
              </div>

              {/* UC Promise Card */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-sm p-6 border border-purple-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Stunn Promise</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">Verified Professionals</h4>
                      <p className="text-xs text-gray-600 mt-1">Background verified & trained experts</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">Safe Chemicals</h4>
                      <p className="text-xs text-gray-600 mt-1">Eco-friendly & certified products</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">Superior Stain Removal</h4>
                      <p className="text-xs text-gray-600 mt-1">Advanced techniques & equipment</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CENTER COLUMN - Services List (first on mobile only) */}
            <div className="lg:col-span-5 space-y-4 order-1 md:order-2">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Available Services</h2>
              
              {services.map((service, idx) => (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  onClick={() => handleServiceClick(service)}
                  className={`bg-white rounded-xl shadow-sm hover:shadow-md border-2 transition-all duration-300 cursor-pointer ${
                    selectedService?._id === service._id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-100 hover:border-blue-200'
                  }`}
                >
                  <div className="flex gap-4 p-4">
                    <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                      {(service.image || service.images?.[0]) ? (
                        <img
                          src={service.image || service.images[0]}
                          alt={service.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-10 h-10 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        {service.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {service.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          {service.durationMin && (
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{service.durationMin} mins</span>
                            </div>
                          )}
                          {service.rating && (
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                              </svg>
                              <span>{service.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="text-lg font-bold text-green-600">₹{service.basePrice}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {hasMore && (
                <div className="mt-4 flex justify-center">
                  <Button onClick={loadMoreServices} disabled={loadingMore}>
                    {loadingMore ? 'Loading...' : 'Load more services'}
                  </Button>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN - Service Detail Card (second on mobile only) */}
            <div className="lg:col-span-4 order-2 md:order-3" id="service-detail">
              {selectedService ? (
                <div className="sticky top-4 space-y-6">
                  {/* Service Detail Card */}
                  <motion.div
                    key={selectedService._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
                  >
                    <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 relative">
                      {(selectedService.image || selectedService.images?.[0]) ? (
                        <img
                          src={selectedService.image || selectedService.images[0]}
                          alt={selectedService.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-16 h-16 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h2 className="text-2xl font-bold text-gray-800 mb-3">
                        {selectedService.title}
                      </h2>

                      <p className="text-gray-600 mb-4">
                        {selectedService.description}
                      </p>

                      {selectedService.durationMin && (
                        <div className="flex items-center gap-2 text-gray-600 mb-4">
                          <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{selectedService.durationMin} minutes</span>
                        </div>
                      )}

                      {selectedService.pricingOptions?.length > 0 ? (
                        <div className="mb-6">
                          <h3 className="text-sm font-semibold text-gray-700 mb-3">Pricing Options:</h3>
                          <div className="space-y-2">
                            {selectedService.pricingOptions.map((option, i) => (
                              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-800">{option.name}</span>
                                <span className="font-bold text-green-600">₹{option.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="mb-6 p-4 bg-green-50 rounded-lg">
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-green-600">₹{selectedService.basePrice}</span>
                            <span className="text-sm text-gray-600">Starting price</span>
                          </div>
                        </div>
                      )}
<div className='flex gap-2'>
                      <Button 
                        onClick={() => handleAddToCart(selectedService)} 
                        className="w-full"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Add to Cart
                      </Button>
                      <Button 
                        onClick={() => navigate('/client/cart')} 
                        className="w-full"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Go to Cart
                      </Button>
                    </div>
                    </div>
                  </motion.div>

                  {/* Reviews Section */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                      Customer Reviews
                    </h3>

                    {reviewsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      </div>
                    ) : !Array.isArray(serviceReviews) || serviceReviews.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {serviceReviews.map(review => (
                          <div key={review._id} className="border-b border-gray-100 pb-4 last:border-0">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                                {review.clientId?.name?.charAt(0) || 'U'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-semibold text-gray-800">
                                    {review.clientId?.name || 'Anonymous'}
                                  </h4>
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <svg
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                        }`}
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                      </svg>
                                    ))}
                                  </div>
                                </div>
                                 {/* {review.title && (
                                  <p className="font-medium text-gray-700 text-sm mb-1">
                                    {review.title}
                                  </p>
                                )} */}
                                <p className="text-gray-600 text-sm">
                                  {review.comment}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  <p className="text-gray-500">Select a service to view details</p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
