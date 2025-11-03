import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import defaultAvatar from '../assets/default-avatar.png';
import { updateProfile, clearError } from '../store/auth-slice/authSlice';

export default function ProfilePage() {
  const { user, token, isLoading, isError, message } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    isDeaf: false,
  });

  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
    if (user) {
      setFormData({
        name: user.name,
        isDeaf: user.isDeaf,
      });
      setFilePreview(user.profile_image_url || defaultAvatar);
    }
  }, [token, user, navigate]);


  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    dispatch(clearError());
    if (user) {
      setFormData({
        name: user.name,
        isDeaf: user.isDeaf,
      });
      setFilePreview(user.profile_image_url || defaultAvatar);
      setFile(null);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('name', formData.name);
    data.append('isDeaf', formData.isDeaf);

    if (file) {
      data.append('profile_image_file', file);
    } else {
      data.append('profile_image_url', user.profile_image_url || '');
    }

    dispatch(updateProfile(data))
      .unwrap()
      .then(() => {
        setIsEditing(false);
      })
      .catch((err) => {
        console.error("Failed to update profile:", err);
      });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  const userImage = user.profile_image_url || defaultAvatar;

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar />

      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <h1 className="text-4xl font-extrabold text-center mb-12 text-blue-600">
          Your Profile
        </h1>

        <form className="bg-white shadow-xl rounded-lg p-8" onSubmit={handleFormSubmit}>

          <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between space-y-8 md:space-y-0 md:space-x-12">

            <div className="w-full flex-grow space-y-6">

              <div className="flex flex-col">
                <label htmlFor="name" className="text-sm font-medium text-gray-500">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-2xl font-semibold"
                  />
                ) : (
                  <span className="text-2xl font-semibold text-gray-900">{user.name}</span>
                )}
              </div>

              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Email Address</span>
                <span className="text-2xl font-semibold text-gray-900">{user.email}</span>
              </div>

              <div className="flex flex-col">
                <label htmlFor="isDeaf" className="text-sm font-medium text-gray-500">Communication Profile</label>
                {isEditing ? (
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      name="isDeaf"
                      id="isDeaf"
                      checked={formData.isDeaf}
                      onChange={handleFormChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isDeaf" className="ml-2 block text-gray-900">
                      I am deaf or hard of hearing
                    </label>
                  </div>
                ) : (
                  <span className="text-2xl font-semibold text-gray-900">
                    {user.isDeaf ? "Deaf / Hard of Hearing" : "Hearing"}
                  </span>
                )}
              </div>

            </div>

            <div className="flex-shrink-0 flex flex-col items-center">
              <img
                src={isEditing ? filePreview : userImage}
                alt="Profile"
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-blue-200 shadow-md"
              />
              {isEditing && (
                <label
                  htmlFor="profile_image_file"
                  className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 mt-4"
                >
                  Change Photo
                  <input
                    type="file"
                    name="profile_image_file"
                    id="profile_image_file"
                    accept="image/png, image/jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

          </div>

          {isError && (
            <p className="text-sm text-red-600 text-center mt-4">{message}</p>
          )}

          {isEditing && (<div className="mt-8 flex flex-col md:flex-row gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition disabled:bg-blue-300"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="w-full md:w-auto py-3 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>)}

        </form>
        {!isEditing && (<div className="mt-8 flex flex-col md:flex-row gap-4">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition"
          >
            Edit Profile
          </button>
        </div>)}
      </div>
    </div>
  );
}