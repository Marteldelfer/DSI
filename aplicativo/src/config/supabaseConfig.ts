// aplicativo/src/config/supabaseConfig.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ygkbdypesnfvgxoyjicb.supabase.co';
const supabaseAnonKey = 'sb_publishable_5zYKiguhSkNq38FEmsbUQg_61sLkA93';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);