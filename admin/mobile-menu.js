// ========================================
// ASPIN.SITE BACK OFFICE MOBILE MENU
// ========================================

(function () {

    function initMobileMenu() {

        const sidebar =
            document.querySelector(".sidebar");

        if (!sidebar) return;


        // ========================================
        // CREATE MOBILE HEADER
        // ========================================

        if (
            !document.querySelector(
                ".mobile-admin-header"
            )
        ) {

            const header =
                document.createElement("header");

            header.className =
                "mobile-admin-header";

            header.innerHTML = `
                <div class="mobile-admin-brand">

                    <img
                        src="favicon.png"
                        alt="ASPIN"
                    >

                    <div class="mobile-admin-brand-text">

                        <strong>ASPIN.SITE</strong>

                        <span>BACK OFFICE</span>

                    </div>

                </div>

                <button
                    type="button"
                    class="mobile-admin-menu-btn"
                    id="mobileAdminMenuBtn"
                    aria-label="Open menu"
                    aria-expanded="false"
                >

                    <span class="hamburger-lines">

                        <span></span>
                        <span></span>
                        <span></span>

                    </span>

                </button>
            `;

            document.body.insertBefore(
                header,
                document.body.firstChild
            );
        }


        // ========================================
        // CREATE OVERLAY
        // ========================================

        let overlay =
            document.getElementById(
                "adminMenuOverlay"
            );


        if (!overlay) {

            overlay =
                document.createElement("div");

            overlay.id =
                "adminMenuOverlay";

            overlay.className =
                "admin-menu-overlay";

            document.body.appendChild(
                overlay
            );
        }


        // ========================================
        // GET ELEMENTS
        // ========================================

        const menuButton =
            document.getElementById(
                "mobileAdminMenuBtn"
            );


        if (!menuButton) return;


        // ========================================
        // OPEN
        // ========================================

        function openMenu() {

            sidebar.classList.add(
                "mobile-open"
            );

            overlay.classList.add(
                "active"
            );

            document.body.classList.add(
                "admin-menu-open"
            );

            menuButton.setAttribute(
                "aria-expanded",
                "true"
            );

            menuButton.setAttribute(
                "aria-label",
                "Close menu"
            );
        }


        // ========================================
        // CLOSE
        // ========================================

        function closeMenu() {

            sidebar.classList.remove(
                "mobile-open"
            );

            overlay.classList.remove(
                "active"
            );

            document.body.classList.remove(
                "admin-menu-open"
            );

            menuButton.setAttribute(
                "aria-expanded",
                "false"
            );

            menuButton.setAttribute(
                "aria-label",
                "Open menu"
            );
        }


        // ========================================
        // TOGGLE
        // ========================================

        menuButton.addEventListener(
            "click",
            function () {

                if (
                    sidebar.classList.contains(
                        "mobile-open"
                    )
                ) {

                    closeMenu();

                } else {

                    openMenu();

                }

            }
        );


        // ========================================
        // CLICK OUTSIDE
        // ========================================

        overlay.addEventListener(
            "click",
            closeMenu
        );


        // ========================================
        // MENU LINKS
        // ========================================

        sidebar
            .querySelectorAll("nav a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    closeMenu
                );

            });


        // ========================================
        // ESC
        // ========================================

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape"
                ) {

                    closeMenu();

                }

            }
        );


        // ========================================
        // DESKTOP
        // ========================================

        window.addEventListener(
            "resize",
            function () {

                if (
                    window.innerWidth > 700
                ) {

                    closeMenu();

                }

            }
        );

    }


    // ========================================
    // START
    // ========================================

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initMobileMenu
        );

    } else {

        initMobileMenu();

    }

})();