
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Scan, ClipboardList, AlertTriangle, CheckCircle, ArrowRight, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface DashboardStats {
  totalAssets: number;
  pendingMaintenance: number;
  completedToday: number;
}

interface ActivityLog {
  id: string;
  asset_code: string;
  maintenance_type: string;
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAssets: 0,
    pendingMaintenance: 0,
    completedToday: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch total assets
      const { count: assetsCount } = await supabase
        .from('assets')
        .select('*', { count: 'exact', head: true });

      // Fetch pending maintenance
      const { count: pendingCount } = await supabase
        .from('maintenance_records')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch completed today
      const today = new Date().toISOString().split('T')[0];
      const { count: completedCount } = await supabase
        .from('maintenance_records')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('completion_date', today);

      // Fetch recent activity
      const { data: activityData } = await supabase
        .from('maintenance_records')
        .select(`
          id,
          maintenance_type,
          status,
          created_at,
          assets (code)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalAssets: assetsCount || 0,
        pendingMaintenance: pendingCount || 0,
        completedToday: completedCount || 0,
      });

      if (activityData) {
        setRecentActivity(activityData.map((item: any) => ({
          id: item.id,
          asset_code: item.assets?.code || 'Unknown Asset',
          maintenance_type: item.maintenance_type,
          status: item.status,
          created_at: item.created_at,
        })));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statItems = [
    { name: 'Total Assets', value: stats.totalAssets, icon: ClipboardList, color: 'bg-brand-red', link: '/assets' },
    { name: 'Pending Tasks', value: stats.pendingMaintenance, icon: AlertTriangle, color: 'bg-amber-500', link: '/tasks' },
    { name: 'Completed Today', value: stats.completedToday, icon: CheckCircle, color: 'bg-emerald-500', link: '/history' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Quick Action Card - Scan */}
        <Link
          to="/scan"
          className="group relative bg-gradient-to-br from-brand-red to-red-800 overflow-hidden shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl group-hover:scale-110 transition-transform"></div>
          
          <div className="relative z-10">
            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
              <Scan className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">Scan Asset</h3>
            <p className="text-red-100 text-sm mt-1">Quickly scan barcode to view details</p>
          </div>
          
          <div className="mt-4 flex items-center text-white/80 text-sm font-medium group-hover:text-white">
            Start Scanning <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {statItems.map((item) => (
          <div
            key={item.name}
            className="bg-white overflow-hidden shadow-sm rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className={`${item.color} bg-opacity-10 p-3 rounded-xl`}>
                <item.icon className={`h-6 w-6 ${item.color.replace('bg-', 'text-')}`} />
              </div>
              <span className={`text-2xl font-bold ${item.value === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
                {item.value}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500">{item.name}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-brand-red" />
              Recent Activity
            </h3>
            <Link to="/history" className="text-sm font-medium text-brand-red hover:text-red-700">
              View All
            </Link>
          </div>
          
          {recentActivity.length > 0 ? (
            <ul className="divide-y divide-gray-50">
              {recentActivity.map((activity) => (
                <li key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">
                        {activity.asset_code}
                      </span>
                      <span className="text-xs text-gray-500 capitalize mt-0.5">
                        {activity.maintenance_type} • {new Date(activity.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize
                        ${activity.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          activity.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                <ClipboardList className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-900">No activity yet</h3>
              <p className="mt-1 text-sm text-gray-500">Maintenance records will appear here.</p>
            </div>
          )}
        </div>

        {/* Quick Tips or Info */}
        <div className="bg-gradient-to-br from-gray-900 to-black shadow-lg rounded-2xl p-6 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
           
           <h3 className="text-lg font-bold mb-4 relative z-10">Pro Tip</h3>
           <p className="text-gray-300 text-sm mb-6 relative z-10 leading-relaxed">
             Regular preventive maintenance extends asset lifespan by up to 40%. Schedule your inspections early!
           </p>
           
           <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium transition-colors border border-white/10">
             View Schedule
           </button>
        </div>
      </div>
    </div>
  );
}
