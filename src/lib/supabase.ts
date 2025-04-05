
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wbyqipypwmvmnndjddrn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndieXFpcHlwd212bW5uZGpkZHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NzkzMjQsImV4cCI6MjA1OTI1NTMyNH0.ddT62Hp3cFaasXU0W2auD0_EBhKGTAqWNryAsIizAoo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
