import React from 'react';

const HoldersModal = ({ isOpen, onClose }) => {
  const holders = [
    {
      id: 1,
      name: 'Syed Hamza Mehdi',
      email: 'Syedhamza234@gmail.com',
      initial: 'SH',
    },
    {
      id: 2,
      name: 'Salman Sadiq',
      email: 'Salmansadiq234@gmail.com',
      initial: 'SS',
    },
    {
      id: 3,
      name: 'Uzair Ahmad',
      email: 'uzairehmed234@gmail.com',
      initial: 'UA',
    },
    {
      id: 4,
      name: 'Salman Sadiq',
      email: 'Salmansadiq234@gmail.com',
      initial: 'SS',
    },
  ];

  const handleRemove = (id) => {
    // Handle remove logic here
    console.log('Removing holder:', id);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={onClose}
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-bold text-gray-900 mb-2 text-center" style={{ fontSize: '24px' }}>No. of Holders added</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">First Select the Role of holder.</p>

        {/* Holders List */}
        <div className="space-y-3">
          {holders.map((holder) => (
            <div
              key={holder.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                style={{ backgroundColor: '#3B69E2' }}
              >
                {holder.initial}
              </div>

              {/* Name and Email */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-sm">{holder.name}</h3>
                <p className="text-xs truncate" style={{ color: '#8C8B8B' }}>{holder.email}</p>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => handleRemove(holder.id)}
                className="px-4 py-1.5 rounded-lg flex-shrink-0"
                style={{ 
                  backgroundColor: '#FF8484',
                  color: '#000000',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HoldersModal;

