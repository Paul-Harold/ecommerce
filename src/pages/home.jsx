// src/pages/home.jsx
export default function Home() {
  return (
    <div className="min-h-screen bg-midnight text-white">
      
      {/* 1. HERO SECTION WITH STICKY PARALLAX */}
      <div 
        className="relative h-screen flex flex-col items-center justify-center p-6 bg-fixed bg-center bg-cover"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1598550476439-6847785fcea6?q=80&w=2070')" }}
      >
        {/* Dark Overlay (Protects text readability) */}
        <div className="absolute inset-0 bg-[#0B0D10]/70 z-0"></div>

        {/* Hero Content */}
        <div className="text-center max-w-4xl relative z-10 mt-[-5vh]">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-widest mb-6">
            Dominate the <span className="text-electric">Game</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto drop-shadow-lg">
            Premium gaming peripherals built for precision, speed, and absolute control. Upgrade your setup with Midnight gear.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="bg-electric text-midnight font-bold py-4 px-10 rounded hover:bg-white hover:shadow-[0_0_20px_#40E0FF] transition-all duration-300 uppercase tracking-wider">
              Shop Gear
            </button>
            <button className="border border-gray-400 backdrop-blur-sm bg-black/30 text-white font-bold py-4 px-10 rounded hover:border-electric hover:text-electric transition-all duration-300 uppercase tracking-wider">
              View Offers
            </button>
          </div>
        </div>
      </div>

      {/* 2. TRUST BADGES (Scrolling Content) */}
      <div className="relative z-20 bg-midnight w-full flex justify-center py-20 px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 text-center border-t border-gray-800 pt-12 w-full max-w-5xl">
          <div className="flex flex-col items-center group">
            <p className="text-ion text-4xl mb-3 group-hover:scale-110 transition-transform">🚀</p>
            <p className="text-white font-bold text-lg">Lightning Shipping</p>
            <p className="text-gray-500 text-sm mt-1">Dispatched within 24h</p>
          </div>
          <div className="flex flex-col items-center group">
            <p className="text-ion text-4xl mb-3 group-hover:scale-110 transition-transform">🛡️</p>
            <p className="text-white font-bold text-lg">2-Year Warranty</p>
            <p className="text-gray-500 text-sm mt-1">Zero questions asked</p>
          </div>
          <div className="flex flex-col items-center group">
            <p className="text-ion text-4xl mb-3 group-hover:scale-110 transition-transform">🎧</p>
            <p className="text-white font-bold text-lg">24/7 Pro Support</p>
            <p className="text-gray-500 text-sm mt-1">Expert technical assistance</p>
          </div>
        </div>
      </div>
      
      {/* 3. PROMOTION SECTION */}
      {/* 3. PROMOTION SECTION */}
      <div className="relative z-20 bg-midnight w-full py-24 px-6 border-t border-gray-900">
        {/* Added 'group' class here so hovering anywhere on the banner triggers the image effect */}
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-2xl overflow-hidden flex flex-col md:flex-row items-stretch shadow-2xl group">
          
         {/* Promo Text Area */}
          <div className="p-10 md:p-16 md:w-1/2 flex flex-col justify-center items-start text-left relative z-10">
            <div className="inline-block px-4 py-1 bg-electric/10 text-electric border border-electric/30 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              Featured Product
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-widest mb-4">
              Phantom <span className="text-electric">Wireless</span>
            </h2>
            <p className="text-gray-400 mb-8 max-w-md text-lg">
              Experience the ultra-lightweight 45g esports mouse. Engineered with precision switches and zero-latency wireless technology for ultimate control.
            </p>
            <button className="bg-white text-midnight font-bold py-4 px-10 rounded hover:bg-electric hover:shadow-[0_0_20px_#40E0FF] transition-all duration-300 uppercase tracking-wider">
              Shop Now
            </button>
          </div>

          {/* Promo Image Area */}
        {/* Promo Image AreaWrapper (Needed for clipping the zoom) */}
          <div className="md:w-1/2 h-80 md:h-auto min-h-[400px] w-full relative overflow-hidden">
             {/* The actual image div that zooms */}
            <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=1200')" }}
            ></div>
             {/* Gradient fade - sits on top of the zoomed image */}
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-transparent to-gray-900/80 w-full h-full z-10"></div>
        </div>
        </div>
      </div>

      {/* 4. SHOP BY CATEGORY GRID */}
      <div className="relative z-20 bg-midnight w-full py-24 px-6 border-t border-gray-900">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-widest">
                Upgrade Your <span className="text-electric">Arsenal</span>
              </h2>
              <p className="text-gray-400 mt-4 text-lg">Precision-engineered gear for every playstyle.</p>
            </div>
            <button className="hidden md:block text-white font-bold uppercase tracking-widest border-b-2 border-electric pb-1 hover:text-electric transition-colors">
              View All Gear
            </button>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px]">
            
            {/* Category 1: Keyboards (Spans 2 columns on desktop) */}
            <div className="group relative overflow-hidden rounded-xl lg:col-span-2 cursor-pointer shadow-lg">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=1200')" }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D10] via-[#0B0D10]/50 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-500"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h3 className="text-3xl font-black uppercase tracking-widest text-white mb-2">Keyboards</h3>
                {/* This text slides up on hover */}
                <p className="text-electric font-bold uppercase tracking-wider text-sm flex items-center gap-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  Shop Now <span className="text-xl">→</span>
                </p>
              </div>
            </div>

            {/* Category 2: Mice */}
            <div className="group relative overflow-hidden rounded-xl cursor-pointer shadow-lg">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1625842268584-8f3296236761?q=80&w=800')" }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D10] via-[#0B0D10]/50 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-500"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h3 className="text-3xl font-black uppercase tracking-widest text-white mb-2">Mice</h3>
                <p className="text-electric font-bold uppercase tracking-wider text-sm flex items-center gap-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  Shop Now <span className="text-xl">→</span>
                </p>
              </div>
            </div>

            {/* Category 3: Headsets */}
            <div className="group relative overflow-hidden rounded-xl cursor-pointer shadow-lg">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800')" }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D10] via-[#0B0D10]/50 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-500"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h3 className="text-3xl font-black uppercase tracking-widest text-white mb-2">Audio</h3>
                <p className="text-electric font-bold uppercase tracking-wider text-sm flex items-center gap-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  Shop Now <span className="text-xl">→</span>
                </p>
              </div>
            </div>

            {/* Category 4: Surfaces/Accessories (Spans 2 columns on desktop) */}
            <div className="group relative overflow-hidden rounded-xl lg:col-span-2 cursor-pointer shadow-lg">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1614624532983-4ce03382d63d?q=80&w=1200')" }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D10] via-[#0B0D10]/50 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-500"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h3 className="text-3xl font-black uppercase tracking-widest text-white mb-2">Surfaces</h3>
                <p className="text-electric font-bold uppercase tracking-wider text-sm flex items-center gap-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  Shop Now <span className="text-xl">→</span>
                </p>
              </div>
            </div>

          </div>
          
          {/* Mobile "View All" Button (Only shows on small screens) */}
          <button className="md:hidden mt-8 w-full border border-gray-600 text-white font-bold py-4 rounded hover:border-electric hover:text-electric transition-all duration-300 uppercase tracking-wider">
            View All Gear
          </button>

        </div>
      </div>

      {/* 5. TECH PILLARS */}
      <div className="bg-black w-full py-20 px-6 border-t border-gray-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center">
            <svg className="w-12 h-12 text-electric mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            <h4 className="text-xl font-black uppercase tracking-widest text-white mb-2">Zero Latency</h4>
            <p className="text-gray-500 text-sm max-w-xs">Our proprietary Slipstream wireless tech guarantees pixel-perfect registration under 1ms.</p>
          </div>
          <div className="flex flex-col items-center">
            <svg className="w-12 h-12 text-electric mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="text-xl font-black uppercase tracking-widest text-white mb-2">Tournament Grade</h4>
            <p className="text-gray-500 text-sm max-w-xs">Built with aerospace-grade aluminum and switches rated for 100 million clicks.</p>
          </div>
          <div className="flex flex-col items-center">
            <svg className="w-12 h-12 text-electric mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
            </svg>
            <h4 className="text-xl font-black uppercase tracking-widest text-white mb-2">Perfect Ergonomics</h4>
            <p className="text-gray-500 text-sm max-w-xs">Designed with biometric data to eliminate fatigue during marathon gaming sessions.</p>
          </div>
        </div>
      </div>

    {/* 6. NEWSLETTER SUBSCRIPTION */}
      <div className="bg-gradient-to-b from-black to-midnight w-full py-24 px-6 border-t border-gray-900 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-electric/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-widest mb-4">
            Unlock <span className="text-electric">10% Off</span>
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Subscribe to our newsletter for exclusive hardware drops, setup inspiration, and a discount on your first order.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="bg-gray-900 border border-gray-700 text-white px-6 py-4 rounded focus:outline-none focus:border-electric focus:ring-1 focus:ring-electric transition-all flex-grow max-w-md placeholder-gray-500"
            />
            <button className="bg-electric text-midnight font-bold py-4 px-8 rounded hover:bg-white hover:shadow-[0_0_20px_#40E0FF] transition-all duration-300 uppercase tracking-wider">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* 7. FOOTER */}
      <footer className="bg-[#050608] w-full pt-16 pb-8 px-6 border-t border-gray-900 text-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-2xl font-black tracking-widest uppercase text-white mb-6">
              Midnight<span className="text-electric">.</span>
            </h3>
            <p className="text-gray-500 mb-6">Equipping the next generation of digital athletes with uncompromising hardware.</p>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-6">Shop</h4>
            <ul className="space-y-4 text-gray-500">
              <li><a href="#" className="hover:text-electric transition-colors">Keyboards</a></li>
              <li><a href="#" className="hover:text-electric transition-colors">Mice</a></li>
              <li><a href="#" className="hover:text-electric transition-colors">Audio</a></li>
              <li><a href="#" className="hover:text-electric transition-colors">Accessories</a></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-6">Support</h4>
            <ul className="space-y-4 text-gray-500">
              <li><a href="#" className="hover:text-electric transition-colors">Warranty Info</a></li>
              <li><a href="#" className="hover:text-electric transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-6">Store</h4>
            <ul className="space-y-4 text-gray-500">
              <li><a href="#" className="hover:text-electric transition-colors">About Midnight</a></li>
              <li><a href="#" className="hover:text-electric transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-electric transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-electric transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-900 text-gray-600">
          <p>&copy; {new Date().getFullYear()} Midnight Hardware. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span className="hover:text-white cursor-pointer transition-colors">Twitter</span>
            <span className="hover:text-white cursor-pointer transition-colors">Instagram</span>
            <span className="hover:text-white cursor-pointer transition-colors">Discord</span>
          </div>
        </div>
      </footer>

    </div>
  );
}