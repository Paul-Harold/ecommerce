import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-[#050608] text-white pt-16 md:pt-20 pb-24 px-4 sm:px-6 flex flex-col">
      <div className="max-w-[1000px] mx-auto flex-1 w-full">
        
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16 animate-fadeIn">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-900 border border-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
            <svg className="w-8 h-8 md:w-10 md:h-10 text-electric" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-widest text-white mb-3 md:mb-4">
            About <span className="text-electric">Midnight</span>
          </h1>
          <p className="text-gray-400 font-mono text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
            A high-performance e-commerce architecture simulation.
          </p>
        </div>

        {/* The Reality Check / Disclaimer */}
        <div className="bg-electric/10 border border-electric/30 rounded-2xl p-6 sm:p-8 md:p-10 mb-10 md:mb-12 relative overflow-hidden group hover:border-electric/50 transition-colors animate-fadeIn" style={{ animationDelay: '100ms' }}>
          <div className="absolute top-0 left-0 w-1 h-full bg-electric"></div>
          <h2 className="text-lg md:text-xl font-black uppercase tracking-widest text-white mb-4 flex items-center gap-2 md:gap-3">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-electric shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Project Disclaimer
          </h2>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-4 md:mb-6">
            Midnight Hardware is a <strong>concept application and developer portfolio project</strong>. It is not a real retail store, and no actual hardware is being sold or shipped. 
          </p>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed">
            This platform was engineered by <strong>Paul Harold Batiles</strong>, a Front-end Developer specializing in React, to demonstrate proficiency in building modern, scalable, and secure web applications with a focus on immersive user interfaces and complex state management.
          </p>
        </div>

        {/* Tech Stack Grid */}
        <div className="mb-12 md:mb-16 animate-fadeIn" style={{ animationDelay: '200ms' }}>
          <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-gray-500 mb-4 md:mb-6 border-b border-gray-800 pb-2">System Architecture</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            
            <div className="bg-[#0f1115] border border-gray-800 p-4 md:p-6 rounded-xl text-center hover:border-gray-600 transition-colors">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#0a2540] rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 text-[#61DAFB]">
                <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22.5A10.5 10.5 0 1 1 22.5 12 10.5 10.5 0 0 1 12 22.5Zm0-19.5a9 9 0 1 0 9 9 9 9 0 0 0-9-9Z"/><path d="M12 15.75a3.75 3.75 0 1 1 3.75-3.75 3.75 3.75 0 0 1-3.75 3.75Zm0-6a2.25 2.25 0 1 0 2.25 2.25A2.25 2.25 0 0 0 12 9.75Z"/><path d="M12 20.25a8.25 8.25 0 1 1 8.25-8.25 8.25 8.25 0 0 1-8.25 8.25Zm0-15a6.75 6.75 0 1 0 6.75 6.75A6.75 6.75 0 0 0 12 5.25Z"/></svg>
              </div>
              <h4 className="font-bold text-white text-sm md:text-base mb-1">React 19</h4>
              <p className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest font-mono">Core Engine</p>
            </div>

            <div className="bg-[#0f1115] border border-gray-800 p-4 md:p-6 rounded-xl text-center hover:border-gray-600 transition-colors">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#0c1e29] rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 text-[#38B2AC]">
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>
              </div>
              <h4 className="font-bold text-white text-sm md:text-base mb-1">Tailwind CSS</h4>
              <p className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest font-mono">Styling</p>
            </div>

            <div className="bg-[#0f1115] border border-gray-800 p-4 md:p-6 rounded-xl text-center hover:border-gray-600 transition-colors">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#1c2e26] rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 text-[#3ECF8E]">
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M21.362 9.354H12V2.646a.352.352 0 00-.6-.252L2.046 11.646a.35.35 0 00.25.6h9.354v6.708a.352.352 0 00.6.252l9.354-9.252a.35.35 0 00-.242-.6z"/></svg>
              </div>
              <h4 className="font-bold text-white text-sm md:text-base mb-1">Supabase</h4>
              <p className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest font-mono">Backend & Auth</p>
            </div>

            <div className="bg-[#0f1115] border border-gray-800 p-4 md:p-6 rounded-xl text-center hover:border-gray-600 transition-colors">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#2d1b2e] rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 text-[#BD34FE]">
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.062 5.92L12.44 1.352a1 1 0 0 0-.88 0L1.938 5.92A1 1 0 0 0 1.5 6.824v10.352a1 1 0 0 0 .438.904l9.622 4.568a1 1 0 0 0 .88 0l9.622-4.568a1 1 0 0 0 .438-.904V6.824a1 1 0 0 0-.438-.904ZM12 20.3l-8.5-4.037V8.127l8.5 4.037v8.136Zm1-8.136-8.5-4.037 8.5-4.036 8.5 4.036-8.5 4.037Zm0 8.136v-8.136l8.5-4.037v8.135L13 20.3Z"/></svg>
              </div>
              <h4 className="font-bold text-white text-sm md:text-base mb-1">Vite</h4>
              <p className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest font-mono">Build Tool</p>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="bg-[#0B0D10] border border-gray-800 rounded-2xl p-6 md:p-8 animate-fadeIn" style={{ animationDelay: '300ms' }}>
          <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-gray-500 mb-4 md:mb-6 border-b border-gray-800 pb-2">Key Implementations</h3>
          <ul className="space-y-4 md:space-y-5">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-electric shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <div>
                <p className="font-bold text-white text-sm md:text-base">Custom Global State Management</p>
                <p className="text-gray-500 text-xs md:text-sm mt-1">Engineered complex Cart and Favorites contexts that persist via LocalStorage, enabling seamless cross-page interactions without database spam.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-electric shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <div>
                <p className="font-bold text-white text-sm md:text-base">Dynamic Supabase Integration</p>
                <p className="text-gray-500 text-xs md:text-sm mt-1">Full CRUD implementation across secure routes. Live search with query debouncing, real-time inventory checks, and protected Admin dashboards.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-electric shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <div>
                <p className="font-bold text-white text-sm md:text-base">Secure Authentication Loop</p>
                <p className="text-gray-500 text-xs md:text-sm mt-1">Utilized Supabase Auth for user tracking, ensuring secure checkout flows and personalized user dashboards based on verified session states.</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="mt-10 md:mt-12 text-center animate-fadeIn" style={{ animationDelay: '400ms' }}>
           <Link to="/shop" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-midnight font-bold uppercase tracking-widest px-8 py-4 rounded hover:bg-electric transition-colors shadow-lg">
             Proceed
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
           </Link>
        </div>

      </div>
    </div>
  );
}