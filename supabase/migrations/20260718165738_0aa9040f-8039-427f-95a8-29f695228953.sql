
-- Reset catalogue to automotive parts
DELETE FROM public.products;
DELETE FROM public.categories;

INSERT INTO public.categories (name, slug) VALUES
  ('Engine Components', 'engine'),
  ('Fuel, Air & Exhaust', 'fuel-air-exhaust'),
  ('Cooling & Lubrication', 'cooling-lubrication'),
  ('Drivetrain & Transmission', 'drivetrain'),
  ('Steering & Suspension', 'steering-suspension'),
  ('Braking System', 'braking'),
  ('Electrical System', 'electrical');

WITH c AS (SELECT id, slug FROM public.categories)
INSERT INTO public.products (name, brand, model, category_id, description, price, quantity, warranty, image_url)
VALUES
  -- Engine Components
  ('Engine Block', 'Bosch', 'EB-4C', (SELECT id FROM c WHERE slug='engine'), 'Core structure housing the cylinders.', 45000, 8, '1 year', 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800'),
  ('Piston', 'Mahle', 'P-STD', (SELECT id FROM c WHERE slug='engine'), 'Moves inside the cylinder to compress air and fuel.', 2500, 40, '6 months', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800'),
  ('Piston Ring Set', 'NPR', 'PR-4', (SELECT id FROM c WHERE slug='engine'), 'Seals the gap between the piston and cylinder wall.', 1200, 60, '6 months', 'https://images.unsplash.com/photo-1600783486053-6a1a3ed7dcb0?w=800'),
  ('Crankshaft', 'SKF', 'CS-1', (SELECT id FROM c WHERE slug='engine'), 'Converts piston motion into rotational motion.', 18500, 5, '1 year', 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800'),
  ('Camshaft', 'Comp Cams', 'CAM-01', (SELECT id FROM c WHERE slug='engine'), 'Controls opening and closing of engine valves.', 9500, 6, '1 year', 'https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?w=800'),
  ('Connecting Rod', 'Mahle', 'CR-Std', (SELECT id FROM c WHERE slug='engine'), 'Connects the piston to the crankshaft.', 3200, 20, '6 months', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800'),
  ('Timing Belt', 'Gates', 'TB-104', (SELECT id FROM c WHERE slug='engine'), 'Synchronizes crankshaft and camshaft rotation.', 1500, 3, '1 year', 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800'),
  ('Flywheel', 'LuK', 'FW-2', (SELECT id FROM c WHERE slug='engine'), 'Maintains consistent engine rotation, connects to transmission.', 6800, 10, '1 year', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'),
  ('Engine Valve', 'Federal-Mogul', 'V-16', (SELECT id FROM c WHERE slug='engine'), 'Controls intake of air/fuel and exhaust of gases.', 450, 120, '6 months', 'https://images.unsplash.com/photo-1600661653561-629509216228?w=800'),
  ('Rocker Arm', 'Delphi', 'RA-4', (SELECT id FROM c WHERE slug='engine'), 'Transfers movement from the camshaft to the valves.', 900, 45, '6 months', 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=800'),

  -- Fuel, Air & Exhaust
  ('Air Filter', 'K&N', 'AF-33', (SELECT id FROM c WHERE slug='fuel-air-exhaust'), 'Cleans air entering the combustion chamber.', 650, 80, '1 year', 'https://images.unsplash.com/photo-1580274418424-6b83e07f0a12?w=800'),
  ('Throttle Body', 'Bosch', 'TB-60', (SELECT id FROM c WHERE slug='fuel-air-exhaust'), 'Controls the amount of air entering the engine.', 7800, 12, '1 year', 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800'),
  ('Fuel Injector', 'Denso', 'FI-4', (SELECT id FROM c WHERE slug='fuel-air-exhaust'), 'Sprays atomized fuel into the engine.', 3200, 35, '1 year', 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800'),
  ('Fuel Pump', 'Bosch', 'FP-200', (SELECT id FROM c WHERE slug='fuel-air-exhaust'), 'Delivers fuel from the tank to the engine.', 4500, 6, '1 year', 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800'),
  ('Fuel Tank', 'OEM', 'FT-50L', (SELECT id FROM c WHERE slug='fuel-air-exhaust'), 'Stores the vehicle''s fuel.', 12500, 4, '1 year', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'),
  ('Exhaust Manifold', 'MagnaFlow', 'EM-4', (SELECT id FROM c WHERE slug='fuel-air-exhaust'), 'Collects exhaust gases from multiple cylinders.', 8900, 8, '1 year', 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=800'),
  ('Catalytic Converter', 'MagnaFlow', 'CC-200', (SELECT id FROM c WHERE slug='fuel-air-exhaust'), 'Converts harmful exhaust gases into safer emissions.', 15000, 5, '2 years', 'https://images.unsplash.com/photo-1621262837107-1eb9a9b4bd8f?w=800'),
  ('Muffler', 'Walker', 'MF-101', (SELECT id FROM c WHERE slug='fuel-air-exhaust'), 'Reduces exhaust system noise.', 3500, 15, '1 year', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800'),
  ('Oxygen (O2) Sensor', 'NGK', 'O2-1', (SELECT id FROM c WHERE slug='fuel-air-exhaust'), 'Measures oxygen in exhaust to optimize air-fuel ratio.', 2100, 30, '1 year', 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=800'),
  ('Turbocharger', 'Garrett', 'GT-2860', (SELECT id FROM c WHERE slug='fuel-air-exhaust'), 'Forces more air into the engine, boosting power.', 42000, 3, '2 years', 'https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?w=800'),

  -- Cooling & Lubrication
  ('Radiator', 'Denso', 'RD-16', (SELECT id FROM c WHERE slug='cooling-lubrication'), 'Dissipates heat from engine coolant.', 6500, 10, '1 year', 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800'),
  ('Water Pump', 'Aisin', 'WP-9', (SELECT id FROM c WHERE slug='cooling-lubrication'), 'Circulates coolant through engine and radiator.', 2800, 20, '1 year', 'https://images.unsplash.com/photo-1600661653561-629509216228?w=800'),
  ('Thermostat', 'Gates', 'TH-180', (SELECT id FROM c WHERE slug='cooling-lubrication'), 'Regulates engine temperature.', 550, 65, '6 months', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800'),
  ('Oil Pump', 'Melling', 'OP-M-77', (SELECT id FROM c WHERE slug='cooling-lubrication'), 'Circulates motor oil to lubricate parts.', 3400, 12, '1 year', 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800'),
  ('Oil Filter', 'Mann', 'OF-1', (SELECT id FROM c WHERE slug='cooling-lubrication'), 'Removes impurities from engine oil.', 350, 150, '3 months', 'https://images.unsplash.com/photo-1621262837107-1eb9a9b4bd8f?w=800'),
  ('Oil Pan', 'Dorman', 'OP-2', (SELECT id FROM c WHERE slug='cooling-lubrication'), 'Stores engine oil at the bottom of the engine.', 2900, 14, '1 year', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'),
  ('Radiator Fan', 'Spal', 'RF-12', (SELECT id FROM c WHERE slug='cooling-lubrication'), 'Pulls air through radiator when stationary.', 2200, 18, '1 year', 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=800'),
  ('Coolant Hose', 'Gates', 'CH-Upper', (SELECT id FROM c WHERE slug='cooling-lubrication'), 'Flexible pipe transporting coolant.', 450, 90, '6 months', 'https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?w=800'),

  -- Drivetrain & Transmission
  ('Transmission (Gearbox)', 'ZF', 'ZF-6HP', (SELECT id FROM c WHERE slug='drivetrain'), 'Controls gear ratios, transferring power to wheels.', 85000, 2, '2 years', 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800'),
  ('Clutch Kit', 'LuK', 'CK-Std', (SELECT id FROM c WHERE slug='drivetrain'), 'Engages and disengages the transmission.', 6800, 12, '1 year', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800'),
  ('Drive Shaft', 'GKN', 'DS-1', (SELECT id FROM c WHERE slug='drivetrain'), 'Transfers rotational power to the wheels.', 8500, 6, '1 year', 'https://images.unsplash.com/photo-1600783486053-6a1a3ed7dcb0?w=800'),
  ('Differential', 'Eaton', 'D-Trac', (SELECT id FROM c WHERE slug='drivetrain'), 'Allows outer wheels to spin faster in turns.', 22000, 4, '2 years', 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800'),
  ('Axle', 'GKN', 'AX-CV', (SELECT id FROM c WHERE slug='drivetrain'), 'Rotates the wheels and supports weight.', 5600, 15, '1 year', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'),
  ('Torque Converter', 'ATP', 'TC-A', (SELECT id FROM c WHERE slug='drivetrain'), 'Fluid coupling used in automatic transmissions.', 14500, 5, '1 year', 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800'),

  -- Steering & Suspension
  ('Shock Absorber', 'Bilstein', 'B6', (SELECT id FROM c WHERE slug='steering-suspension'), 'Dampens bouncing of the vehicle springs.', 3800, 40, '1 year', 'https://images.unsplash.com/photo-1580274418424-6b83e07f0a12?w=800'),
  ('Strut Assembly', 'KYB', 'KYB-SR', (SELECT id FROM c WHERE slug='steering-suspension'), 'Suspension part incorporating a shock absorber.', 5400, 22, '1 year', 'https://images.unsplash.com/photo-1600661653561-629509216228?w=800'),
  ('Control Arm', 'Moog', 'CA-K', (SELECT id FROM c WHERE slug='steering-suspension'), 'Connects wheel hub to the vehicle frame.', 2900, 26, '1 year', 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=800'),
  ('Tie Rod', 'Moog', 'TR-ES', (SELECT id FROM c WHERE slug='steering-suspension'), 'Connects the steering rack to the knuckle.', 1200, 55, '6 months', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800'),
  ('Ball Joint', 'Moog', 'BJ-K', (SELECT id FROM c WHERE slug='steering-suspension'), 'Pivot allowing suspension and steering to move.', 850, 70, '6 months', 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=800'),
  ('Power Steering Pump', 'Bosch', 'PS-9', (SELECT id FROM c WHERE slug='steering-suspension'), 'Pressurizes hydraulic fluid for easy steering.', 6700, 8, '1 year', 'https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?w=800'),

  -- Braking System
  ('Brake Pad Set', 'Brembo', 'BP-Ceramic', (SELECT id FROM c WHERE slug='braking'), 'Creates friction against the rotor to slow the car.', 1800, 90, '6 months', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800'),
  ('Brake Caliper', 'Brembo', 'BC-4pot', (SELECT id FROM c WHERE slug='braking'), 'Houses the brake pads and squeezes them onto the rotor.', 7800, 14, '1 year', 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800'),
  ('Brake Rotor (Disc)', 'Brembo', 'BR-Vented', (SELECT id FROM c WHERE slug='braking'), 'Metal disc that spins with the wheel; gripped by pads.', 3200, 40, '1 year', 'https://images.unsplash.com/photo-1600783486053-6a1a3ed7dcb0?w=800'),
  ('Master Cylinder', 'ATE', 'MC-1', (SELECT id FROM c WHERE slug='braking'), 'Converts brake pedal force into hydraulic pressure.', 4900, 10, '1 year', 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=800'),
  ('ABS Module', 'Bosch', 'ABS-9', (SELECT id FROM c WHERE slug='braking'), 'Anti-lock braking computer that prevents wheel lock-up.', 18500, 5, '2 years', 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800'),

  -- Electrical System
  ('Battery', 'Amaron', 'AAM-B20', (SELECT id FROM c WHERE slug='electrical'), 'Supplies electrical power to start the vehicle.', 6500, 25, '3 years', 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=800'),
  ('Alternator', 'Denso', 'ALT-90A', (SELECT id FROM c WHERE slug='electrical'), 'Generates electricity and recharges the battery.', 8500, 12, '1 year', 'https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?w=800'),
  ('Starter Motor', 'Bosch', 'SM-1.4', (SELECT id FROM c WHERE slug='electrical'), 'Electric motor that cranks the engine to start it.', 5900, 14, '1 year', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'),
  ('Spark Plug (Set of 4)', 'NGK', 'IX-Iridium', (SELECT id FROM c WHERE slug='electrical'), 'Provides electrical spark to ignite the air-fuel mix.', 1200, 100, '1 year', 'https://images.unsplash.com/photo-1580274418424-6b83e07f0a12?w=800'),
  ('Electronic Control Unit (ECU)', 'Bosch', 'ECU-ME7', (SELECT id FROM c WHERE slug='electrical'), 'Central computer that controls engine functions.', 32000, 3, '2 years', 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800');
