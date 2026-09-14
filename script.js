/* script.js */


/* ================================
   UTM TRACKING
================================ */

const params = new URLSearchParams(
    window.location.search
);


const currentUTM = {

    utm_source:
        params.get("utm_source"),

    utm_medium:
        params.get("utm_medium"),

    utm_campaign:
        params.get("utm_campaign"),

    utm_content:
        params.get("utm_content"),

    utm_term:
        params.get("utm_term")

};


/* Save UTM information */

if (currentUTM.utm_source) {

    localStorage.setItem(
        "aspin_utm",
        JSON.stringify(currentUTM)
    );

}


/* Retrieve saved UTM information */

const savedUTM = JSON.parse(
    localStorage.getItem("aspin_utm") || "{}"
);


/* ================================
   TRAFFIC SOURCE
================================ */

function getTrafficSource() {

    const source =
        savedUTM.utm_source;


    if (source) {
        return source;
    }


    const referrer =
        document.referrer;


    if (!referrer) {
        return "direct";
    }


    if (
        referrer.includes(
            "facebook.com"
        )
    ) {
        return "facebook";
    }


    if (
        referrer.includes(
            "google."
        )
    ) {
        return "google";
    }


    if (
        referrer.includes(
            "tiktok.com"
        )
    ) {
        return "tiktok";
    }


    if (
        referrer.includes(
            "instagram.com"
        )
    ) {
        return "instagram";
    }


    if (
        referrer.includes(
            "youtube.com"
        )
    ) {
        return "youtube";
    }


    return "referral";
}


/* ================================
   ANALYTICS
================================ */

function trackEvent(
    eventName,
    data = {}
) {

    const eventData = {

        ...data,

        traffic_source:
            getTrafficSource(),

        ...savedUTM

    };


    /* Google Analytics */

    if (
        typeof gtag === "function"
    ) {

        gtag(
            "event",
            eventName,
            eventData
        );

    }


    /* Meta Pixel */

    if (
        typeof fbq === "function"
    ) {

        fbq(
            "trackCustom",
            eventName,
            eventData
        );

    }


    /* Development console */

    console.log(
        "ASPIN EVENT:",
        eventName,
        eventData
    );

}


/* ================================
   PAGE VIEW
================================ */

trackEvent(
    "aspin_page_view",
    {
        page:
            window.location.pathname
    }
);


/* ================================
   ALL TRACKED BUTTONS
================================ */

document
    .querySelectorAll(
        "[data-track]"
    )
    .forEach(element => {

        element.addEventListener(
            "click",
            function() {

                trackEvent(
                    this.dataset.track,
                    {

                        button_text:
                            this.textContent.trim(),

                        page:
                            window.location.pathname

                    }
                );

            }
        );

    });


/* ================================
   FAQ TRACKING
================================ */

document
    .querySelectorAll(
        "details[data-track]"
    )
    .forEach(item => {

        item.addEventListener(
            "toggle",
            function() {

                if (this.open) {

                    trackEvent(
                        this.dataset.track,
                        {
                            action: "open"
                        }
                    );

                }

            }
        );

    });


/* ================================
   REGISTER TRACKING
================================ */

document
    .querySelectorAll(
        'a[href*="aspin.vip"]'
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            function() {

                trackEvent(
                    "register_click",
                    {

                        button:
                            this.dataset.track ||
                            this.textContent.trim(),

                        destination:
                            "aspin.vip"

                    }
                );

            }
        );

    });


/* ================================
   STAY UPDATED BUTTON
================================ */

document
    .querySelectorAll('a[href="#subscribe"]')
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                trackEvent(
                    "stay_updated",
                    {
                        button_text:
                            this.textContent.trim(),

                        destination:
                            "subscribe_section",

                        page:
                            window.location.pathname
                    }
                );

            }
        );

    });


/* ================================
   NEWSLETTER
================================ */

const form =
    document.getElementById(
        "subscribeForm"
    );


const success =
    document.getElementById(
        "successMessage"
    );


if (form) {

    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const name =
                document
                    .getElementById("name")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const phone =
                document
                    .getElementById("phone")
                    .value
                    .trim();


            const consent =
                document
                    .getElementById("consent")
                    .checked;


            if (
                !name ||
                !email ||
                !phone ||
                !consent
            ) {

                alert(
                    "Please complete all fields and agree to receive promotional communications."
                );

                return;

            }


            /* Google Analytics */

            if (
                typeof gtag === "function"
            ) {

                gtag(
                    "event",
                    "newsletter_subscribe",
                    {

                        method:
                            "website",

                        traffic_source:
                            getTrafficSource(),

                        ...savedUTM

                    }
                );

            }


            /* Meta Pixel */

            if (
                typeof fbq === "function"
            ) {

                fbq(
                    "track",
                    "Lead",
                    {

                        source:
                            getTrafficSource()

                    }
                );

            }


            /* Success message */

            success.style.display =
                "block";


            form.reset();

        }
    );

}