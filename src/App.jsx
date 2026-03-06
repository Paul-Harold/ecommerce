import { Routes, Route } from 'react-router-dom'; 
import Navbar from './layouts/Navbar.jsx';
import Home from './pages/home.jsx';
import Shops from './pages/shops.jsx';
import Offers from './pages/offers.jsx';
import Login from './pages/login.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import CartMenu from './components/CartMenu.jsx';
import Checkout from './pages/Checkout.jsx';
import { FavoritesProvider } from './context/FavoritesContext.jsx';
import Favorites from './pages/Favorites.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Success from './pages/Success.jsx';

function App() {
  return (
    // Wrap the entire app so the "Favorites" memory works everywhere
    <FavoritesProvider>
      <div className="min-h-screen bg-midnight font-sans selection:bg-electric selection:text-midnight">
        <Navbar />
        <CartMenu />
        
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
        </Routes>
      </div>
    </FavoritesProvider>
  );
}

export default App;