-- Create ecommerce_cj_admins table
CREATE TABLE IF NOT EXISTS ecommerce_cj_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  products JSONB DEFAULT '[]'::jsonb,
  categories JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_ecommerce_cj_admins_updated_at 
  BEFORE UPDATE ON ecommerce_cj_admins 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial admin record if it doesn't exist
INSERT INTO ecommerce_cj_admins (products, categories)
SELECT '[]'::jsonb, '[]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM ecommerce_cj_admins LIMIT 1);

-- Enable Row Level Security (RLS)
ALTER TABLE ecommerce_cj_admins ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (adjust based on your auth requirements)
CREATE POLICY "Allow all operations on ecommerce_cj_admins" 
  ON ecommerce_cj_admins 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
