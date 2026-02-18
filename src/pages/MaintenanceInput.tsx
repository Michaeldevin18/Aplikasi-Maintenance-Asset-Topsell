import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, Camera, X } from 'lucide-react';
import { takePhotoFile } from '@/lib/camera';

export default function MaintenanceInput() {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [takingPhoto, setTakingPhoto] = useState(false);
  const [assetName, setAssetName] = useState('');
  
  const [formData, setFormData] = useState({
    maintenance_type: 'preventive',
    description: '',
    maintenance_date: new Date().toISOString().split('T')[0],
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  useEffect(() => {
    const fetchAsset = async () => {
      if (!assetId) return;
      const { data } = await supabase.from('assets').select('name').eq('id', assetId).single();
      if (data) setAssetName(data.name);
    };
    fetchAsset();
  }, [assetId]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files);
      setPhotos([...photos, ...newPhotos]);
      
      const newPreviews = newPhotos.map(file => URL.createObjectURL(file));
      setPhotoPreviews([...photoPreviews, ...newPreviews]);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);

    const newPreviews = [...photoPreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPhotoPreviews(newPreviews);
  };

  const handleTakePhoto = async () => {
    if (takingPhoto) return;
    setTakingPhoto(true);
    try {
      const file = await takePhotoFile();
      setPhotos((prev) => [...prev, file]);
      setPhotoPreviews((prev) => [...prev, URL.createObjectURL(file)]);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Gagal membuka kamera';
      alert(msg);
    } finally {
      setTakingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !assetId) return;

    setLoading(true);
    try {
      // 1. Create maintenance record
      const { data: record, error: recordError } = await supabase
        .from('maintenance_records')
        .insert({
          asset_id: assetId,
          technician_id: user.id,
          maintenance_type: formData.maintenance_type,
          description: formData.description,
          maintenance_date: formData.maintenance_date,
          status: 'pending'
        })
        .select()
        .single();

      if (recordError) throw recordError;

      // 2. Upload photos if any
      if (photos.length > 0) {
        for (const photo of photos) {
          const fileExt = photo.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${record.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('maintenance-photos')
            .upload(filePath, photo);

          if (uploadError) throw uploadError;

          // 3. Create photo record
          const { data: publicUrlData } = supabase.storage
            .from('maintenance-photos')
            .getPublicUrl(filePath);

          await supabase.from('asset_photos').insert({
            asset_id: assetId,
            photo_url: publicUrlData.publicUrl,
            photo_type: 'maintenance'
          });
        }
      }

      navigate(`/asset/${assetId}`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error submitting maintenance:', error);
      alert('Error submitting maintenance: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <Link to={`/asset/${assetId}`} className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Maintenance</h1>
            <p className="text-sm text-gray-500 mt-1">Recording maintenance for: <span className="font-medium text-gray-900">{assetName}</span></p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 space-y-8">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Maintenance Details</h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type</label>
              <select
                value={formData.maintenance_type}
                onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })}
                className="block w-full pl-3 pr-10 py-2.5 text-base border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red sm:text-sm rounded-xl bg-gray-50 transition-colors"
              >
                <option value="preventive">Preventive</option>
                <option value="corrective">Corrective</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Performed</label>
              <input
                type="date"
                required
                value={formData.maintenance_date}
                onChange={(e) => setFormData({ ...formData, maintenance_date: e.target.value })}
                className="block w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red sm:text-sm bg-gray-50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="block w-full border border-gray-200 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red sm:text-sm bg-gray-50 transition-colors resize-none"
              placeholder="Describe the issue found, actions taken, and any parts replaced..."
            />
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Evidence Photos</h3>
          
          <div>
            <div className="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-gray-200 border-dashed rounded-xl hover:border-brand-red transition-colors bg-gray-50 hover:bg-gray-50/50">
              <div className="space-y-2 text-center">
                <div className="mx-auto h-12 w-12 text-gray-400 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Camera className="h-6 w-6" />
                </div>
                <div className="flex text-sm text-gray-600 justify-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-medium text-brand-red hover:text-red-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-red"
                  >
                    <span>Upload photos</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" capture="environment" onChange={handlePhotoChange} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleTakePhoto}
                    disabled={takingPhoto}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-red text-white font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Camera className="h-4 w-4" />
                    {takingPhoto ? 'Membuka kamera...' : 'Ambil Foto'}
                  </button>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>

          {photoPreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {photoPreviews.map((preview, index) => (
                <div key={index} className="relative group aspect-square rounded-xl overflow-hidden shadow-sm border border-gray-200">
                  <img src={preview} alt={`Preview ${index}`} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-full p-1.5 shadow-sm hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 group-hover:scale-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="py-2.5 px-5 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2.5 px-5 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-brand-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : 'Save Record'}
          </button>
        </div>
      </form>
    </div>
  );
}
