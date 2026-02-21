import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './layouts/Navbar.jsx';
import Home from './pages/home.jsx';
import Shops from './pages/shops.jsx';
import Offers from './pages/offers.jsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-midnight font-sans selection:bg-electric selection:text-midnight">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shops />} />
          <Route path="/offers" element={<Offers />} />
          {/* We will uncomment these once the files are created */}
          {/* <Route path="/offers" element={<Offers />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;