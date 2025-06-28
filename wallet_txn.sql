-- Wallet transaction log for idempotency
CREATE TABLE IF NOT EXISTS public.wallet_txn (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  email text NOT NULL,
  reference text UNIQUE NOT NULL,
  amount numeric NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc', now())
);

-- optional index
CREATE INDEX IF NOT EXISTS wallet_txn_email_idx ON public.wallet_txn(email);

-- RLS
ALTER TABLE public.wallet_txn ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read" ON public.wallet_txn FOR SELECT USING (true);
CREATE POLICY "Service insert" ON public.wallet_txn FOR INSERT WITH CHECK (auth.role() = 'service_role');
