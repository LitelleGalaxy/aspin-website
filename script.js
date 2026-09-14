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
/* =========================================
   DYNAMIC PROMOTIONS
   ========================================= */

async function loadPublicPromotions() {

    const promoGrid = document.getElementById("promoGrid");

    if (!promoGrid || typeof supabaseClient === "undefined") {
        return;
    }

    const { data, error } = await supabaseClient
        .from("promotions")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

    if (error) {

        console.error(
            "Unable to load promotions:",
            error
        );

        return;
    }

    promoGrid.innerHTML = "";

    if (!data || data.length === 0) {

        promoGrid.innerHTML = `
            <div class="promo-empty">
                <p>No promotions available at this time.</p>
            </div>
        `;

        return;
    }

    data.forEach((promotion) => {

        const card = document.createElement("article");

        card.className = "promo-card";


        /* IMAGE */

        const image = document.createElement("div");

        image.className = "promo-image";


        if (promotion.image_url) {

            image.style.backgroundImage =
                `url("${promotion.image_url}")`;

            image.style.backgroundSize = "cover";
            image.style.backgroundPosition = "center";
            image.style.backgroundRepeat = "no-repeat";

        } else {

            image.textContent = "ASPIN";

        }


        /* CONTENT */

        const content = document.createElement("div");

        content.className = "promo-content";


        /* LABEL */

        const label = document.createElement("p");

        label.className = "promo-label";

        label.textContent =
            promotion.label || "FEATURED";


        /* TITLE */

        const title = document.createElement("h3");

        title.textContent =
            promotion.title;


        /* DESCRIPTION */

        const description = document.createElement("p");

        description.textContent =
            promotion.description || "";


        /* BUTTON */

        const button = document.createElement("a");

        button.href =
            promotion.button_url || "https://aspin.vip/";

        button.textContent =
            `${promotion.button_text || "LEARN MORE"} →`;

        button.target = "_blank";
        button.rel = "noopener noreferrer";


        button.addEventListener("click", function () {

            if (typeof trackEvent === "function") {

                trackEvent(
                    "promotion_click",
                    {
                        promotion_id: String(promotion.id),
                        promotion_title: promotion.title
                    }
                );

            }

        });


        /* BUILD CARD */

        content.appendChild(label);
        content.appendChild(title);
        content.appendChild(description);
        content.appendChild(button);

        card.appendChild(image);
        card.appendChild(content);

        promoGrid.appendChild(card);

    });

}


/* Load promotions when page is ready */

document.addEventListener(
    "DOMContentLoaded",
    loadPublicPromotions
);
