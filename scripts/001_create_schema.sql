-- Create profiles table for user management
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  skill_level text check (skill_level in ('beginner', 'intermediate', 'advanced', 'expert')),
  preferred_wave_height_min numeric(4,1),
  preferred_wave_height_max numeric(4,1),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create surf_spots table
create table if not exists public.surf_spots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  latitude numeric(10,7) not null,
  longitude numeric(10,7) not null,
  country text not null,
  region text,
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced', 'expert')),
  break_type text check (break_type in ('beach', 'reef', 'point', 'river')),
  ideal_swell_direction text,
  ideal_wind_direction text,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create forecasts table
create table if not exists public.forecasts (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references public.surf_spots(id) on delete cascade,
  timestamp timestamptz not null,
  wave_height_min numeric(4,1),
  wave_height_max numeric(4,1),
  wave_period numeric(4,1),
  wave_direction numeric(5,1),
  wind_speed numeric(5,1),
  wind_direction numeric(5,1),
  wind_gust numeric(5,1),
  tide_height numeric(4,2),
  tide_type text check (tide_type in ('high', 'low', 'rising', 'falling')),
  water_temperature numeric(4,1),
  surfability_score numeric(3,1) check (surfability_score >= 0 and surfability_score <= 10),
  ai_recommendation text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create favorites table
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  spot_id uuid not null references public.surf_spots(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, spot_id)
);

-- Create alerts table
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  spot_id uuid not null references public.surf_spots(id) on delete cascade,
  min_wave_height numeric(4,1),
  max_wave_height numeric(4,1),
  min_surfability_score numeric(3,1),
  enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for performance
create index if not exists idx_forecasts_spot_timestamp on public.forecasts(spot_id, timestamp desc);
create index if not exists idx_forecasts_timestamp on public.forecasts(timestamp desc);
create index if not exists idx_surf_spots_location on public.surf_spots(latitude, longitude);
create index if not exists idx_favorites_user on public.favorites(user_id);
create index if not exists idx_alerts_user on public.alerts(user_id);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.surf_spots enable row level security;
alter table public.forecasts enable row level security;
alter table public.favorites enable row level security;
alter table public.alerts enable row level security;

-- Profiles policies
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Surf spots policies (public read, no write for users)
create policy "surf_spots_select_all"
  on public.surf_spots for select
  to authenticated
  using (true);

-- Forecasts policies (public read, no write for users)
create policy "forecasts_select_all"
  on public.forecasts for select
  to authenticated
  using (true);

-- Favorites policies
create policy "favorites_select_own"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "favorites_insert_own"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "favorites_delete_own"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- Alerts policies
create policy "alerts_select_own"
  on public.alerts for select
  using (auth.uid() = user_id);

create policy "alerts_insert_own"
  on public.alerts for insert
  with check (auth.uid() = user_id);

create policy "alerts_update_own"
  on public.alerts for update
  using (auth.uid() = user_id);

create policy "alerts_delete_own"
  on public.alerts for delete
  using (auth.uid() = user_id);
