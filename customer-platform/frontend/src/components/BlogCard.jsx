import React, { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiClock, FiCalendar } from 'react-icons/fi'

const BlogCard = memo(({ blog }) => {
  const navigate = useNavigate()

  return (
    <div 
      onClick={() => navigate(`/blogs/${blog.id}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
    >
      <div className="relative h-48 bg-gray-200">
        <img 
          src={blog.image} 
          alt={blog.title}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          style={{ aspectRatio: '16/9' }}
        />
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
            {blog.category}
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <FiCalendar className="w-3 h-3" />
            <span>{blog.date}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <FiClock className="w-3 h-3" />
            <span>{blog.readTime} min</span>
          </div>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {blog.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {blog.excerpt}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-700">
                {blog.author.charAt(0)}
              </span>
            </div>
            <span className="text-xs text-gray-600">{blog.author}</span>
          </div>
          <span className="text-blue-900 text-sm font-medium flex items-center gap-1">
            Read
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  )
})

BlogCard.displayName = 'BlogCard'

export default BlogCard

