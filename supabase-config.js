// ── Supabase configuration ──
// Replace these two values with your own project credentials.
// Find them at: https://supabase.com/dashboard → your project → Settings → API

const SUPABASE_URL  = 'https://hdyobixeuwflghekhexh.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkeW9iaXhldXdmbGdoZWtoZXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxODYxOTIsImV4cCI6MjA5Mzc2MjE5Mn0.ngvy6tcXk7pVeC5-jkKqKLc4ZP-tpfBc7D-U32W_CL8';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON);
