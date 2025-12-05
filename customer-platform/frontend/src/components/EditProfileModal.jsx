import React, { useEffect, useState } from 'react'
import imageService from '../services/imageService'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  location: '',
  avatar_url: ''
}

const EditProfileModal = ({ open, onClose, onSave, profileUser, saving }) => {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [avatarPublicId, setAvatarPublicId] = useState(null)

  useEffect(() => {
    if (!open) {
      setForm(initialForm)
      setError(null)
      setAvatarPublicId(null)
      setUploading(false)
      setUploadProgress(0)
      return
    }
    if (profileUser) {
      setForm({
        name: profileUser.name || '',
        email: profileUser.email || '',
        phone: profileUser.phone || '',
        location: profileUser.location || '',
        avatar_url: profileUser.avatar_url || ''
      })
      // Extract public_id from Cloudinary URL if it exists
      if (profileUser.avatar_url && profileUser.avatar_url.includes('cloudinary.com')) {
        try {
          const urlParts = profileUser.avatar_url.split('/')
          const uploadIndex = urlParts.findIndex(part => part === 'upload')
          if (uploadIndex !== -1 && urlParts[uploadIndex + 1]) {
            // Extract public_id from URL (format: cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.jpg)
            const afterUpload = urlParts.slice(uploadIndex + 2).join('/')
            const publicId = afterUpload.replace(/\.[^/.]+$/, '') // Remove file extension
            setAvatarPublicId(publicId)
          }
        } catch (e) {
          console.warn('Could not extract public_id from avatar URL:', e)
        }
      } else if (profileUser.avatar_public_id) {
        setAvatarPublicId(profileUser.avatar_public_id)
      }
    }
  }, [open, profileUser])

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileChange = async (event) => {
    const file = event?.target?.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB.')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      // Delete old image from Cloudinary if exists
      if (avatarPublicId) {
        try {
          await imageService.deleteImage(avatarPublicId)
        } catch (err) {
          console.warn('Failed to delete old avatar:', err)
        }
      }

      // Upload to Cloudinary
      const response = await imageService.uploadImage(file, {
        folder: 'customer/profile-photos',
        onUploadProgress: (progress) => setUploadProgress(progress)
      })

      if (!response?.url) {
        throw new Error(response?.detail || 'Upload failed')
      }

      setForm((prev) => ({
        ...prev,
        avatar_url: response.url
      }))
      setAvatarPublicId(response.public_id)
      setError(null)
    } catch (err) {
      console.error('Failed to upload image:', err)
      setError(err?.message || 'Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (event?.target) {
        event.target.value = ''
      }
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.name?.trim()) {
      setError('Name is required.')
      return
    }
    if (!form.email?.trim()) {
      setError('Email is required.')
      return
    }
    onSave(form)
  }

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100">
                {form.avatar_url ? (
                  <img src={form.avatar_url} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs">
                    Upload Photo
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 right-0 bg-blue-600 text-white text-xs px-3 py-1 rounded-full cursor-pointer hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {uploading ? `Uploading ${uploadProgress}%` : 'Change'}
                <input 
                  id="edit-profile-modal-file-input"
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="john.doe@example.com"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">City & Country</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="New York, USA"
              />
            </div>
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-[#1f3661] text-white text-sm shadow-sm disabled:opacity-50 disabled:pointer-events-none"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfileModal


