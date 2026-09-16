// ========================================
// ASPIN.SITE BACK OFFICE ADMIN.JS
// ========================================


// ========================================
// AUTH CHECK
// ========================================

async function requireAdmin() {

    try {

        const {
            data: { session },
            error
        } = await supabaseClient.auth.getSession();

        if (error) {
            console.error("Authentication error:", error);
        }

        if (!session) {
            window.location.replace("login.html");
            return null;
        }

        return session;

    } catch (error) {

        console.error(
            "Authentication check failed:",
            error
        );

        window.location.replace("login.html");

        return null;
    }
}


// ========================================
// DASHBOARD
// ========================================

async function loadDashboard() {

    // Only run Dashboard code when the
    // Dashboard elements actually exist.

    const adminEmail =
        document.getElementById("adminEmail");

    const dbStatus =
        document.getElementById("dbStatus");

    const promotionCount =
        document.getElementById("promotionCount");

    const subscriberCount =
        document.getElementById("subscriberCount");

    const registerClicks =
        document.getElementById("registerClicks");

    const eventCount =
        document.getElementById("eventCount");


    if (
        !adminEmail ||
        !dbStatus ||
        !promotionCount ||
        !subscriberCount ||
        !registerClicks ||
        !eventCount
    ) {
        return;
    }


    // ========================================
    // AUTH
    // ========================================

    const session =
        await requireAdmin();

    if (!session) {
        return;
    }


    adminEmail.textContent =
        session.user?.email || "";


    // ========================================
    // DATABASE STATUS
    // ========================================

    dbStatus.textContent =
        "CHECKING";

    dbStatus.className = "";


    // ========================================
    // DATABASE TIMEOUT
    // ========================================

    const timeoutPromise =
        new Promise((_, reject) => {

            setTimeout(() => {

                reject(
                    new Error(
                        "Database request timed out."
                    )
                );

            }, 10000);

        });


    try {

        const databasePromise =
            Promise.all([

                supabaseClient
                    .from("promotions")
                    .select("id", {
                        count: "exact",
                        head: true
                    })
                    .eq(
                        "is_published",
                        true
                    ),

                supabaseClient
                    .from("subscribers")
                    .select("id", {
                        count: "exact",
                        head: true
                    })
                    .eq(
                        "is_active",
                        true
                    ),

                supabaseClient
                    .from("analytics_events")
                    .select("id", {
                        count: "exact",
                        head: true
                    })
                    .eq(
                        "event_name",
                        "register_click"
                    ),

                supabaseClient
                    .from("analytics_events")
                    .select("id", {
                        count: "exact",
                        head: true
                    })

            ]);


        // Race database against 10-second timeout

        const [
            promotions,
            subscribers,
            registerClicksResult,
            events
        ] =
            await Promise.race([
                databasePromise,
                timeoutPromise
            ]);


        // ========================================
        // CHECK DATABASE ERRORS
        // ========================================

        const results = [

            promotions,

            subscribers,

            registerClicksResult,

            events

        ];


        const firstError =
            results.find(
                result => result.error
            );


        if (firstError) {

            throw firstError.error;

        }


        // ========================================
        // DATABASE CONNECTED
        // ========================================

        dbStatus.textContent =
            "CONNECTED";

        dbStatus.className =
            "status-ok";


        // ========================================
        // UPDATE COUNTS
        // ========================================

        promotionCount.textContent =
            formatNumber(
                promotions.count
            );


        subscriberCount.textContent =
            formatNumber(
                subscribers.count
            );


        registerClicks.textContent =
            formatNumber(
                registerClicksResult.count
            );


        eventCount.textContent =
            formatNumber(
                events.count
            );


    } catch (error) {

        console.error(
            "Dashboard database error:",
            error
        );


        // ========================================
        // DATABASE ERROR
        // ========================================

        dbStatus.textContent =
            "ERROR";

        dbStatus.className =
            "status-warning";


        promotionCount.textContent =
            "—";

        subscriberCount.textContent =
            "—";

        registerClicks.textContent =
            "—";

        eventCount.textContent =
            "—";

    }

}


// ========================================
// NUMBER FORMAT
// ========================================

function formatNumber(value) {

    const number =
        Number(value);

    if (
        !Number.isFinite(number)
    ) {
        return "0";
    }

    return number.toLocaleString();
}


// ========================================
// LOGOUT
// ========================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async function () {

            logoutBtn.disabled =
                true;

            logoutBtn.textContent =
                "LOGGING OUT...";


            try {

                const {
                    error
                } =
                    await supabaseClient
                        .auth
                        .signOut();


                if (error) {

                    console.error(
                        "Logout error:",
                        error
                    );

                }

            } finally {

                window.location.replace(
                    "login.html"
                );

            }

        }
    );

}


// ========================================
// START
// ========================================

loadDashboard();