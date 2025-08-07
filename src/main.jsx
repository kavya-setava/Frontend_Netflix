import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';

// Perfect Scrollbar
import 'react-perfect-scrollbar/dist/css/styles.css';

// Tailwind CSS
import './tailwind.css';

// i18n (needs to be bundled)
import './i18n';

// Router
import { RouterProvider } from 'react-router-dom';
import router from './router/index';

// Redux
import { Provider } from 'react-redux';
import { store } from './store';

// Auth
import { AuthProvider } from './context/AuthContext'; // 👈 import your AuthProvider here

// 🚀 Set demo user in localStorage if not already set
const existingUser = localStorage.getItem("user");
if (!existingUser) {
  const demoUser = { name: "Demo User", role: "cm" }; // default user role
  localStorage.setItem("user", JSON.stringify(demoUser));
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense>
      <Provider store={store}>
        <AuthProvider> {/* 👈 wrap here */}
          <RouterProvider router={router} />
        </AuthProvider>
      </Provider>
    </Suspense>
  </React.StrictMode>
);
