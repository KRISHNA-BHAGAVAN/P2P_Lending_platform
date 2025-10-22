import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api, apiMultipart, API_BASE_URL } from '../../config/api';

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    address: user?.address || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await apiMultipart.post('/upload/profile-picture', formData);
      const updatedUser = { ...user, profilePicture: `${API_BASE_URL}${response.data.profilePicture}` };
      updateUser(updatedUser);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!user?.profilePicture) return;
    
    setUploadingPhoto(true);
    try {
      await api.delete('/upload/profile-picture');
      const updatedUser = { ...user, profilePicture: null };
      updateUser(updatedUser);
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/auth/profile', formData);
      updateUser(response.data);
      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Edit Profile</h1>
            <button
              onClick={() => navigate('/profile')}
              className="text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base self-start sm:self-auto"
            >
              Cancel
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          {/* Profile Picture Section */}
          <div className="mb-6 sm:mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Profile Picture
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold overflow-hidden self-center sm:self-start">
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
              <div className="flex-1">
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploadingPhoto}
                />
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <label
                    htmlFor="profilePicture"
                    className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 inline-block text-center text-sm sm:text-base"
                  >
                    {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
                  </label>
                  {user?.profilePicture && (
                    <button
                      type="button"
                      onClick={handleDeletePhoto}
                      disabled={uploadingPhoto}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  JPG, PNG up to 5MB
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-6">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm sm:text-base order-1 sm:order-2"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;