import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
// URL вашего проекта Supabase
const SUPABASE_URL = 'https://mweuefcktccktirbejvo.supabase.co'; 

// Ваш Publishable Key
const SUPABASE_KEY = 'sb_publishable_QZoa2MEBrCoX374V7OwXNQ_9V7gCDBq'; 
// ---------------------

const isValidUrl = (url: string) => {
  try { return url.startsWith('http'); } catch (e) { return false; }
};

export const supabase = (isValidUrl(SUPABASE_URL) && SUPABASE_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;

export const isSupabaseConfigured = () => !!supabase;
