-- Database schema backup generated 2025-07-13
-- Contains table, view, enum and policy definitions

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Enums
CREATE TYPE user_role AS ENUM ('buyer', 'vendor', 'admin');
CREATE TYPE product_status AS ENUM ('draft', 'live', 'sold', 'in_review', 'rejected', 'audit');
CREATE TYPE group_status AS ENUM ('open', 'waiting_votes', 'captured', 'delivered', 'failed', 'cancelled', 'completed');
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'escrow', 'refund');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE notification_type AS ENUM ('group_update', 'payment', 'system', 'alert');

-- Tables
CREATE TABLE public.user_profiles (
    id uuid REFERENCES auth.users(id) PRIMARY KEY,
    full_name text,
    avatar_url text,
    role user_role DEFAULT 'buyer'::user_role,
    wallet_balance decimal(12,2) DEFAULT 0.00,
    holds decimal(12,2) DEFAULT 0.00,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.products (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    vendor_id uuid REFERENCES public.user_profiles(id) NOT NULL,
    title text NOT NULL,
    description text,
    price decimal(12,2) NOT NULL,
    image_url text,
    status product_status DEFAULT 'draft'::product_status,
    min_participants int DEFAULT 1,
    max_participants int,
    end_date timestamp with time zone,
    actual_cost numeric,
    category text,
    subcategory text,
    is_fungible boolean,
    delivery_time text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.groups (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id uuid REFERENCES public.products(id) NOT NULL,
    status group_status DEFAULT 'open'::group_status,
    current_participants int DEFAULT 0,
    total_amount decimal(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    closed_at timestamp with time zone
);

CREATE TABLE public.group_members (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    group_id uuid REFERENCES public.groups(id) NOT NULL,
    user_id uuid REFERENCES public.user_profiles(id) NOT NULL,
    amount decimal(12,2) NOT NULL,
    joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(group_id, user_id)
);

CREATE TABLE public.transactions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.user_profiles(id) NOT NULL,
    type transaction_type NOT NULL,
    amount decimal(12,2) NOT NULL,
    status transaction_status DEFAULT 'pending'::transaction_status,
    reference_id uuid,
    description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.notifications (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.user_profiles(id) NOT NULL,
    type notification_type NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    read boolean DEFAULT false,
    reference_id uuid,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row level security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all profiles" ON public.user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view live products" ON public.products
    FOR SELECT USING (status = 'live');

CREATE POLICY "Vendors can view own products" ON public.products
    FOR SELECT USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can insert products" ON public.products
    FOR INSERT WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update own products" ON public.products
    FOR UPDATE USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can delete own products" ON public.products
    FOR DELETE USING (auth.uid() = vendor_id);

CREATE POLICY "Anyone can view groups" ON public.groups
    FOR SELECT USING (true);

CREATE POLICY "Vendors can insert groups" ON public.groups
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM public.products
        WHERE products.id = product_id
        AND products.vendor_id = auth.uid()
    ));

CREATE POLICY "Vendors can update own groups" ON public.groups
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM public.products
        WHERE products.id = product_id
        AND products.vendor_id = auth.uid()
    ));

CREATE POLICY "Vendors can delete own groups" ON public.groups
    FOR DELETE USING (EXISTS (
        SELECT 1 FROM public.products
        WHERE products.id = product_id
        AND products.vendor_id = auth.uid()
    ));

CREATE POLICY "Users can view group members" ON public.group_members
    FOR SELECT USING (true);

CREATE POLICY "Users can join groups" ON public.group_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups" ON public.group_members
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_distinct_categories()
RETURNS TABLE(category TEXT) AS $$
BEGIN
  RETURN QUERY SELECT DISTINCT products.category
               FROM public.products
               WHERE products.category IS NOT NULL AND products.category <> ''
               ORDER BY products.category;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at
    BEFORE UPDATE ON public.groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_products_vendor ON public.products(vendor_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_groups_product ON public.groups(product_id);
CREATE INDEX idx_groups_status ON public.groups(status);
CREATE INDEX idx_group_members_group ON public.group_members(group_id);
CREATE INDEX idx_group_members_user ON public.group_members(user_id);
CREATE INDEX idx_transactions_user ON public.transactions(user_id);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
