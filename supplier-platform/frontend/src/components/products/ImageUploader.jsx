import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX } from 'react-icons/fi';
import { validateImageFile, formatFileSize } from '@/utils/helpers';
import { toast } from 'react-toastify';

const ImageUploader = ({ images = [], onImagesChange, maxImages = 10 }) => {
  const onDrop = useCallback((acceptedFiles) => {
    const validFiles = [];

    acceptedFiles.forEach((file) => {
      const validation = validateImageFile(file, 5, ['image/jpeg', 'image/png', 'image/webp']);
      
      if (validation.isValid) {
        const reader = new FileReader();
        reader.onload = (e) => {
          validFiles.push({
            id: Date.now() + Math.random(),
            file,
            preview: e.target.result,
            name: file.name,
            size: file.size,
          });
          
          if (validFiles.length === acceptedFiles.length) {
            onImagesChange([...images, ...validFiles].slice(0, maxImages));
          }
        };
        reader.readAsDataURL(file);
      } else {
        toast.error(validation.errors[0]);
      }
    });
  }, [images, maxImages, onImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {'image/*': []},
    maxFiles: maxImages - images.length,
  });

  const removeImage = (id) => {
    onImagesChange(images.filter(img => img.id !== id));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
        }`}
      >
        <input {...getInputProps()} />
        <FiUpload className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-700 font-medium mb-2">
          Drag and drop images here, or click to browse
        </p>
        <p className="text-sm text-gray-500">
          PNG, JPG, WEBP up to 5MB (Max {maxImages} images)
        </p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div key={image.id} className="relative group">
              <img
                src={image.preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              {index === 0 && (
                <span className="absolute top-2 left-2 badge badge-success text-xs">
                  Main
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(image.id)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FiX size={16} />
              </button>
              <p className="text-xs text-gray-500 mt-1 truncate">
                {formatFileSize(image.size)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;