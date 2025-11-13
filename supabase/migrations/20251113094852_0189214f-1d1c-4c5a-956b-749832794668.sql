-- Add new fields to gym_members table
ALTER TABLE public.gym_members 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS referred_by_id UUID REFERENCES public.gym_members(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS referral_commission DECIMAL(10, 2) DEFAULT 0;

-- Create commissions table to track referral earnings
CREATE TABLE IF NOT EXISTS public.commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
    referred_member_id UUID NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'pending'
);

-- Enable RLS on commissions table
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- Create policy for commissions
CREATE POLICY "Allow all access to commissions" 
ON public.commissions 
FOR ALL 
USING (true);

-- Add realtime support for commissions
ALTER PUBLICATION supabase_realtime ADD TABLE public.commissions;
ALTER TABLE public.commissions REPLICA IDENTITY FULL;