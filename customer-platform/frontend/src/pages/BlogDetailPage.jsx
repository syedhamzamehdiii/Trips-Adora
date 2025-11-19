import React, { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import MainHeader from '../components/MainHeader'
import Footer from '../components/Footer'
import { blogPosts } from '../data/blogData'
import { FiClock, FiCalendar, FiArrowLeft, FiTag } from 'react-icons/fi'

const BlogDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const blog = blogPosts.find(post => post.id === id)

  useEffect(() => {
    try { localStorage.setItem('tripsadora_mode', 'customer') } catch (_) {}
  }, [])

  if (!blog) {
    return (
      <div className="min-h-screen bg-white">
        <MainHeader />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
          <Link to="/blogs" className="text-blue-900 hover:underline">
            Return to Blogs
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <MainHeader />
      {/* Hero Image */}
      <div
        className="relative h-[520px] w-full bg-gray-200"
        style={{
          backgroundImage: `url(${blog.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          willChange: 'transform'
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="max-w-7xl mx-auto px-6 h-full flex items-end pb-10">
          <div className="text-white max-w-3xl w-full">
            <button
              onClick={() => navigate('/blogs')}
              className="flex items-center gap-2 text-white hover:text-gray-200 mb-4 transition drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Back to Blogs</span>
            </button>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-snug drop-shadow-[0_3px_8px_rgba(0,0,0,0.6)] mb-4">
              {blog.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              <div className="flex items-center gap-2">
                <FiCalendar className="w-4 h-4" />
                <span>{blog.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiClock className="w-4 h-4" />
                <span>{blog.readTime} min read</span>
              </div>
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                {blog.category}
              </span>
              <span>By {blog.author}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        <div className="max-w-4xl mx-auto">
          <article className="bg-white rounded-3xl shadow-lg p-6 md:p-10">
            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {blog.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    <FiTag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Author Bio */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-gray-700">
                    {blog.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{blog.author}</h3>
                  <p className="text-gray-600 text-sm">
                    Travel expert and Japan enthusiast with years of experience exploring the Land of the Rising Sun.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Related Posts */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blogPosts
                .filter(post => post.id !== blog.id && post.category === blog.category)
                .slice(0, 2)
                .map(relatedBlog => (
                  <div
                    key={relatedBlog.id}
                    onClick={() => navigate(`/blogs/${relatedBlog.id}`)}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  >
                    <div className="relative h-48 bg-gray-200">
                      <img 
                        src={relatedBlog.image} 
                        alt={relatedBlog.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="p-5">
                      <span className="text-xs text-gray-500 mb-2 block">{relatedBlog.date}</span>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {relatedBlog.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {relatedBlog.excerpt}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default BlogDetailPage

