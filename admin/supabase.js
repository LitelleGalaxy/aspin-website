// supabase.js

const SUPABASE_URL =
    "https://ullucytrbqwibkgklvab.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_rKJtkfPqwKIuEpgL4TRF-g_2IN_0xyc";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* =========================================================
   SESSION PROTECTION
========================================================= */

const isLoginPage =
  window.location.pathname
    .toLowerCase()
    .endsWith("login.html");


function redirectToLogin() {

  if (isLoginPage) {
    return;
  }

  window.location.replace("login.html");
}


/* Supabase authentication listener */

supabaseClient.auth.onAuthStateChange(
  (event, session) => {

    if (event === "SIGNED_OUT") {
      redirectToLogin();
      return;
    }

    if (
      event === "TOKEN_REFRESHED" &&
      !session
    ) {
      redirectToLogin();
    }
  }
);


/* Extra session check every minute */

if (!isLoginPage) {

  setInterval(async () => {

    const {
      data: { session }
    } = await supabaseClient.auth.getSession();

    if (!session) {
      redirectToLogin();
    }

  }, 60000);
}