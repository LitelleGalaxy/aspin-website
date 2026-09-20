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

const emailInput =
    document.getElementById(
        "email"
    );


emailInput.addEventListener(
    "input",
    function () {

        if (/\s/.test(this.value)) {

            this.setCustomValidity(
                "Email address must not contain spaces."
            );

        } else if (
            this.value &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value)
        ) {

            this.setCustomValidity(
                "Please enter a valid email address."
            );

        } else {

            this.setCustomValidity("");

        }

    }
);

const explorePromotionsBtn =
    document.getElementById("explorePromotionsBtn");

const exitSuccessBtn =
    document.getElementById("exitSuccessBtn");


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
                !email ||
                !consent
            ) {

                alert(
                    "Please enter your email address and agree to receive promotional communications."
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

            form.reset();

            successModal.classList.add("active");

        }
    );

}

/* ================================
   SUBSCRIPTION SUCCESS MODAL
================================ */

if (successModal) {

    exitSuccessBtn.addEventListener(
        "click",
        function () {
            successModal.classList.remove("active");
        }
    );


    explorePromotionsBtn.addEventListener(
        "click",
        function () {

            successModal.classList.remove("active");

            const promotions =
                document.getElementById("promotions");

            if (promotions) {
                promotions.scrollIntoView({
                    behavior: "smooth"
                });
            }

        }
    );


    document
        .querySelector(".success-modal-overlay")
        .addEventListener(
            "click",
            function () {
                successModal.classList.remove("active");
            }
        );


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                successModal.classList.contains("active")
            ) {
                successModal.classList.remove("active");
            }

        }
    );

}

/* =========================================
   DYNAMIC PROMOTIONS
========================================= */

function formatPromotionDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date = new Date(
        `${dateString}T00:00:00`
    );

    if (isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString(
        "en-US",
        {
            month: "long",
            day: "numeric",
            year: "numeric"
        }
    );
}


function isPromotionCurrentlyPublished(promotion) {

    const now = new Date();

    /*
     * If PUBLISH START is set,
     * don't show the promotion before that time.
     */

    if (
        promotion.publish_start_at
    ) {

        const publishStart =
            new Date(
                promotion.publish_start_at
            );

        if (
            !isNaN(publishStart.getTime()) &&
            now < publishStart
        ) {

            return false;

        }

    }


    /*
     * If PUBLISH END is set,
     * stop showing the promotion after that time.
     */

    if (
        promotion.publish_end_at
    ) {

        const publishEnd =
            new Date(
                promotion.publish_end_at
            );

        if (
            !isNaN(publishEnd.getTime()) &&
            now > publishEnd
        ) {

            return false;

        }

    }


    return true;

}


async function loadPublicPromotions() {

    const promoGrid =
        document.getElementById(
            "promoGrid"
        );


    if (
        !promoGrid ||
        typeof supabaseClient ===
        "undefined"
    ) {

        return;

    }


    const {
        data,
        error
    } = await supabaseClient

        .from("promotions")

        .select("*")

        .eq(
            "is_published",
            true
        )

        .eq(
            "is_active",
            true
        )

        .order(
            "sort_order",
            {
                ascending: true
            }
        )

        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Unable to load promotions:",
            error
        );

        promoGrid.innerHTML = `

            <div class="promo-empty">

                <p>
                    Unable to load promotions.
                </p>

            </div>

        `;

        return;

    }


    /*
     * Apply PUBLISH START / PUBLISH END.
     *
     * These dates control website visibility.
     *
     * PROMO START / PROMO END do NOT
     * control visibility.
     */

    const visiblePromotions =
        (data || []).filter(
            promotion =>
                isPromotionCurrentlyPublished(
                    promotion
                )
        );


    promoGrid.innerHTML = "";


    if (
        visiblePromotions.length ===
        0
    ) {

        promoGrid.innerHTML = `

            <div class="promo-empty">

                <p>
                    No promotions available at this time.
                </p>

            </div>

        `;

        return;

    }


    visiblePromotions.forEach(
        promotion => {


            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "promo-card";


            /* =========================
               IMAGE
            ========================= */

            const image =
                document.createElement(
                    "div"
                );

            image.className =
                "promo-image";


            if (
                promotion.image_url
            ) {

                image.style.backgroundImage =
                    `url("${promotion.image_url}")`;

                image.style.backgroundSize =
                    "cover";

                image.style.backgroundPosition =
                    "center";

                image.style.backgroundRepeat =
                    "no-repeat";

            }

            else {

                image.textContent =
                    "ASPIN";

            }


            /* =========================
               CONTENT
            ========================= */

            const content =
                document.createElement(
                    "div"
                );

            content.className =
                "promo-content";


            /* LABEL */

            const label =
                document.createElement(
                    "p"
                );

            label.className =
                "promo-label";

            label.textContent =
                promotion.label ||
                "FEATURED";


            /* TITLE */

            const title =
                document.createElement(
                    "h3"
                );

            title.textContent =
                promotion.title;


           /* =========================================
   DESCRIPTION
========================================= */

const descriptionWrap =
    document.createElement("div");

descriptionWrap.className =
    "promo-description-wrap";


const description =
    document.createElement("p");

description.className =
    "promo-description";

description.textContent =
    promotion.description ||
    "";


descriptionWrap.appendChild(
    description
);


/* =========================================
   READ MORE / SHOW LESS
========================================= */

const fullDescription =
    promotion.description || "";


/*
 * Only show READ MORE when the
 * description is actually long.
 */

if (
    fullDescription.length > 120
) {

    const readMore =
        document.createElement("button");

    readMore.type =
        "button";

    readMore.className =
        "promo-read-more";

    readMore.textContent =
        "READ MORE";


    readMore.addEventListener(
        "click",
        function () {

            const card =
                readMore.closest(
                    ".promo-card"
                );


            if (
                card.classList.contains(
                    "expanded"
                )
            ) {

                card.classList.remove(
                    "expanded"
                );

                readMore.textContent =
                    "READ MORE";


                /*
                 * Return the visitor to the
                 * top of the card content.
                 */

                card.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                });

            }

            else {

                card.classList.add(
                    "expanded"
                );

                readMore.textContent =
                    "SHOW LESS";

            }

        }
    );


    descriptionWrap.appendChild(
        readMore
    );

}


            /* =========================
               PROMOTION DURATION
            ========================= */

            const duration =
                document.createElement(
                    "div"
                );

            duration.className =
                "promo-duration";


            if (
                promotion.start_date &&
                promotion.end_date
            ) {

                duration.innerHTML = `

                    <span class="promo-duration-label">
                        PROMO PERIOD
                    </span>

                    <span class="promo-duration-dates">
                        ${formatPromotionDate(
                            promotion.start_date
                        )}
                        -
                        ${formatPromotionDate(
                            promotion.end_date
                        )}
                    </span>

                `;

            }

            else if (
                promotion.start_date
            ) {

                duration.innerHTML = `

                    <span class="promo-duration-label">
                        PROMO STARTS
                    </span>

                    <span class="promo-duration-dates">
                        ${formatPromotionDate(
                            promotion.start_date
                        )}
                    </span>

                `;

            }

            else if (
                promotion.end_date
            ) {

                duration.innerHTML = `

                    <span class="promo-duration-label">
                        PROMO ENDS
                    </span>

                    <span class="promo-duration-dates">
                        ${formatPromotionDate(
                            promotion.end_date
                        )}
                    </span>

                `;

            }


            /* =========================
               BUTTON
            ========================= */

            const button =
                document.createElement(
                    "a"
                );

            button.href =
                promotion.button_url ||
                "https://aspin.vip/";

            button.textContent =
                `${
                    promotion.button_text ||
                    "LEARN MORE"
                } →`;

            button.target =
                "_blank";

            button.rel =
                "noopener noreferrer";


            button.addEventListener(
                "click",
                function () {

                    if (
                        typeof trackEvent ===
                        "function"
                    ) {

                        trackEvent(
                            "promotion_click",
                            {
                                promotion_id:
                                    String(
                                        promotion.id
                                    ),

                                promotion_title:
                                    promotion.title
                            }
                        );

                    }

                }
            );


            /* =========================
               BUILD CARD
            ========================= */

            content.appendChild(
                label
            );

            content.appendChild(
                title
            );

            content.appendChild(
                descriptionWrap
            );


            /*
             * Only add the duration
             * if at least one promo
             * date exists.
             */

            if (
                promotion.start_date ||
                promotion.end_date
            ) {

                content.appendChild(
                    duration
                );

            }


            content.appendChild(
                button
            );


            card.appendChild(
                image
            );

            card.appendChild(
                content
            );


            promoGrid.appendChild(
                card
            );

        }
    );

}


/* Load promotions when page is ready */

document.addEventListener(
    "DOMContentLoaded",
    loadPublicPromotions
);


/* =========================================
   PROMOTION CONTENT MODAL
========================================= */

function openPromotionModal(
    title,
    content
) {

    let modal =
        document.getElementById(
            "promotionContentModal"
        );


    if (!modal) {

        modal =
            document.createElement("div");

        modal.id =
            "promotionContentModal";

        modal.className =
            "promotion-content-modal";


        modal.innerHTML = `

            <div class="promotion-modal-overlay"></div>

            <div class="promotion-modal-box">

                <button
                    type="button"
                    class="promotion-modal-close"
                    id="promotionModalClose"
                >
                    ×
                </button>

                <h2 id="promotionModalTitle"></h2>

                <div
                    id="promotionModalContent"
                    class="promotion-modal-content"
                ></div>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        document
            .getElementById(
                "promotionModalClose"
            )
            .addEventListener(
                "click",
                function () {

                    modal.classList.remove(
                        "active"
                    );

                }
            );


        document
            .querySelector(
                ".promotion-modal-overlay"
            )
            .addEventListener(
                "click",
                function () {

                    modal.classList.remove(
                        "active"
                    );

                }
            );

    }


    document
        .getElementById(
            "promotionModalTitle"
        )
        .textContent =
        title;


    document
        .getElementById(
            "promotionModalContent"
        )
        .textContent =
        content;


    modal.classList.add(
        "active"
    );

}


/* =========================================
   DYNAMIC FAQS
========================================= */

async function loadPublicFaqs() {

    const faqContainer =
        document.querySelector(
            ".faq-container"
        );


    if (
        !faqContainer ||
        typeof supabaseClient === "undefined"
    ) {
        return;
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("faqs")
        .select(
            "id, question, answer, sort_order, created_at"
        )
        .eq("is_published", true)
        .order("sort_order", {
            ascending: true
        })
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(
            "Unable to load FAQs:",
            error
        );

        return;
    }


    faqContainer.innerHTML = "";


    if (!data || !data.length) {

        faqContainer.innerHTML = `
            <p class="faq-empty">
                No FAQs available at this time.
            </p>
        `;

        return;
    }


    data.forEach(
        (faq, index) => {

            const details =
                document.createElement("details");

            details.dataset.track =
                `faq_${faq.id}`;


            const summary =
                document.createElement("summary");

            summary.textContent =
                faq.question;


            const answer =
                document.createElement("p");

            answer.textContent =
                faq.answer;


            details.appendChild(
                summary
            );

            details.appendChild(
                answer
            );


            details.addEventListener(
                "toggle",
                function () {

                    if (
                        this.open &&
                        typeof trackEvent ===
                        "function"
                    ) {

                        trackEvent(
                            "faq_open",
                            {
                                faq_id:
                                    String(faq.id),

                                question:
                                    faq.question
                            }
                        );

                    }

                }
            );


            faqContainer.appendChild(
                details
            );

        }
    );

}


/* =========================================
   LOAD CMS CONTENT
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadPublicPromotions();
        loadPublicFaqs();

    }
);

/* =========================
   MOBILE MENU AUTO-CLOSE
========================= */

const mobileMenuToggle =
    document.getElementById("mobile-menu-toggle");

const mobileMenu =
    document.querySelector(".navbar nav");

const mobileMenuButton =
    document.querySelector(".mobile-menu-button");


/* Close menu when clicking a navigation link */
if (mobileMenu && mobileMenuToggle) {

    mobileMenu
        .querySelectorAll("a")
        .forEach(link => {

            link.addEventListener("click", () => {

                mobileMenuToggle.checked = false;

            });

        });
}


/* Close menu when clicking outside the navbar */
document.addEventListener("click", (event) => {

    if (!mobileMenuToggle || !mobileMenu) {
        return;
    }

    if (!mobileMenuToggle.checked) {
        return;
    }

    const navbar =
        document.querySelector(".navbar");

    if (
        navbar &&
        !navbar.contains(event.target)
    ) {

        mobileMenuToggle.checked = false;

    }

});

/* Close menu when pressing ESC */
document.addEventListener("keydown", (event) => {

    if (
        event.key === "Escape" &&
        mobileMenuToggle
    ) {

        mobileMenuToggle.checked = false;

    }

});
