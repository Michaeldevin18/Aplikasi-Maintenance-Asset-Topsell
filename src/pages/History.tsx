import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MaintenanceRecord } from '@/types';
import { Filter, Search, Calendar, Settings } from 'lucide-react';

export default function History() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: 'all',
    status: 'all',
  });

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('maintenance_records')
          .select(`
            *,
            asset:assets(name, code),
            technician:users(name)
          `)
          .order('maintenance_date', { ascending: false });

        if (filter.type !== 'all') {
          query = query.eq('maintenance_type', filter.type);
        }

        if (filter.status !== 'all') {
          query = query.eq('status', filter.status);
        }

        const { data, error } = await query;

        if (error) throw error;
        setRecords(data || []);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance History</h1>
          <p className="text-sm text-gray-500 mt-1">Track and filter all maintenance activities</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group">
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="appearance-none block w-full pl-4 pr-10 py-2.5 text-sm font-medium border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red rounded-xl bg-gray-50 hover:bg-white transition-colors cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="preventive">Preventive</option>
              <option value="corrective">Corrective</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 group-hover:text-brand-red transition-colors">
              <Filter className="h-4 w-4" />
            </div>
          </div>

          <div className="relative group">
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="appearance-none block w-full pl-4 pr-10 py-2.5 text-sm font-medium border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red rounded-xl bg-gray-50 hover:bg-white transition-colors cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 group-hover:text-brand-red transition-colors">
              <Filter className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
              <Search className="h-full w-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No records found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your filters or search criteria.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {records.map((record) => (
              <li key={record.id} className="group hover:bg-gray-50 transition-colors duration-200">
                <div className="px-6 py-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-brand-red font-bold text-sm">
                        {record.asset?.code?.substring(0, 2) || 'AS'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 group-hover:text-brand-red transition-colors">
                          {record.asset?.name || 'Unknown Asset'}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">
                          {record.asset?.code}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize border ${
                      record.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' : 
                      record.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                      'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {record.status?.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="pl-13 ml-13 mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center text-sm text-gray-600">
                        <Settings className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                        <span className="font-medium capitalize">{record.maintenance_type}</span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 pl-6">
                        {record.description}
                      </p>
                    </div>
                    
                    <div className="flex items-end justify-end flex-col gap-1">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                        {new Date(record.maintenance_date).toLocaleDateString(undefined, {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      {record.technician && (
                        <p className="text-xs text-gray-400">
                          Tech: {record.technician.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
