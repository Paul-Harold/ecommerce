import { useState } from 'react';
import { supabase } from '../libs/supabase.js';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const navigate = useNavigate();

  // Form States
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Mouse');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState(null);
  
  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Logout Function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Upload Function
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !price || !file) {
      setMessage('Error: Please fill out all fields and select an image.');
      return;
    }

    setIsSubmitting(true);
    setMessage('Uploading image to secure storage...');

    try {
      // 1. Upload the image file
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`; 
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Get the public URL
      setMessage('Image uploaded! Saving product to database...');
      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      const imageUrl = publicUrlData.publicUrl;

      // 3. Save everything to the database
      const { error: dbError } = await supabase
        .from('products')
        .insert([
          { 
            name: name, 
            category: category, 
            price: parseFloat(price), 
            image: imageUrl 
          }
        ]);

      if (dbError) throw dbError;

      // Success! Reset form.
      setMessage('Success! Product added to the Arsenal.');
      setName('');
      setPrice('');
      setFile(null);
      document.getElementById('image-upload').value = ''; 

    } catch (error) {
      console.error(error);
      setMessage(`Failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight text-white pt-10 pb-24 px-6">
      <div className="max-w-2xl mx-auto bg-[#0f1115] border border-gray-800 rounded-xl p-8 shadow-2xl relative">
        
        {/* Logout Button (Top Right) */}
        <button 
          onClick={handleLogout}
          className="absolute top-8 right-8 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-white transition-colors"
        >
          Disconnect
        </button>

        <h1 className="text-3xl font-black uppercase tracking-widest mb-2 border-b border-gray-800 pb-4">
          Command <span className="text-electric">Center</span>
        </h1>
        <p className="text-gray-400 mb-8 text-sm uppercase tracking-wider">Add new gear to the database</p>

        {/* Status Message Display */}
        {message && (
          <div className={`p-4 mb-6 rounded font-bold tracking-wide text-sm ${message.includes('Success') ? 'bg-ion/20 text-ion border border-ion/50' : message.includes('Error') || message.includes('Failed') ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-electric/20 text-electric border border-electric/50'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Product Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-electric focus:ring-1 focus:ring-electric transition-colors"
              placeholder="e.g. Omen Reactor"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-electric focus:ring-1 focus:ring-electric transition-colors cursor-pointer"
              >
                <option value="Mouse">Mouse</option>
                <option value="Keyboard">Keyboard</option>
                <option value="Headset">Headset</option>
                <option value="Microphones">Microphones</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Price (USD)</label>
              <input 
                type="number" 
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-electric focus:ring-1 focus:ring-electric transition-colors"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Product Image</label>
            <input 
              id="image-upload"
              type="file" 
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-electric transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-electric file:text-midnight hover:file:bg-white cursor-pointer"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full font-bold py-4 rounded uppercase tracking-widest transition-all duration-300 ${
              isSubmitting 
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
              : 'bg-electric text-midnight hover:bg-white hover:shadow-[0_0_20px_#40E0FF]'
            }`}
          >
            {isSubmitting ? 'Transmitting...' : 'Deploy Product'}
          </button>
        </form>
      </div>
    </div>
  );
}