// ========================================
// ASPIN.SITE BACK OFFICE LOGIN
// LOGIN.JS
// ========================================


// ========================================
// ELEMENTS
// ========================================

const loginForm =
    document.getElementById(
        "loginForm"
    );

const emailInput =
    document.getElementById(
        "email"
    );

const passwordInput =
    document.getElementById(
        "password"
    );

const loginBtn =
    document.getElementById(
        "loginBtn"
    );

const loginError =
    document.getElementById(
        "loginError"
    );


// ========================================
// SHOW ERROR
// ========================================

function showLoginError(message) {

    if (!loginError) {
        return;
    }

    loginError.textContent =
        message;

    loginError.style.display =
        "block";
}


// ========================================
// CLEAR ERROR
// ========================================

function clearLoginError() {

    if (!loginError) {
        return;
    }

    loginError.textContent =
        "";

    loginError.style.display =
        "none";
}


// ========================================
// CHECK EXISTING SESSION
// ========================================

async function redirectIfAlreadyLoggedIn() {

    try {

        const {
            data: {
                session
            },
            error
        } =
            await supabaseClient
                .auth
                .getSession();


        if (error) {

            console.error(
                "Session check error:",
                error
            );

            return;
        }


        if (session) {

            console.log(
                "Existing session found:",
                session.user?.email
            );


            window.location.replace(
                "index.html"
            );

        }

    } catch (error) {

        console.error(
            "Unable to check session:",
            error
        );

    }
}


// ========================================
// LOGIN
// ========================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            clearLoginError();


            // ========================================
            // GET VALUES
            // ========================================

            const email =
                emailInput
                    ?.value
                    .trim();

            const password =
                passwordInput
                    ?.value || "";


            // ========================================
            // VALIDATION
            // ========================================

            if (!email) {

                showLoginError(
                    "Please enter your email."
                );

                emailInput?.focus();

                return;
            }


            if (!password) {

                showLoginError(
                    "Please enter your password."
                );

                passwordInput?.focus();

                return;
            }


            // ========================================
            // DISABLE BUTTON
            // ========================================

            if (loginBtn) {

                loginBtn.disabled =
                    true;

                loginBtn.textContent =
                    "SIGNING IN...";

            }


            try {

                console.log(
                    "Attempting login..."
                );


                // ========================================
                // SIGN IN
                // ========================================

                const {
                    data,
                    error
                } =
                    await supabaseClient
                        .auth
                        .signInWithPassword({

                            email:
                                email,

                            password:
                                password

                        });


                // ========================================
                // LOGIN ERROR
                // ========================================

                if (error) {

                    console.error(
                        "Supabase login error:",
                        error
                    );


                    showLoginError(
                        error.message ||
                        "Invalid email or password."
                    );


                    if (loginBtn) {

                        loginBtn.disabled =
                            false;

                        loginBtn.textContent =
                            "SIGN IN";

                    }


                    return;
                }


                // ========================================
                // VERIFY SESSION
                // ========================================

                if (
                    !data ||
                    !data.session
                ) {

                    console.error(
                        "Login succeeded but no session was returned."
                    );


                    showLoginError(
                        "Login failed. No session was created."
                    );


                    if (loginBtn) {

                        loginBtn.disabled =
                            false;

                        loginBtn.textContent =
                            "SIGN IN";

                    }


                    return;
                }


                console.log(
                    "Login successful:",
                    data.user?.email
                );


                // ========================================
                // SAVE LOGIN ACTIVITY
                // ========================================

                try {

                    let ipAddress =
                        "Unavailable";


                    try {

                        const response =
                            await fetch(
                                "https://api.ipify.org?format=json",
                                {
                                    cache:
                                        "no-store"
                                }
                            );


                        if (
                            response.ok
                        ) {

                            const ipData =
                                await response.json();


                            ipAddress =
                                ipData.ip ||
                                "Unavailable";

                        }

                    } catch (ipError) {

                        console.warn(
                            "Could not retrieve IP address:",
                            ipError
                        );

                    }


                    const {
                        error:
                            activityError
                    } =
                        await supabaseClient
                            .from(
                                "admin_activity_logs"
                            )
                            .insert({

                                user_id:
                                    data.user.id,

                                user_email:
                                    data.user.email,

                                action:
                                    "LOGIN",

                                ip_address:
                                    ipAddress,

                                user_agent:
                                    navigator.userAgent

                            });


                    if (
                        activityError
                    ) {

                        console.error(
                            "Login activity log failed:",
                            activityError
                        );

                    } else {

                        console.log(
                            "LOGIN activity saved."
                        );

                    }

                } catch (activityError) {

                    console.error(
                        "Activity logging failed:",
                        activityError
                    );

                }


                // ========================================
                // GO TO DASHBOARD
                // ========================================

                window.location.replace(
                    "index.html"
                );

            } catch (error) {

                console.error(
                    "Unexpected login error:",
                    error
                );


                showLoginError(
                    error.message ||
                    "Unable to sign in. Please try again."
                );


                if (loginBtn) {

                    loginBtn.disabled =
                        false;

                    loginBtn.textContent =
                        "SIGN IN";

                }

            }

        }
    );

}


// ========================================
// INITIALIZE LOGIN PAGE
// ========================================

redirectIfAlreadyLoggedIn();

// ========================================
// PASSWORD VISIBILITY TOGGLE
// ========================================

const togglePassword =
    document.getElementById("togglePassword");

if (togglePassword && passwordInput) {

    togglePassword.addEventListener(
        "click",
        function () {

            const isHidden =
                passwordInput.type === "password";


            if (isHidden) {

                passwordInput.type = "text";

                togglePassword.innerHTML =
                    '<span class="eye-icon">◉</span>';

                togglePassword.setAttribute(
                    "aria-label",
                    "Hide password"
                );

                togglePassword.setAttribute(
                    "title",
                    "Hide password"
                );

            } else {

                passwordInput.type = "password";

                togglePassword.innerHTML =
                    '<span class="eye-icon">◉</span>';

                togglePassword.setAttribute(
                    "aria-label",
                    "Show password"
                );

                togglePassword.setAttribute(
                    "title",
                    "Show password"
                );

            }

        }
    );

}