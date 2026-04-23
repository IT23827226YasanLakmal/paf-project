import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://xmrohvlpqsuzglxnqiff.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtcm9odmxwcXN1emdseG5xaWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NzI0NjcsImV4cCI6MjA5MDI0ODQ2N30.tPfZGmerKOhTrhdrPkPBZ7EoxyeW3cYIaf4G8ysYyWI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);