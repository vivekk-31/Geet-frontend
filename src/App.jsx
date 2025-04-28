import './App.css';
import HomeLayout from '../components/Home'; 
import Login from '../components/Login';
import Register from '../components/Register';
import UploadSong from '../components/UploadSong';
import MainLayout from '../components/MainLayout'; 
import { Toaster } from 'react-hot-toast';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useState, useEffect } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false); // new state to track when auth is ready

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setAuthChecked(true); // important!
  }, []);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <MainLayout />,
      children: [
        {
          path: "",
          element: <HomeLayout isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
        },
        {
          path: "songs",
          element: <UploadSong />
        }
      ]
    },
    {
      path: "/register",
      element: <Register setIsAuthenticated={setIsAuthenticated} />
    },
    {
      path: "/login",
      element: <Login setIsAuthenticated={setIsAuthenticated} />
    }
  ]);

  if (!authChecked) return null;

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
