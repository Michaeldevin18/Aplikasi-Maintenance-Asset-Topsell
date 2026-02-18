
-- Fix users table policies
-- Enable RLS (already enabled but good to ensure)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow reading users (needed to see technician names)
DROP POLICY IF EXISTS "Users can view all users" ON users;
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);

-- Allow inserting own profile (needed for registration/first login)
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow updating own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Fix assets table policies
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Allow viewing assets (authenticated)
DROP POLICY IF EXISTS "Users can view all assets" ON assets;
CREATE POLICY "Users can view all assets" ON assets FOR SELECT USING (auth.role() = 'authenticated');

-- Allow inserting assets (authenticated - for seeding/adding)
DROP POLICY IF EXISTS "Users can insert assets" ON assets;
CREATE POLICY "Users can insert assets" ON assets FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow updating assets (authenticated)
DROP POLICY IF EXISTS "Users can update assets" ON assets;
CREATE POLICY "Users can update assets" ON assets FOR UPDATE USING (auth.role() = 'authenticated');
