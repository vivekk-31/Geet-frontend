// Importing required modules and components
import React, { useState } from 'react'; // Importing React and useState hook
import { useNavigate, Link } from 'react-router-dom'; // Importing routing utilities
import toast from 'react-hot-toast'; // Importing toast notifications
import { Eye, EyeOff } from 'lucide-react'; // Importing eye icons for password visibility toggle

const API_URL = import.meta.env.VITE_API_URL; 

// Login component receives setIsAuthenticated as a prop
const Login = ({ setIsAuthenticated }) => {
  // State variables for email, password, password visibility, and error message
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook to navigate between routes

  // Function to handle form submission
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form behavior
    setError(''); // Clear previous error if any

    try {
      // Sending POST request to the login API
      const res = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        credentials: 'include', // Include credentials such as cookies
        headers: {
          'Content-Type': 'application/json', // Setting content type to JSON
        },
        body: JSON.stringify({ email, password }), // Sending email and password
      });

      const data = await res.json(); // Parsing the response

      // If response not ok, throw error
      if (!res.ok) throw new Error(data.message || 'Login failed');

      // Saving token to local storage
      localStorage.setItem('token', data.token);

      // Updating authentication state
      setIsAuthenticated(true);

      // Display success toast
      toast.success('Welcome back to Geet!');

      // Redirect to homepage
      navigate('/');
    } catch (err) {
      // Catch and set error
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-neutral-800 p-8 sm:p-10 rounded-xl shadow-lg border border-neutral-700">
        
        {/* Title */}
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Sign in to Geet</h2>

        {/* Error message display */}
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        {/* Login form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5">

          {/* Email input */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password input with visibility toggle */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} // Toggle input type
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {/* Toggle password visibility button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 transition-colors text-white font-medium py-2 rounded"
          >
            Log In
          </button>
        </form>

        
        {/* Registration link */}
        <div className="text-sm text-gray-400 text-center mt-6">
          New to Geet?{' '}
          <Link
            to="/register"
            className="text-blue-400 hover:underline font-medium"
          >
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login; // Exporting the Login component
