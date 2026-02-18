import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Asset, MaintenanceRecord } from '@/types';
import { 
  ArrowLeft, 
  Settings, 
  Calendar, 
  MapPin, 
  Tag, 
  Activity, 
  FileText,
  Plus
} from 'lucide-react';

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [history, setHistory] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');

  useEffect(() => {
    const fetchAssetData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        // Fetch asset details
        const { data: assetData, error: assetError } = await supabase
          .from('assets')
          .select('*')
          .eq('id', id)
          .single();

        if (assetError) throw assetError;
        setAsset(assetData);

        // Fetch maintenance history
        const { data: historyData, error: historyError } = await supabase
          .from('maintenance_records')
          .select('*, technician:users(name)')
          .eq('asset_id', id)
          .order('maintenance_date', { ascending: false });

        if (historyError) throw historyError;
        setHistory(historyData || []);

      } catch (error) {
        console.error('Error fetching asset data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssetData();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <Activity className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Asset not found</h3>
        <p className="text-gray-500 mt-1">The asset you're looking for doesn't exist or you don't have permission to view it.</p>
        <Link to="/dashboard" className="mt-4 text-brand-red hover:text-red-700 font-medium">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link 
              to="/dashboard" 
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{asset.name}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                  asset.status === 'active' ? 'bg-green-100 text-green-700' : 
                  asset.status === 'maintenance' ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {asset.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 font-mono mt-1">{asset.code}</p>
            </div>
          </div>
          <Link
            to={`/maintenance/new/${asset.id}`}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-brand-red text-white text-sm font-medium rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red transition-colors shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Maintenance
          </Link>
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-gray-100">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'details'
                  ? 'border-brand-red text-brand-red'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Details & Specs
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'border-brand-red text-brand-red'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Maintenance History
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="transition-all duration-300 ease-in-out">
        {activeTab === 'details' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-x-12">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">General Information</h3>
                
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-red-50 rounded-lg text-brand-red">
                    <Tag className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Category</p>
                    <p className="mt-1 text-base text-gray-900 font-medium">{asset.category}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-red-50 rounded-lg text-brand-red">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p className="mt-1 text-base text-gray-900 font-medium">{asset.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-red-50 rounded-lg text-brand-red">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Purchase Date</p>
                    <p className="mt-1 text-base text-gray-900 font-medium">
                      {asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Technical Specifications</h3>
                
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-2">Specifications</p>
                    {asset.specification && Object.keys(asset.specification).length > 0 ? (
                      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                        {Object.entries(asset.specification).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center text-sm border-b border-gray-200 last:border-0 pb-2 last:pb-0">
                            <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                            <span className="font-medium text-gray-900">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No specifications available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {history.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No maintenance history</h3>
                <p className="text-gray-500 mt-1">There are no recorded maintenance activities for this asset.</p>
                <Link
                  to={`/maintenance/new/${asset.id}`}
                  className="mt-4 inline-flex items-center text-brand-red hover:text-red-700 font-medium"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Create first record
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {history.map((record) => (
                  <li key={record.id} className="group p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                          record.maintenance_type === 'preventive' ? 'bg-red-50 text-brand-red' : 'bg-orange-100 text-orange-600'
                        }`}>
                          <Settings className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 capitalize flex items-center gap-2">
                            {record.maintenance_type} Maintenance
                            <span className="text-xs font-normal text-gray-500">• {new Date(record.maintenance_date).toLocaleDateString()}</span>
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {record.description}
                          </p>
                          {record.technician && (
                            <p className="text-xs text-gray-400 mt-1">
                              Technician: {record.technician.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pl-14 sm:pl-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${
                          record.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' : 
                          record.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                          'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {record.status?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
