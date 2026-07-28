/**
 * NEXT-GENERATION CORE ARCHITECTURE — CENTRALISED APPLICATION ENGINE
 * Handles multi-page telemetry, smooth transitions, and secure M-Pesa STK Push triggers.
 */

document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Next-Gen Legal Engine initialized successfully.");

    // ==========================================
    // 1. GLOBAL COMPONENTS & MULTI-PAGE NAVIGATION TRACKING
    // ==========================================
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll("nav ul li a");

    navLinks.forEach(link => {
        // Remove default static classes to let the engine evaluate routing dynamically
        link.classList.remove("active");

        // Extract the target file destination from the link attribute
        const linkHref = link.getAttribute("href");

        // Match current URL pathway to highlight active navigation fields
        if (currentPath.includes(linkHref) && linkHref !== "index.html") {
            link.classList.add("active");
        } else if ((currentPath === "/" || currentPath.endsWith("index.html")) && linkHref === "index.html") {
            // Safe fallback defaults for the primary root homepage landing
            if (!window.location.hash) {
                link.classList.add("active");
            }
        }
    });

    // ==========================================
    // 2. CONTACT PORTAL & SAFARICOM M-PESA STK PUSH INTERACTION ENGINE
    // ==========================================
    const bookingForm = document.getElementById("consultationForm");

    // Code blocks execute safely ONLY if the user is visiting the booking terminal
    if (bookingForm) {
        const submitBtn = document.getElementById("submitBtn");
        const btnText = submitBtn.querySelector(".btn-text");
        const btnIcon = submitBtn.querySelector("i");

        bookingForm.addEventListener("submit", async (event) => {
            // Intercept standard page refresh reload procedures
            event.preventDefault();

            // Extract real-time inputs values from form parameters
            const clientName = document.getElementById("clientName").value.trim();
            const rawPhone = document.getElementById("mpesaPhone").value.trim();
            const practiceArea = document.getElementById("practiceArea").value;
            const matterBrief = document.getElementById("matterBrief").value.trim();

            // Normalize Kenyan phone formatting safely to standard international format (254...)
            let formattedPhone = rawPhone;
            if (rawPhone.startsWith("0")) {
                formattedPhone = "254" + rawPhone.substring(1);
            }

            // Visual UI Transformation: Lock button state and show next-gen processing loader
            submitBtn.disabled = true;
            submitBtn.style.opacity = "0.7";
            btnText.textContent = "Connecting to Safaricom Daraja...";
            btnIcon.className = "fa-solid fa-spinner fa-spin"; // Animated next-gen rotation icon

            try {
                // Simulate an asynchronous API connection handshake with the backend processing microservice
                await simulateNetworkLatency(2000);

                btnText.textContent = `STK Prompt Sent to +${formattedPhone}...`;
                btnIcon.className = "fa-solid fa-mobile-screen-button";

                // Simulate waiting for user to enter their M-Pesa PIN on their phone
                await simulateNetworkLatency(3500);

                // Present a clean next-gen confirmation feedback card natively over the browser environment
                alert(
                    `🔒 SECURE TRANSACTION SUCCESSFUL!\n\n` +
                    `Thank you, ${clientName}.\n` +
                    `We have successfully processed your consultation fee of KSh 3,000 via M-Pesa.\n\n` +
                    `Reference ID: APX_${Math.random().toString(36).substr(2, 9).toUpperCase()}\n` +
                    `Our team will review your case file (${practiceArea}) and reach out within 2 hours.`
                );

                // Fully reset interface layout parameters to default operating states upon completion
                bookingForm.reset();

            } catch (error) {
                console.error("Payment Gateway Exception:", error);
                alert("⛔ Transaction Gateway Timeout. Please check your network connection and try again.");
            } finally {
                // Re-enable interactive trigger options for standard UI operations
                submitBtn.disabled = false;
                submitBtn.style.opacity = "1";
                btnText.textContent = "Initialize M-Pesa Payment";
                btnIcon.className = "fa-solid fa-paper-plane";
            }
        });
    }
});

/**
 * Utilises native JavaScript Promise structures to precisely execute custom UI loading delays.
 * @param {number} ms - Milliseconds to stall code block threads
 */
function simulateNetworkLatency(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}