import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './layouts/Navbar.jsx';
import Home from './pages/home.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import CartMenu from './components/CartMenu.jsx';
import { FavoritesProvider } from './context/FavoritesContext.jsx';

// Route-level code splitting: each page ships as its own chunk and is only
// downloaded when first visited. Home stays eager since it's the landing page.
// The admin bundle in particular is large and only needed by admins.
const Shops = lazy(() => import('./pages/shops.jsx'));
const Offers = lazy(() => import('./pages/offers.jsx'));
const Login = lazy(() => import('./pages/login.jsx'));
const ProductDetails = lazy(() => import('./pages/ProductDetails.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const Favorites = lazy(() => import('./pages/Favorites.jsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));
const Success = lazy(() => import('./pages/Success.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const About = lazy(() => import('./pages/About.jsx'));

// Shown while a lazily-loaded route chunk is being fetched.
function PageLoader() {
  return (
    <div className="min-h-screen bg-midnight flex items-center justify-center">
      <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-gray-800 border-t-electric rounded-full animate-spin"></div>
    </div>
  );
}

function App() {
  return (
    // Wrap the entire app so the "Favorites" memory works everywhere
    <FavoritesProvider>
      <div className="min-h-screen bg-midnight font-sans selection:bg-electric selection:text-midnight">
        <Navbar />
        <CartMenu />

        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Storefront Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shops />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/favorites" element={<Favorites />} />

            {/* Authentication */}
            <Route path="/login" element={<Login />} />

            {/* Secured Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute requireAdmin={false}>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route path="/success" element={<Success />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Suspense>
      </div>
    </FavoritesProvider>
  );
}

export default App;