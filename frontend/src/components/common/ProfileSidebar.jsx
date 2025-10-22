import React, { useState, useRef } from 'react';
import { IoPersonOutline, IoPencilOutline, IoCameraOutline, IoNotificationsOutline, IoLogOutOutline, IoClose } from 'react-icons/io5';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiMultipart, API_BASE_URL } from '../../config/api';

const ProfileSidebar = ({ isOpen, onClose }) => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await apiMultipart.post('/upload/profile-picture', formData);
      const updatedUser = { ...user, profilePicture: `${API_BASE_URL}${response.data.profilePicture}` };
      updateUser(updatedUser);
      console.log('Profile picture uploaded successfully');
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const menuItems = [
    {
      icon: <IoPersonOutline size={20} />,
      label: 'View Profile',
      onClick: () => {
        navigate('/profile');
        onClose();
      }
    },
    {
      icon: <IoPencilOutline size={20} />,
      label: 'Edit Profile',
      onClick: () => {
        navigate('/profile/edit');
        onClose();
      }
    },
    {
      icon: <IoCameraOutline size={20} />,
      label: 'Change Photo',
      onClick: () => fileInputRef.current?.click()
    },
    {
      icon: <IoNotificationsOutline size={20} />,
      label: 'Notifications',
      onClick: () => {
        navigate('/notifications');
        onClose();
      }
    },
    {
      icon: <IoLogOutOutline size={20} />,
      label: 'Logout',
      onClick: () => {
        logout();
        onClose();
      },
      className: 'text-red-600 hover:bg-red-50'
    }
  ];

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      <div className="fixed top-0 right-0 h-full w-full sm:w-80 max-w-sm bg-white shadow-2xl z-50 transform transition-transform duration-300">
        <div className="p-4 sm:p-6 h-full overflow-y-auto">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <IoClose size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>

          <div className="text-center mb-6 sm:mb-8">
            <div className="relative inline-block">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold mb-3 overflow-hidden">
                {user?.profilePicture ? (
                  <img 
                    src={user.profilePicture.startsWith('http') ? user.profilePicture : `${API_BASE_URL}${user.profilePicture}`}  
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.firstName?.charAt(0)?.toUpperCase()
                )}
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base break-words">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 capitalize">{user?.role}</p>
            <p className="text-xs text-gray-400 break-all">{user?.email}</p>
          </div>

          <div className="space-y-1 sm:space-y-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base ${item.className || 'text-gray-700'}`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="font-medium truncate">{item.label}</span>
              </button>
            ))}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfilePictureUpload}
            className="hidden"
          />
        </div>
      </div>
    </>
  );
};

export default ProfileSidebar;