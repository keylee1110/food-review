-- 1. Create the orders table
CREATE TABLE public.orders (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_code text NOT NULL UNIQUE,
    map_slug text NOT NULL,
    amount numeric NOT NULL,
    promo_code text,
    status text NOT NULL DEFAULT 'PENDING',
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 3. Allow public (anonymous) users to SELECT (Read) any order.
-- This is required so the Frontend can listen to Realtime changes via WebSockets.
-- Since the table only contains order statuses and no personal data or map URLs, this is safe.
CREATE POLICY "Allow public read access" ON public.orders
    FOR SELECT
    TO public
    USING (true);

-- Note: Insert and Update operations will be handled by the Next.js API using the SERVICE_ROLE_KEY,
-- which bypasses RLS automatically. Therefore, no Insert/Update policies are needed for public users.

-- 4. Enable Supabase Realtime for this table
-- (You can also do this in the Dashboard: Database -> Replication -> Source -> Toggle on "orders" table)
alter publication supabase_realtime add table public.orders;
