import { createClient } from '@supabase/supabase-js'

// URLS DIRECTES PDEBUG
const supabaseUrl = 'https://dlcifjbbdkwlvtfxmqiw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsY2lmamJiZGt3bHZ0ZnhtcWl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNzcxNzEsImV4cCI6MjA3NzY1MzE3MX0.ERly0CZ-su2xWIzKSpMfg91QdQ9eCO5V4UY_Yy-opmk'

console.log('🔄 Supabase configuré avec URLs directes')

export const supabase = createClient(supabaseUrl, supabaseKey)