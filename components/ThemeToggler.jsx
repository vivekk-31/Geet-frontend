// ThemeToggle.jsx
import { useEffect, useState } from 'react';
import { MdDarkMode } from "react-icons/md";
import { MdLightMode } from "react-icons/md";

function ThemeToggler() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <div
      onClick={() => setDarkMode(!darkMode)} className='cursor-pointer duration-300'
      >
     {darkMode ? <MdLightMode size={30} /> : <MdDarkMode size={30} />}
    </div>
  );
}


export default ThemeToggler
