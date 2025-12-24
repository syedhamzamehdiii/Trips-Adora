import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import HeaderLandingPage from '../components/HeaderLandingPage'
import BottomNavigationBar from '../components/BottomNavigationBar'
import Footer from '../components/Footer'
import BlogCard from '../components/BlogCard'
import { blogPosts } from '../data/blogData'
import { FiSearch, FiX } from 'react-icons/fi'

const BlogsPage = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const blogsPerPage = 6

  useEffect(() => {
    try { localStorage.setItem('tripsadora_mode', 'customer') } catch (_) {}
    
    // Preload featured blog image if available
    if (blogPosts.length > 0) {
      const img = new Image()
      img.src = blogPosts[0].image
    }
  }, [])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory])

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['All', ...new Set(blogPosts.map(blog => blog.category))]
    return cats
  }, [])

  // Filter and search blog posts
  const filteredBlogs = useMemo(() => {
    let filtered = blogPosts

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(blog => blog.category === selectedCategory)
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(blog => 
        blog.title.toLowerCase().includes(query) ||
        blog.excerpt.toLowerCase().includes(query) ||
        blog.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        blog.author.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [searchQuery, selectedCategory])

  // Separate featured blog and other blogs
  const featuredBlog = filteredBlogs.length > 0 && (selectedCategory === 'All' && !searchQuery.trim()) ? filteredBlogs[0] : null
  const blogsToPaginate = featuredBlog ? filteredBlogs.slice(1) : filteredBlogs

  // Pagination calculations
  const totalPages = Math.ceil(blogsToPaginate.length / blogsPerPage)
  const startIndex = (currentPage - 1) * blogsPerPage
  const endIndex = startIndex + blogsPerPage
  const displayBlogs = blogsToPaginate.slice(startIndex, endIndex)

  // Page change handlers
  const goToPage = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white">
      <HeaderLandingPage />
      <BottomNavigationBar />
      {/* Hero Section */}
      <div
        className="relative h-[520px] w-full bg-gray-200"
        style={{
          backgroundImage: "url('/images/woman-wearing-vietnam-culture-traditional-cherry-blossom-park.jpg')",
          // Fill the area and crop slightly on top/bottom
          backgroundSize: 'cover',
          // Focus around the subject in the middle, bias a bit upward
          // (50% 35% = centered horizontally, slight upward shift)
          backgroundPosition: '50% 35%',
          backgroundRepeat: 'no-repeat',
          willChange: 'transform'
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-6 h-full flex items-end pb-10">
          <div className="text-white max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-snug drop-shadow-[0_3px_8px_rgba(0,0,0,0.6)]">
              <span className="block">Travel Blog</span>
            </h1>
            <p className="mt-6 text-base md:text-lg text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
              Discover Japan through stories, tips, and insights from travelers who've explored the Land of the Rising Sun
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search blogs by title, content, tags, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  <FiX className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 md:w-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    selectedCategory === category
                      ? 'bg-blue-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          {(searchQuery || selectedCategory !== 'All') && (
            <div className="mt-4 text-sm text-gray-600">
              Found <span className="font-semibold text-gray-900">{filteredBlogs.length}</span> article{filteredBlogs.length !== 1 ? 's' : ''}
              {searchQuery && (
                <span> for "<span className="font-semibold">{searchQuery}</span>"</span>
              )}
            </div>
          )}
        </div>

        {/* Featured Blog */}
        {featuredBlog && (
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Featured Article</h2>
            <div 
              onClick={() => navigate(`/blogs/${featuredBlog.id}`)}
              className="relative rounded-3xl overflow-hidden shadow-xl bg-white cursor-pointer transform hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="relative h-64 lg:h-auto bg-gray-200">
                  <img 
                    src={featuredBlog.image} 
                    alt={featuredBlog.title}
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                    fetchpriority="high"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-900 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Featured
                    </span>
                  </div>
                </div>
                <div className="p-6 lg:p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-3 text-sm text-gray-600">
                    <span>{featuredBlog.date}</span>
                    <span>•</span>
                    <span>{featuredBlog.readTime} min read</span>
                    <span>•</span>
                    <span>{featuredBlog.category}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    {featuredBlog.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {featuredBlog.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-blue-900 font-medium">
                    Read More
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Blog Posts */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            {searchQuery || selectedCategory !== 'All' ? 'Search Results' : 'Latest Articles'}
          </h2>
          {displayBlogs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayBlogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                              currentPage === page
                                ? 'bg-blue-900 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-2 text-gray-400">...</span>
                      }
                      return null
                    })}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-2">No articles found</p>
              <p className="text-gray-400 text-sm">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default BlogsPage

