
-- Seed data for assets
INSERT INTO assets (code, name, category, location, status, purchase_date, specification)
VALUES
  ('AST-001', 'Air Conditioner Unit 1', 'HVAC', 'Building A, Floor 1', 'active', '2023-01-15', '{"model": "Samsung AR12", "power": "1.5 PK"}'),
  ('AST-002', 'Generator Set', 'Power', 'Basement', 'active', '2022-05-20', '{"model": "Caterpillar C32", "output": "1000 kVA"}'),
  ('AST-003', 'Water Pump', 'Plumbing', 'Rooftop', 'maintenance', '2023-08-10', '{"model": "Grundfos CR", "flow": "50 m3/h"}'),
  ('AST-004', 'Elevator Car 1', 'Transport', 'Building A', 'active', '2021-11-01', '{"model": "Schindler 3300", "capacity": "1000 kg"}'),
  ('AST-005', 'Fire Alarm Control Panel', 'Safety', 'Security Room', 'active', '2024-01-05', '{"model": "Simplex 4100ES", "zones": "16"}')
ON CONFLICT (code) DO NOTHING;
