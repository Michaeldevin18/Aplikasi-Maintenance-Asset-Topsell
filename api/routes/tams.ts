import { Router, Request, Response } from 'express';

const router = Router();

// Mock database of TAMS assets
const mockTamsAssets: Record<string, unknown> = {
  'A-2024-001': {
    code: 'A-2024-001',
    name: 'Industrial Generator X500',
    category: 'Power Equipment',
    location: 'Building A, Basement',
    status: 'active',
    purchase_date: '2024-01-15',
    specification: {
      power_output: '500kW',
      fuel_type: 'Diesel',
      manufacturer: 'PowerGen Corp'
    }
  },
  'A-2024-002': {
    code: 'A-2024-002',
    name: 'Conveyor Belt System',
    category: 'Production Line',
    location: 'Factory Floor, Zone B',
    status: 'active',
    purchase_date: '2023-11-20',
    specification: {
      length: '50m',
      speed: '2m/s',
      load_capacity: '1000kg'
    }
  },
  'A-2024-003': {
    code: 'A-2024-003',
    name: 'HVAC Unit Model Z',
    category: 'Climate Control',
    location: 'Roof, Main Building',
    status: 'maintenance',
    purchase_date: '2022-05-10',
    specification: {
      cooling_capacity: '20 tons',
      refrigerant: 'R-410A'
    }
  }
};

// GET /api/tams/assets/:code
router.get('/assets/:code', (req: Request, res: Response) => {
  const { code } = req.params;
  const asset = mockTamsAssets[code];

  if (asset) {
    res.json({
      success: true,
      data: asset
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Asset not found in TAMS system'
    });
  }
});

export default router;
