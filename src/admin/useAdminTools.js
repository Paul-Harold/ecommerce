import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../libs/supabase.js';

/**
 * Shared toast/banner state for admin tabs.
 * Replaces the copy-pasted `useState({type,text})` + manual setTimeout
 * auto-dismiss that previously lived in every single tab.
 */
export function useAutoMessage(timeout = 3000) {
  const [message, setMessage] = useState({ type: '', text: '' });
  const timer = useRef(null);

  const show = useCallback((type, text) => {
    setMessage({ type, text });
    if (timer.current) clearTimeout(timer.current);
    if (timeout) {
      timer.current = setTimeout(() => setMessage({ type: '', text: '' }), timeout);
    }
  }, [timeout]);

  // Clean up the pending timeout if the tab unmounts mid-message.
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return {
    message,
    showSuccess: useCallback((text) => show('success', text), [show]),
    showError: useCallback((text) => show('error', text), [show]),
    clear: useCallback(() => {
      if (timer.current) clearTimeout(timer.current);
      setMessage({ type: '', text: '' });
    }, []),
  };
}

/**
 * Shared Supabase Storage image upload.
 * Previously duplicated verbatim in ProductsTab, BundlesTab and PagesTab.
 * Returns the public URL (or throws) so each caller decides where to store it.
 */
export function useImageUpload(bucket = 'assets', folder = 'images') {
  const [uploading, setUploading] = useState(false);

  const uploadImage = useCallback(async (file) => {
    if (!file) return null;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return data.publicUrl;
    } finally {
      setUploading(false);
    }
  }, [bucket, folder]);

  return { uploading, uploadImage };
}
