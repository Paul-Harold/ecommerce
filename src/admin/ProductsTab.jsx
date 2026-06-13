import React, { useState, useEffect } from 'react';
import { supabase } from '../libs/supabase.js';
import { useAutoMessage, useImageUpload } from './useAdminTools.js';
import { AdminMessage } from './AdminUI.jsx';

export default function ProductsTab() {
  const emptyProduct = { name: '', category: 'Mouse', price: '', description: '', image: '' };

  const [productsList, setProductsList] = useState([]);
  const [newProduct, setNewProduct] = useState(emptyProduct);
  const [editProductId, setEditProductId] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { message, showSuccess, showError } = useAutoMessage();
  const { uploading: isUploading, uploadImage } = useImageUpload();

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setProductsList(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const url = await uploadImage(file);
      setNewProduct(prev => ({ ...prev, image: url }));
      showSuccess('Image uploaded successfully.');
    } catch {
      showError('Image upload failed.');
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    if (!newProduct.image) {
      showError('Please upload a product image before saving.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { 
        name: newProduct.name, 
        category: newProduct.category, 
        price: parseFloat(newProduct.price), 
        description: newProduct.description, 
        image: newProduct.image
      };
      
      if (editProductId) {
        const { error } = await supabase.from('products').update(payload).eq('id', editProductId);
        if (error) throw error;
        showSuccess('Product updated successfully!');
      } else {
        const insertPayload = { ...payload, discount_percent: 0, expires_at: null };
        const { error } = await supabase.from('products').insert([insertPayload]);
        if (error) throw error;
        showSuccess('Product added successfully!');
      }

      setNewProduct(emptyProduct);
      setEditProductId(null);
      fetchProducts(); // Refresh the list locally
    } catch {
      showError('Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product permanently?")) return;
    try {
      await supabase.from('products').delete().eq('id', id);
      fetchProducts();
      showSuccess('Product deleted.');
    } catch {
      showError('Failed to delete.');
    }
  };

  const handleEditProduct = (product) => {
    setNewProduct({ 
      name: product.name, 
      category: product.category, 
      price: product.price, 
      description: product.description, 
      image: product.image 
    });
    setEditProductId(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="animate-fadeIn">
      <AdminMessage message={message} />

      <div className="flex justify-between items-center mb-6 lg:mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-2xl lg:text-3xl font-bold uppercase tracking-widest">{editProductId ? 'Edit Product' : 'Add Product'}</h1>
        {editProductId && (
          <button onClick={() => { setEditProductId(null); setNewProduct(emptyProduct); }} className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white bg-gray-900 px-3 py-1.5 rounded">Cancel Edit</button>
        )}
      </div>
      
      <form onSubmit={handleProductSubmit} className="bg-[#0f1115] border border-gray-800 p-5 lg:p-8 rounded-xl space-y-4 lg:space-y-6 mb-8 lg:mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div>
            <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Product Name</label>
            <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-white transition-colors text-xs lg:text-sm" />
          </div>
          <div>
            <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Category</label>
            <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-white transition-colors cursor-pointer text-xs lg:text-sm">
              <option value="Mouse">Mouse</option>
              <option value="Keyboard">Keyboard</option>
              <option value="Headset">Headset</option>
              <option value="Surfaces">Surfaces</option>
              <option value="Microphones">Microphones</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Price (PHP)</label>
            <input required type="number" step="0.01" min="0" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-white transition-colors text-xs lg:text-sm" />
          </div>
          
          <div>
            <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Product Image Upload</label>
            <input type="file" accept="image/*" onChange={handleFileUpload} disabled={isUploading} className="block w-full text-[10px] lg:text-xs text-gray-400 file:mr-2 lg:file:mr-4 file:py-2 lg:file:py-3 file:px-3 lg:file:px-4 file:rounded file:border-0 file:font-bold file:uppercase file:tracking-widest file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer mb-2" />
            {newProduct.image && (
              <div className="h-24 lg:h-32 w-32 lg:w-48 rounded border border-gray-800 relative bg-gray-900">
                <div className="absolute inset-0 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${newProduct.image})` }}></div>
              </div>
            )}
          </div>
          
        </div>
        <div>
          <label className="block text-gray-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1 lg:mb-2">Description</label>
          <textarea required rows="4" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded px-3 lg:px-4 py-2.5 lg:py-3 text-white focus:outline-none focus:border-white transition-colors resize-none text-xs lg:text-sm"></textarea>
        </div>
        <button type="submit" disabled={isSubmitting || isUploading} className={`w-full font-bold uppercase tracking-widest py-3 lg:py-4 rounded transition-all duration-300 mt-2 lg:mt-4 text-xs lg:text-sm ${isSubmitting || isUploading ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200'}`}>
          {editProductId ? 'Save Changes' : 'Add Product'}
        </button>
      </form>

      <h2 className="text-lg lg:text-xl font-bold uppercase tracking-widest mb-4 lg:mb-6 border-b border-gray-800 pb-2 text-gray-400">Inventory Roster</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        {productsList.map(p => (
          <div key={p.id} className="bg-gray-900 border border-gray-800 p-3 lg:p-4 rounded flex items-center justify-between">
            <div className="flex items-center gap-3 w-full overflow-hidden">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-black rounded p-1 border border-gray-800 shrink-0">
                <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <span className="text-[8px] lg:text-[10px] text-gray-500 font-bold uppercase tracking-widest block">{p.category}</span>
                <p className="font-bold text-xs lg:text-sm truncate w-full text-white">{p.name}</p>
                <p className="text-ion text-[10px] lg:text-xs">₱{p.price}</p>
              </div>
            </div>
            <div className="flex gap-1 lg:gap-2 shrink-0 flex-col sm:flex-row">
              <button onClick={() => handleEditProduct(p)} className="text-[10px] lg:text-xs bg-gray-800 hover:bg-white hover:text-black px-2 lg:px-3 py-1 lg:py-1.5 rounded transition-colors font-bold uppercase tracking-widest">Edit</button>
              <button onClick={() => handleDeleteProduct(p.id)} className="text-[10px] lg:text-xs bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-500 hover:text-white px-2 lg:px-3 py-1 lg:py-1.5 rounded transition-colors font-bold uppercase tracking-widest">Del</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}