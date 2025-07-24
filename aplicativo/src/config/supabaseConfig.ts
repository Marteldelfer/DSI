// aplicativo/src/config/supabaseConfig.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://byifuavvmafihjbxtmyq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5aWZ1YXZ2bWFmaWhqYnh0bXlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NDI5MjcsImV4cCI6MjA2ODExODkyN30.W7mPwwX0-WsqmFBqvA2_187fDATBIvrLkcKkx0XQXnA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);