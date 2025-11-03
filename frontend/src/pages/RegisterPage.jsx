import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../store/auth-slice/authSlice';
import Footer from '../components/Footer';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    isDeaf: false,
  });

  const [registerSuccess, setRegisterSuccess] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { token, isLoading, isError, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    setRegisterSuccess(false);

    try {
      await dispatch(register(formData)).unwrap();

      setRegisterSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (rejectedValue) {
      console.error('Failed to register:', rejectedValue);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="w-full p-6 flex justify-between items-center bg-white shadow-sm">
        <div>
          <Link to="/" className="text-3xl font-bold text-blue-600">
            SPEAK
          </Link>
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md p-10 bg-white rounded-lg shadow-xl space-y-6 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6">
            Create Account
          </h1>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center justify-start text-left">
              <input
                id="isDeaf"
                name="isDeaf"
                type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={formData.isDeaf}
                onChange={handleChange}
              />
              <label htmlFor="isDeaf" className="ml-2 block text-sm text-gray-900">
                I am deaf or hard of hearing
              </label>
            </div>

            {isError && (
              <div className="text-red-500 text-sm text-center">
                {message}
              </div>
            )}

            {registerSuccess && (
              <div className="text-green-500 text-sm text-center">
                Registration successful! Redirecting to login...
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-md text-white cursor-pointer ${isLoading
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition`}
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Login
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}