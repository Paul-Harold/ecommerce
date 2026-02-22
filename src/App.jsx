import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './layouts/Navbar.jsx';
import Home from './pages/home.jsx';
import Shops from './pages/shops.jsx';
import Offers from './pages/offers.jsx';
import Login from './pages/login.jsx';
import Admin from './pages/admin.jsx';  
import ProductDetails from './pages/ProductDetails.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-midnight font-sans selection:bg-electric selection:text-midnight">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shops />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/login" element={<Login />} />
          <Route path="/shop" element={<Shops />} />
          <Route path="/product/:id" element={<ProductDetails />} /> 
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <Admin />
              </ProtectedRoute>
            } 
          />
          {/* We will uncomment these once the files are created */}
          {/* <Route path="/offers" element={<Offers />} /> */}
        </Routes>

      </div>
    </Router>
  );
}

export default App;