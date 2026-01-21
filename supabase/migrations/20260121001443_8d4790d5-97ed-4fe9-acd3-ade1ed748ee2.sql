-- Create enum for protection modes
CREATE TYPE public.protection_mode AS ENUM ('key', 'whitelist', 'keyless');

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create enum for whitelist types
CREATE TYPE public.whitelist_type AS ENUM ('roblox_id', 'username', 'hwid');

-- Scripts table
CREATE TABLE public.scripts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    original_code TEXT NOT NULL,
    obfuscated_code TEXT,
    protection_mode protection_mode NOT NULL DEFAULT 'keyless',
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_premium BOOLEAN NOT NULL DEFAULT false,
    version INTEGER NOT NULL DEFAULT 1,
    anti_tamper BOOLEAN NOT NULL DEFAULT true,
    anti_dump BOOLEAN NOT NULL DEFAULT true,
    anti_hook BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Script keys table
CREATE TABLE public.script_keys (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    script_id UUID NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
    key_value TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_premium BOOLEAN NOT NULL DEFAULT false,
    max_uses INTEGER,
    current_uses INTEGER NOT NULL DEFAULT 0,
    hwid_locked TEXT,
    hwid_lock_enabled BOOLEAN NOT NULL DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- Script whitelist table
CREATE TABLE public.script_whitelist (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    script_id UUID NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
    identifier TEXT NOT NULL,
    identifier_type whitelist_type NOT NULL,
    note TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Script executions table for analytics
CREATE TABLE public.script_executions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    script_id UUID NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
    key_id UUID REFERENCES public.script_keys(id) ON DELETE SET NULL,
    executor_ip TEXT,
    executor_hwid TEXT,
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User blacklist table
CREATE TABLE public.user_blacklist (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    script_id UUID REFERENCES public.scripts(id) ON DELETE CASCADE,
    identifier TEXT NOT NULL,
    identifier_type whitelist_type NOT NULL,
    reason TEXT,
    is_global BOOLEAN NOT NULL DEFAULT false,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- HWID reset requests table
CREATE TABLE public.hwid_resets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    key_id UUID NOT NULL REFERENCES public.script_keys(id) ON DELETE CASCADE,
    old_hwid TEXT,
    new_hwid TEXT,
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID,
    status TEXT NOT NULL DEFAULT 'pending'
);

-- User roles table
CREATE TABLE public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.script_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.script_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.script_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hwid_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for scripts
CREATE POLICY "Users can view their own scripts" ON public.scripts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own scripts" ON public.scripts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own scripts" ON public.scripts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own scripts" ON public.scripts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for script_keys (via script ownership)
CREATE POLICY "Users can view keys for their scripts" ON public.script_keys FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.scripts WHERE scripts.id = script_keys.script_id AND scripts.user_id = auth.uid()));
CREATE POLICY "Users can create keys for their scripts" ON public.script_keys FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM public.scripts WHERE scripts.id = script_keys.script_id AND scripts.user_id = auth.uid()));
CREATE POLICY "Users can update keys for their scripts" ON public.script_keys FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM public.scripts WHERE scripts.id = script_keys.script_id AND scripts.user_id = auth.uid()));
CREATE POLICY "Users can delete keys for their scripts" ON public.script_keys FOR DELETE 
    USING (EXISTS (SELECT 1 FROM public.scripts WHERE scripts.id = script_keys.script_id AND scripts.user_id = auth.uid()));

-- RLS Policies for script_whitelist
CREATE POLICY "Users can view whitelist for their scripts" ON public.script_whitelist FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.scripts WHERE scripts.id = script_whitelist.script_id AND scripts.user_id = auth.uid()));
CREATE POLICY "Users can create whitelist for their scripts" ON public.script_whitelist FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM public.scripts WHERE scripts.id = script_whitelist.script_id AND scripts.user_id = auth.uid()));
CREATE POLICY "Users can update whitelist for their scripts" ON public.script_whitelist FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM public.scripts WHERE scripts.id = script_whitelist.script_id AND scripts.user_id = auth.uid()));
CREATE POLICY "Users can delete whitelist for their scripts" ON public.script_whitelist FOR DELETE 
    USING (EXISTS (SELECT 1 FROM public.scripts WHERE scripts.id = script_whitelist.script_id AND scripts.user_id = auth.uid()));

-- RLS Policies for script_executions
CREATE POLICY "Users can view executions for their scripts" ON public.script_executions FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.scripts WHERE scripts.id = script_executions.script_id AND scripts.user_id = auth.uid()));
CREATE POLICY "Anyone can insert executions" ON public.script_executions FOR INSERT WITH CHECK (true);

-- RLS Policies for user_blacklist
CREATE POLICY "Users can view their blacklist entries" ON public.user_blacklist FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can create blacklist entries" ON public.user_blacklist FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their blacklist entries" ON public.user_blacklist FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their blacklist entries" ON public.user_blacklist FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for hwid_resets
CREATE POLICY "Users can view resets for their keys" ON public.hwid_resets FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM public.script_keys 
        JOIN public.scripts ON scripts.id = script_keys.script_id 
        WHERE script_keys.id = hwid_resets.key_id AND scripts.user_id = auth.uid()
    ));
CREATE POLICY "Anyone can request hwid reset" ON public.hwid_resets FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners can approve resets" ON public.hwid_resets FOR UPDATE 
    USING (EXISTS (
        SELECT 1 FROM public.script_keys 
        JOIN public.scripts ON scripts.id = script_keys.script_id 
        WHERE script_keys.id = hwid_resets.key_id AND scripts.user_id = auth.uid()
    ));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates on scripts
CREATE TRIGGER update_scripts_updated_at
    BEFORE UPDATE ON public.scripts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_scripts_user_id ON public.scripts(user_id);
CREATE INDEX idx_script_keys_script_id ON public.script_keys(script_id);
CREATE INDEX idx_script_keys_key_value ON public.script_keys(key_value);
CREATE INDEX idx_script_whitelist_script_id ON public.script_whitelist(script_id);
CREATE INDEX idx_script_executions_script_id ON public.script_executions(script_id);
CREATE INDEX idx_user_blacklist_identifier ON public.user_blacklist(identifier);