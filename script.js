/* =========================================================
   ASPIN.SITE FRONTEND JAVASCRIPT
   ========================================================= */

const GAMING_SITE_URL = "https://aspin.vip/";


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function escapeHTML(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function safeURL(value, fallback = "#") {
    if (!value) {
        return fallback;
    }

    try {
        const url = new URL(value, window.location.origin);

        if (
            url.protocol === "http:" ||
            url.protocol === "https:"
        ) {
            return url.href;
        }

    } catch (error) {
        return fallback;
    }

    return fallback;
}


/* =========================================================
   SESSION + UTM TRACKING
   ========================================================= */

function getSessionId() {

    let sessionId =
        sessionStorage.getItem("aspin_session_id");

    if (!sessionId) {

        sessionId =
            `${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}`;

        sessionStorage.setItem(
            "aspin_session_id",
            sessionId
        );
    }

    return sessionId;
}


function getUTMData() {

    const params =
        new URLSearchParams(window.location.search);

    return {
        source:
            params.get("utm_source") || "direct",

        medium:
            params.get("utm_medium") || "none",

        campaign:
            params.get("utm_campaign") || null,

        term:
            params.get("utm_term") || null,

        content:
            params.get("utm_content") || null
    };
}


/* =========================================================
   ANALYTICS
   ========================================================= */

async function trackEvent(
    eventName,
    additionalData = {}
) {

    try {

        if (
            !eventName ||
            eventName.length > 40
        ) {
            return;
        }

        const utm = getUTMData();

        const eventData = {
            event_name: eventName,
            session_id: getSessionId(),
            page_url: window.location.href,
            source: utm.source,
            utm_source: utm.source,
            utm_medium: utm.medium,
            utm_campaign: utm.campaign,
            utm_term: utm.term,
            utm_content: utm.content,
            ...additionalData
        };

        await supabaseClient
            .from("analytics_events")
            .insert(eventData);

    } catch (error) {

        console.warn(
            "Analytics error:",
            error
        );

    }
}


/* =========================================================
   META PIXEL
   ========================================================= */

function trackMetaEvent(
    eventName,
    data = {}
) {

    if (
        typeof window.fbq === "function"
    ) {

        window.fbq(
            "track",
            eventName,
            data
        );

    }
}


/* =========================================================
   TRACK CLICKABLE EVENTS
   ========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const target =
            event.target.closest(
                "[data-event]"
            );

        if (!target) {
            return;
        }

        const eventName =
            target.dataset.event;

        trackEvent(eventName);

        if (
            eventName ===
            "register_click"
        ) {

            trackMetaEvent(
                "Lead"
            );

        }

    }
);


/* =========================================================
   PROMOTIONS
   ========================================================= */

async function loadPromotions() {

    const container =
        document.getElementById(
            "promotionsGrid"
        );

    if (!container) {
        return;
    }

    const {
        data,
        error
    } = await supabaseClient
        .from("promotions")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", {
            ascending: true
        });

    if (error) {

        console.error(
            "Promotions error:",
            error
        );

        container.innerHTML = `
            <div class="loading-state">
                Promotions are currently unavailable.
            </div>
        `;

        return;
    }

    if (!data || data.length === 0) {

        container.innerHTML = `
            <div class="loading-state">
                No promotions are currently available.
            </div>
        `;

        return;
    }

    container.innerHTML =
        data.map(
            promotion => {

                const image =
                    safeURL(
                        promotion.image_url,
                        ""
                    );

                const buttonURL =
                    safeURL(
                        promotion.button_url ||
                        GAMING_SITE_URL,
                        GAMING_SITE_URL
                    );

                return `
                    <article class="promo-card">

                        ${
                            image
                                ? `
                                    <img
                                        src="${escapeHTML(image)}"
                                        alt="${escapeHTML(
                                            promotion.title
                                        )}"
                                        class="promo-image"
                                        loading="lazy"
                                    >
                                `
                                : `
                                    <div class="promo-image"></div>
                                `
                        }

                        <div class="promo-content">

                            ${
                                promotion.label
                                    ? `
                                        <div class="promo-label">
                                            ${escapeHTML(
                                                promotion.label
                                            )}
                                        </div>
                                    `
                                    : ""
                            }

                            <h3>
                                ${escapeHTML(
                                    promotion.title
                                )}
                            </h3>

                            ${
                                promotion.description
                                    ? `
                                        <p>
                                            ${escapeHTML(
                                                promotion.description
                                            )}
                                        </p>
                                    `
                                    : ""
                            }

                            <div class="promo-action">

                                <a
                                    href="${escapeHTML(
                                        buttonURL
                                    )}"
                                    class="btn btn-secondary"
                                    ${
                                        buttonURL.startsWith(
                                            "http"
                                        )
                                            ? `
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            `
                                            : ""
                                    }
                                    data-event="promotion_click"
                                >
                                    ${escapeHTML(
                                        promotion.button_text ||
                                        "LEARN MORE"
                                    )}
                                </a>

                            </div>

                        </div>

                    </article>
                `;
            }
        ).join("");
}


/* =========================================================
   PAYMENTS
   ========================================================= */

async function loadPayments() {

    const container =
        document.getElementById(
            "paymentsGrid"
        );

    if (!container) {
        return;
    }

    const {
        data,
        error
    } = await supabaseClient
        .from("payment_methods")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", {
            ascending: true
        });

    if (error) {

        console.error(
            "Payments error:",
            error
        );

        container.innerHTML = `
            <div class="loading-state">
                Payment information is currently unavailable.
            </div>
        `;

        return;
    }

    if (!data || data.length === 0) {

        container.innerHTML = `
            <div class="loading-state">
                No payment methods are currently available.
            </div>
        `;

        return;
    }

    container.innerHTML =
        data.map(
            payment => {

                const name =
                    payment.name ||
                    payment.title ||
                    "Payment Method";

                return `
                    <article class="payment-card">

                        ${
                            payment.image_url
                                ? `
                                    <img
                                        src="${escapeHTML(
                                            payment.image_url
                                        )}"
                                        alt="${escapeHTML(
                                            name
                                        )}"
                                        class="payment-image"
                                        loading="lazy"
                                    >
                                `
                                : ""
                        }

                        <h3>
                            ${escapeHTML(name)}
                        </h3>

                        ${
                            payment.description
                                ? `
                                    <p>
                                        ${escapeHTML(
                                            payment.description
                                        )}
                                    </p>
                                `
                                : ""
                        }

                    </article>
                `;
            }
        ).join("");
}


/* =========================================================
   FAQ
   ========================================================= */

async function loadFAQs() {

    const container =
        document.getElementById(
            "faqList"
        );

    if (!container) {
        return;
    }

    const {
        data,
        error
    } = await supabaseClient
        .from("faqs")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", {
            ascending: true
        });

    if (error) {

        console.error(
            "FAQ error:",
            error
        );

        container.innerHTML = `
            <div class="loading-state">
                FAQs are currently unavailable.
            </div>
        `;

        return;
    }

    if (!data || data.length === 0) {

        container.innerHTML = `
            <div class="loading-state">
                No FAQs are currently available.
            </div>
        `;

        return;
    }

    container.innerHTML =
        data.map(
            faq => {

                const question =
                    faq.question ||
                    faq.title ||
                    "";

                const answer =
                    faq.answer ||
                    faq.description ||
                    "";

                return `
                    <div class="faq-item">

                        <button
                            class="faq-question"
                            type="button"
                        >

                            <span>
                                ${escapeHTML(
                                    question
                                )}
                            </span>

                            <span class="faq-icon">
                                +
                            </span>

                        </button>

                        <div class="faq-answer">

                            <div class="faq-answer-inner">
                                ${escapeHTML(
                                    answer
                                )}
                            </div>

                        </div>

                    </div>
                `;
            }
        ).join("");


    setupFAQAccordion();
}


function setupFAQAccordion() {

    const questions =
        document.querySelectorAll(
            ".faq-question"
        );

    questions.forEach(
        question => {

            question.addEventListener(
                "click",
                function () {

                    const item =
                        this.closest(
                            ".faq-item"
                        );

                    const answer =
                        item.querySelector(
                            ".faq-answer"
                        );

                    const isActive =
                        item.classList.contains(
                            "active"
                        );


                    document
                        .querySelectorAll(
                            ".faq-item.active"
                        )
                        .forEach(
                            activeItem => {

                                activeItem.classList.remove(
                                    "active"
                                );

                                activeItem
                                    .querySelector(
                                        ".faq-answer"
                                    )
                                    .style.maxHeight =
                                    null;
                            }
                        );


                    if (!isActive) {

                        item.classList.add(
                            "active"
                        );

                        answer.style.maxHeight =
                            answer.scrollHeight +
                            "px";

                    }

                }
            );

        }
    );
}


/* =========================================================
   SITE SETTINGS
   ========================================================= */

async function loadSiteSettings() {

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("site_settings")
            .select("*");

        if (error) {
            console.warn(
                "Settings error:",
                error
            );
            return;
        }

        if (!data) {
            return;
        }

        const settings = {};

        data.forEach(
            item => {
                settings[item.key] =
                    item.value;
            }
        );

        if (
            settings.site_name
        ) {

            document.title =
                `${settings.site_name} | Official`;

        }

        const description =
            document.querySelector(
                'meta[name="description"]'
            );

        if (
            description &&
            settings.site_description
        ) {

            description.setAttribute(
                "content",
                settings.site_description
            );

        }

    } catch (error) {

        console.warn(
            "Unable to load settings:",
            error
        );

    }
}


/* =========================================================
   SUBSCRIPTION
   ========================================================= */

const subscribeForm =
    document.getElementById(
        "subscribeForm"
    );

if (subscribeForm) {

    subscribeForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const email =
                document.getElementById(
                    "subscriberEmail"
                ).value.trim();

            const phone =
                document.getElementById(
                    "subscriberPhone"
                ).value.trim();

            const consent =
                document.getElementById(
                    "subscriberConsent"
                ).checked;

            const message =
                document.getElementById(
                    "subscribeMessage"
                );


            if (!consent) {

                message.textContent =
                    "Please accept the subscription consent.";

                return;
            }


            message.textContent =
                "Submitting...";


            const {
                error
            } = await supabaseClient
                .from("subscribers")
                .insert({
                    email: email,
                    phone: phone,
                    consent: true,
                    is_active: true
                });


            if (error) {

                console.error(
                    "Subscription error:",
                    error
                );

                if (
                    error.code ===
                    "23505"
                ) {

                    message.textContent =
                        "This email is already subscribed.";

                } else {

                    message.textContent =
                        "Unable to subscribe right now. Please try again.";

                }

                return;
            }


            message.textContent =
                "Thank you. You are now subscribed.";

            subscribeForm.reset();

            trackEvent(
                "newsletter_subscribe",
                {
                    subscription_method:
                        "website_form"
                }
            );

            trackMetaEvent(
                "CompleteRegistration"
            );

        }
    );
}


/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

const mobileMenuBtn =
    document.getElementById(
        "mobileMenuBtn"
    );

const mobileNav =
    document.getElementById(
        "mobileNav"
    );


if (
    mobileMenuBtn &&
    mobileNav
) {

    mobileMenuBtn.addEventListener(
        "click",
        function () {

            const isOpen =
                mobileNav.classList.toggle(
                    "active"
                );

            mobileMenuBtn.setAttribute(
                "aria-expanded",
                isOpen
            );

        }
    );


    mobileNav
        .querySelectorAll("a")
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    function () {

                        mobileNav.classList.remove(
                            "active"
                        );

                        mobileMenuBtn.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }
                );

            }
        );
}


/* =========================================================
   PAGE VIEW
   ========================================================= */

trackEvent(
    "page_view",
    {
        page_title:
            document.title
    }
);


/* =========================================================
   CURRENT YEAR
   ========================================================= */

const year =
    document.getElementById(
        "currentYear"
    );

if (year) {

    year.textContent =
        new Date().getFullYear();

}


/* =========================================================
   INITIAL LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await Promise.all([
            loadPromotions(),
            loadPayments(),
            loadFAQs(),
            loadSiteSettings()
        ]);

    }
);
