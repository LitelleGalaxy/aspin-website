const SUPABASE_URL =
    "https://ullucytrbqwibkgklvab.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_rKJtkfPqwKIuEpgL4TRF-g_2IN_0xyc";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );
