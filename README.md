# Geet - Frontend

Welcome to **Geet** — A sleek music app where users can upload and discover songs.  
This is the frontend, built with **React** and **Tailwind CSS**, and deployed on **Vercel**.

## Features
- **User Registration & Login** with real JWT authentication.
- **Upload Songs** with **Cover Images** using multi-file form submission.
- **Public Song Gallery**: Browse all songs marked as public by other users.
- **Personal Song Library**: View all songs you have uploaded.
- **Audio Playback** support for uploaded songs.
- **Protected Routes**: Pages like song upload are protected and accessible only after login.
- **Persistent Login** using token storage in localStorage.
- **Upload Progress Handling** (smooth UX experience).
- **Form Validation** for better input management.
- **Error Handling & Notifications** using **react-hot-toast**.
- **Responsive Design** optimized for both mobile and desktop.
- **Secure API Communication** with Token-based headers.

## Tech Stack
- React.js
- Tailwind CSS
- React Router
- React Hot Toast
- Vercel (Deployment)

## Environment Variables
Create a `.env` file at the root:

```bash
VITE_API_URL=<your-backend-url>
```

## Setup Instructions
```bash
git clone https://github.com/vivekk-31/Geet-frontend.git

cd geet-frontend

npm install

npm run dev
```

I encourage all developers to fork, star, and add features they like!
Feel free to open PRs and suggest improvements.
