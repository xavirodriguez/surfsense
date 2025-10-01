-- Seed some popular surf spots
insert into public.surf_spots (name, description, latitude, longitude, country, region, difficulty, break_type, ideal_swell_direction, ideal_wind_direction, image_url) values
  ('Pipeline', 'World-famous reef break on the North Shore of Oahu', 21.6644, -158.0533, 'USA', 'Hawaii', 'expert', 'reef', 'NW', 'E', '/placeholder.svg?height=400&width=600'),
  ('Mavericks', 'Big wave surf spot in Northern California', 37.4944, -122.4972, 'USA', 'California', 'expert', 'reef', 'NW', 'E', '/placeholder.svg?height=400&width=600'),
  ('Bells Beach', 'Iconic Australian surf break near Torquay', -38.3686, 144.2819, 'Australia', 'Victoria', 'intermediate', 'point', 'SW', 'N', '/placeholder.svg?height=400&width=600'),
  ('Jeffreys Bay', 'Perfect right-hand point break in South Africa', -34.0547, 24.9108, 'South Africa', 'Eastern Cape', 'advanced', 'point', 'SW', 'W', '/placeholder.svg?height=400&width=600'),
  ('Teahupo''o', 'Heavy reef break in Tahiti', -17.8739, -149.2669, 'French Polynesia', 'Tahiti', 'expert', 'reef', 'SW', 'E', '/placeholder.svg?height=400&width=600'),
  ('Hossegor', 'Beach break capital of Europe', 43.6617, -1.4050, 'France', 'Nouvelle-Aquitaine', 'intermediate', 'beach', 'W', 'E', '/placeholder.svg?height=400&width=600'),
  ('Uluwatu', 'Legendary left-hand reef break in Bali', -8.8292, 115.0864, 'Indonesia', 'Bali', 'advanced', 'reef', 'SW', 'E', '/placeholder.svg?height=400&width=600'),
  ('Trestles', 'Consistent beach break in Southern California', 33.3833, -117.5917, 'USA', 'California', 'intermediate', 'beach', 'SW', 'E', '/placeholder.svg?height=400&width=600'),
  ('Mundaka', 'World-class left-hand river mouth break', 43.4072, -2.6978, 'Spain', 'Basque Country', 'advanced', 'river', 'NW', 'S', '/placeholder.svg?height=400&width=600'),
  ('Snapper Rocks', 'Super consistent point break on Gold Coast', -28.1761, 153.5403, 'Australia', 'Queensland', 'intermediate', 'point', 'E', 'W', '/placeholder.svg?height=400&width=600')
on conflict do nothing;
