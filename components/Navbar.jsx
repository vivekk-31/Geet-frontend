import React, { useState, useRef } from 'react';
import { Menu, Search, LogIn, LogOut, UserPlus, Home, Library } from 'lucide-react';
import ThemeToggler from './ThemeToggler';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Navbar = ({ onNavigate, onSearch }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('token');


  const confirmLogout = () => {
    toast.custom((t) => {
      return (
        <div
          className={`bg-white dark:bg-gray-900 text-black dark:text-white px-6 py-5 rounded-lg shadow-xl w-[90%] max-w-md
          transition duration-300 ease-out
          ${t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}
        `}
        >
          <div className="flex flex-col items-center gap-4">
            <span className="font-medium text-center text-base">Log out?</span>
            <div className="flex justify-between w-full gap-3">
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm flex-1"
                onClick={() => {
                  handleLogout();
                  toast.dismiss(t.id);
                }}
              >
                Yes
              </button>
              <button
                className="bg-gray-300 dark:bg-gray-700 text-black dark:text-white px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-600 text-sm flex-1"
                onClick={() => toast.dismiss(t.id)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      );
    }, { duration: 10000 });
  };


  const handleLogout = () => {
    // Your logout logic here
    localStorage.removeItem('token');
    navigate('/');  // Redirect after logout
  };

  const searchInputRef = useRef(null);


  const onHome = () => {
    navigate('/');
  }

  return (
    <>
      {/* Top Navbar */}
      <div className="w-full flex items-center justify-between px-4 py-2 md:h-20 ">
        {/* Logo - Desktop Only */}
        <div
          className="hidden md:block text-3xl font-bold cursor-pointer font-kalam transition-all duration-500 
             text-neutral-800 dark:text-neutral-200 
             hover:text-amber-700 dark:hover:text-amber-300 
             tracking-wide hover:scale-105 hover:shadow-lg 
             ease-in-out"
        >
          🎶 <span lang="hi">गीत</span>
        </div>



        {/* Center Section (Home + Search) */}
        <div className="flex items-center gap-2 w-full md:w-[40%] justify-center relative mx-2">
          <Home
            className="hidden md:block w-7 h-7 cursor-pointer hover:text-blue-400 mx-4"
            onClick={() => navigate('/')}
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search songs, artists..."
            value={searchTerm}
            onChange={e => {
              const v = e.target.value;
              setSearchTerm(v);
              if (v === '') onSearch('');           // clear on empty
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                if (searchTerm.trim()) onSearch(searchTerm);
                else {
                  onSearch('');
                  toast.error("Please enter a search term.");
                }
              }
            }}
            className="w-full rounded-full pl-4 pr-10 py-2 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                onSearch('');
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >×</button>
          )}
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" />

          
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <ThemeToggler />
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex gap-2 items-center">
            {isLoggedIn ? (
              <button onClick={confirmLogout} className="flex items-center gap-1 hover:text-red-400 cursor-pointer md:mx-5">
                <LogOut size={16} /> Logout
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="flex items-center gap-1 hover:text-blue-400 cursor-pointer">
                  <LogIn size={16} /> Login
                </button>
                <button onClick={() => navigate('/register')} className="flex items-center gap-1 hover:text-blue-400 cursor-pointer">
                  <UserPlus size={16} /> Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <Menu className="block md:hidden cursor-pointer" onClick={() => setMenuOpen(prev => !prev)} />
        </div>
      </div>

      {/* Mobile Dropdown Auth Menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col items-end px-4 py-2 ">
          {isLoggedIn ? (
            <button onClick={confirmLogout} className="flex items-center gap-2 py-1 hover:text-red-400 cursor-pointer">
              <LogOut size={16} /> Logout
            </button>
          ) : (
            <>
              <button onClick={() => { setMenuOpen(false); navigate('/login'); }} className="flex items-center gap-2 py-1 hover:text-blue-400">
                <LogIn size={16} /> Login
              </button>
              <button onClick={() => { setMenuOpen(false); navigate('/register'); }} className="flex items-center gap-2 py-1 hover:text-blue-400">
                <UserPlus size={16} /> Sign Up
              </button>
            </>
          )}
        </div>
      )}

      {/* Bottom Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around py-2 border-t border-gray-700 dark:bg-gray-950 dark:text-white">
        <Home
          className="w-6 h-6 cursor-pointer hover:text-blue-400"
          onClick={onHome}
        />
        <Search
          className="w-6 h-6 cursor-pointer hover:text-blue-400"
          onClick={() => {
            searchInputRef.current?.focus();
            // Scroll to top (optional, in case input is out of view)
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        <Library
          className="w-6 h-6 cursor-pointer hover:text-blue-400"
          onClick={() => onNavigate('library')}
        />
      </div>
    </>
  );
};

export default Navbar;
