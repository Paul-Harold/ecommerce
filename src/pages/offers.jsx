// src/pages/offers.jsx
import { Link } from 'react-router-dom';

// FAKE DATABASE: Flash sale items
const flashDeals = [
    { id: 101, name: "Viper Mini", category: "Mouse", oldPrice: 49.99, newPrice: 29.99, discount: "40%", image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?q=80&w=600" },
    { id: 102, name: "Echo Studio Base", category: "Microphone", oldPrice: 149.99, newPrice: 109.99, discount: "25%", image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=600" },
    { id: 103, name: "Nova Core", category: "Headset", oldPrice: 129.99, newPrice: 89.99, discount: "30%", image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=600" },
    { id: 104, name: "GlidePad XL", category: "Surface", oldPrice: 39.99, newPrice: 19.99, discount: "50%", image: "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?q=80&w=600" },
];

export default function Offers() {
    return (
    <div className="min-h-screen bg-midnight text-white pt-10 pb-24 px-6">
        <div className="max-w-[1400px] mx-auto">
        
        {/* PAGE HEADER */}
        <div className="mb-12 border-b border-gray-800 pb-8 flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest mb-4">
                Active <span className="text-ion">Loot Drops</span>
            </h1>
            <p className="text-gray-400 text-lg">Limited quantities. Once they're gone, they're gone.</p>
            </div>
            <div className="flex items-center gap-3 bg-gray-900 px-6 py-3 rounded-full border border-gray-800">
                <span className="w-3 h-3 bg-ion rounded-full animate-pulse"></span>
                <span className="text-white font-bold uppercase tracking-widest text-sm">Drops Reset In: 12h 45m</span>
            </div>
        </div>

        {/* 1. THE MEGA DROP BUNDLE */}
        <div className="relative w-full bg-gradient-to-r from-gray-900 to-[#0B0D10] border border-gray-800 rounded-2xl overflow-hidden flex flex-col md:flex-row items-stretch shadow-[0_0_30px_rgba(182,255,59,0.05)] mb-20 group cursor-pointer">

          {/* Bundle Text Area */}
            <div className="p-10 md:p-16 md:w-1/2 flex flex-col justify-center items-start text-left relative z-10">
            <div className="inline-block px-4 py-1 bg-ion/10 text-ion border border-ion/30 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                Pro Setup Bundle
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-widest mb-4 leading-tight">
                The <span className="text-ion">Vanguard</span> Collection
            </h2>
            <p className="text-gray-400 mb-8 max-w-md text-lg">
                Upgrade your entire battlestation instantly. Includes the Apex Pro TKL Keyboard, Phantom Wireless Mouse, and a free GlidePad XL. 
            </p>
            
            {/* Pricing block */}
            <div className="flex items-center gap-4 mb-8">
                <span className="text-4xl font-black text-white">$249.99</span>
                <span className="text-xl text-gray-600 line-through font-bold">$359.97</span>
                <span className="bg-ion text-midnight font-black px-3 py-1 rounded text-sm tracking-widest uppercase">Save $110</span>
            </div>

            <button className="bg-ion text-midnight font-bold py-4 px-10 rounded hover:bg-white hover:shadow-[0_0_20px_#B6FF3B] transition-all duration-300 uppercase tracking-wider">
                Claim Bundle
            </button>
            </div>

          {/* Bundle Image Area */}
            <div className="md:w-1/2 min-h-[400px] w-full relative overflow-hidden">
                <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=1200')" }}
            ></div>
             {/* Gradient fade to blend image into background */}
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-transparent to-gray-900/90 w-full h-full z-10"></div>
            </div>
        </div>

        {/* 2. FLASH SALES GRID */}
        <h3 className="text-2xl font-black uppercase tracking-widest mb-8 flex items-center gap-4">
            Flash Deals <span className="h-[2px] w-12 bg-gray-800"></span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {flashDeals.map((item) => (
            <div key={item.id} className="group relative bg-[#0f1115] border border-gray-800 rounded-xl overflow-hidden hover:border-ion transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(182,255,59,0.15)] cursor-pointer shadow-lg">
                
              {/* Discount Badge */}
                <div className="absolute top-4 left-4 z-20 bg-ion text-midnight font-black px-3 py-1 rounded text-xs tracking-widest uppercase shadow-lg">
                {item.discount} OFF
                </div>

              {/* Product Image Box */}
                <div className="relative h-64 bg-gray-900 overflow-hidden">
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${item.image})` }}
                ></div>
                
                {/* Quick Add Button */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                    <button className="bg-ion text-midnight font-bold py-3 px-8 rounded hover:bg-white transition-all duration-300 uppercase tracking-wider transform translate-y-4 group-hover:translate-y-0 pointer-events-auto">
                    Add to Cart
                    </button>
                </div>
                </div>

              {/* Product Details */}
                <div className="p-6">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">{item.category}</p>
                <h3 className="text-xl font-bold text-white mb-3">{item.name}</h3>
                
                <div className="flex items-end gap-3">
                    <p className="text-ion font-black text-xl">${item.newPrice}</p>
                    <p className="text-gray-600 line-through font-bold text-sm mb-[2px]">${item.oldPrice}</p>
                </div>
                </div>

            </div>
            ))}
        </div>

        </div>
    </div>
    );
}