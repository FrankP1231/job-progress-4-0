// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://zpalocdhytatpvydlmxt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwYWxvY2RoeXRhdHB2eWRsbXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMjkyMTQsImV4cCI6MjA1NjcwNTIxNH0.s13fNKpSzVNRuCI0Mv0qZR-yLGeLZ2wr6ihHbab3Pm4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);