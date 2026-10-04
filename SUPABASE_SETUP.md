# Supabase Setup Guide for Rwanda Social Registry

## Step 1: Create a Free Supabase Account

1. Go to https://supabase.com
2. Click "Start your project" 
3. Sign up with email or GitHub
4. Create a new project:
   - Name: `rwanda-social-registry` (or your choice)
   - Database password: Generate a strong one
   - Region: Choose closest to Rwanda (EU or Africa)
   - Click "Create new project"

## Step 2: Get Your API Keys

1. Wait for the project to initialize (1-2 minutes)
2. Go to **Settings** → **API**
3. Copy these values:
   - **Project URL**: Starts with `https://`
   - **anon public**: Your anonymous key (long string)
4. Paste them into `.env.local` in the root of this project

## Step 3: Create Database Tables

In Supabase, go to **SQL Editor** and run these queries to set up the schema:

### Table: districts
```sql
CREATE TABLE districts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL UNIQUE,
  province TEXT NOT NULL,
  poverty_rate DECIMAL(5,2),
  financial_exclusion DECIMAL(5,2),
  multidimensional_poverty DECIMAL(5,2),
  urban_rural TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: users (for authentication)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE,
  name TEXT,
  role TEXT DEFAULT 'enumerator',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: households
```sql
CREATE TABLE households (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  household_id TEXT UNIQUE,
  district_id BIGINT REFERENCES districts(id),
  province TEXT,
  urban_rural TEXT,
  head_name TEXT,
  family_size INTEGER,
  vulnerability_score DECIMAL(5,2),
  household_status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: household_members
```sql
CREATE TABLE household_members (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  household_id BIGINT REFERENCES households(id),
  member_name TEXT,
  age INTEGER,
  gender TEXT,
  relationship TEXT,
  education_level TEXT,
  employment_status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: programs
```sql
CREATE TABLE programs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  program_name TEXT NOT NULL,
  program_type TEXT,
  target_population TEXT,
  budget DECIMAL(15,2),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: audit_logs
```sql
CREATE TABLE audit_logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID REFERENCES users(id),
  action TEXT,
  table_name TEXT,
  record_id BIGINT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Step 4: Insert Sample Data

Run this SQL to add sample districts:

```sql
INSERT INTO districts (name, province, poverty_rate, financial_exclusion, multidimensional_poverty, urban_rural)
VALUES
  ('Nyagatare', 'Eastern', 35.4, 42.1, 33.2, 'Rural'),
  ('Rubavu', 'Western', 38.8, 41.7, 35.1, 'Urban'),
  ('Gatsibo', 'Eastern', 18.4, 27.5, 20.8, 'Rural'),
  ('Kayonza', 'Eastern', 36.6, 39.9, 31.6, 'Rural'),
  ('Kirehe', 'Eastern', 14.2, 26.8, 22.4, 'Rural'),
  ('Nyanza', 'Southern', 51.4, 62.2, 48.7, 'Rural'),
  ('Musanze', 'Northern', 42.8, 44.5, 39.1, 'Rural'),
  ('Kigali', 'Kigali', 31.2, 24.6, 28.5, 'Urban'),
  ('Gisagara', 'Southern', 45.6, 54.1, 46.8, 'Rural'),
  ('Rutsiro', 'Western', 40.8, 47.3, 37.6, 'Rural');
```

## Step 5: Enable Row Level Security (RLS)

1. Go to **SQL Editor**
2. Run this to enable authentication-based data access:

```sql
-- Enable RLS on all tables
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow public read on districts
CREATE POLICY "Allow public read on districts" ON districts FOR SELECT USING (TRUE);

-- Allow authenticated users to read households
CREATE POLICY "Allow authenticated read on households" ON households FOR SELECT USING (auth.role() = 'authenticated');
```

## Step 6: Test the Connection

1. Update `.env.local` with your real Supabase credentials
2. Run `npm run dev`
3. Open browser console and check for any errors
4. The app will be ready to fetch data from Supabase

## Step 7: Connect Frontend Components to Supabase

Use the helper functions in `supabaseClient.js`:

```javascript
import { getDistricts, getFilteredHouseholds } from './supabaseClient'

// Fetch data
const districts = await getDistricts()
const households = await getFilteredHouseholds('Eastern', 'Rural')
```

## Important Notes

- **Free tier limits**: 500MB database, 2GB bandwidth per month (enough for prototype)
- **Keep `.env.local` private**: Never commit it to GitHub
- **Update `.gitignore`**: Make sure `.env.local` is listed (it should be by default)
- **Security**: Use RLS policies to control who can see what data
- **Authentication**: Add Supabase Auth later for login/signup

## Troubleshooting

- **"Invalid JWT"**: Check your `VITE_SUPABASE_ANON_KEY` is correct
- **CORS errors**: Supabase handles this automatically
- **No data**: Make sure you inserted sample data into the tables
- **Connection timeout**: Check your internet and API key validity

For more help: https://supabase.com/docs
