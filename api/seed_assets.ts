
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const sampleAssets = [
  {
    code: 'AST-001',
    name: 'Air Conditioner Unit 1',
    category: 'HVAC',
    location: 'Building A, Floor 1',
    status: 'active',
    purchase_date: '2023-01-15',
    specification: { model: 'Samsung AR12', power: '1.5 PK' }
  },
  {
    code: 'AST-002',
    name: 'Generator Set',
    category: 'Power',
    location: 'Basement',
    status: 'active',
    purchase_date: '2022-05-20',
    specification: { model: 'Caterpillar C32', output: '1000 kVA' }
  },
  {
    code: 'AST-003',
    name: 'Water Pump',
    category: 'Plumbing',
    location: 'Rooftop',
    status: 'maintenance',
    purchase_date: '2023-08-10',
    specification: { model: 'Grundfos CR', flow: '50 m3/h' }
  },
  {
    code: 'AST-004',
    name: 'Elevator Car 1',
    category: 'Transport',
    location: 'Building A',
    status: 'active',
    purchase_date: '2021-11-01',
    specification: { model: 'Schindler 3300', capacity: '1000 kg' }
  },
  {
    code: 'AST-005',
    name: 'Fire Alarm Control Panel',
    category: 'Safety',
    location: 'Security Room',
    status: 'active',
    purchase_date: '2024-01-05',
    specification: { model: 'Simplex 4100ES', zones: '16' }
  }
];

async function seed() {
  console.log('Seeding assets...');
  
  // First check if assets exist to avoid duplicates
  const { count } = await supabase.from('assets').select('*', { count: 'exact', head: true });
  
  if (count && count > 0) {
    console.log(`Found ${count} existing assets. Skipping seed.`);
    return;
  }

  const { data, error } = await supabase.from('assets').insert(sampleAssets).select();
  
  if (error) {
    console.error('Error seeding assets:', error);
  } else {
    console.log(`Successfully inserted ${data.length} assets.`);
  }
}

seed();
