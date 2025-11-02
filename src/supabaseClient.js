import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qnxixdqsiehagwnfbbcl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFueGl4ZHFzaWVoYWd3bmZiYmNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MTg1NTQsImV4cCI6MjA3NzQ5NDU1NH0.gyCSe8IY5rtzaUV2AQ_f9OMx6r4NwHkAI8hxPJjNCtU'
export const supabase = createClient(supabaseUrl, supabaseKey)