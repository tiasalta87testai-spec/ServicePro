import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cpmahijvqjxlmxhtenga.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwbWFoaWp2cWp4bG14aHRlbmdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MjM5ODcsImV4cCI6MjA4NzQ5OTk4N30.Po0EpA3xsZa7ZTd_JPfRBvwPMWFxMponv8NDcagKjk4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
