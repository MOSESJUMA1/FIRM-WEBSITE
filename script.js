/**
 * NEXT-GENERATION CORE ARCHITECTURE — CENTRALISED APPLICATION ENGINE
 * Handles multi-page telemetry, smooth transitions, and Supabase booking storage.
 */

// ==========================================
// SUPABASE CONNECTION
// ==========================================
const supabaseUrl = 'https://hjbrllpbpajzmgpgkadf.supabase.co';
const supabaseKey = 'sb_publishable_KJ0vSBO8Q1UFQZ52wywslA_zxrkJ9ga';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

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
    // 2. CONTACT PORTAL & BOOKING SUBMISSION ENGINE
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
            const clientEmail = document.getElementById("clientEmail").value.trim();
            const rawPhone = document.getElementById("mpesaPhone").value.trim();
            const practiceArea = document.getElementById("practiceArea").value;
            const matterBrief = document.getElementById("matterBrief").value.trim();

            // Normalize Kenyan phone formatting safely to standard international format (254...)
            let formattedPhone = rawPhone;
            if (rawPhone.startsWith("0")) {
                formattedPhone = "254" + rawPhone.substring(1);
            }

            // Visual UI Transformation: Lock button state and show processing loader
            submitBtn.disabled = true;
            submitBtn.style.opacity = "0.7";
            btnText.textContent = "Submitting...";
            btnIcon.className = "fa-solid fa-spinner fa-spin";

            try {
                // Save the booking to Supabase
                const { data, error } = await supabase.from('bookings').insert([
                    {
                        full_name: clientName,
                        email: clientEmail,
                        phone: formattedPhone,
                        service_requested: practiceArea
                    }
                ]);

                if (error) throw error;

                // Present a clean confirmation feedback card
                alert(
                    `✅ Request Received!\n\n` +
                    `Thank you, ${clientName}.\n` +
                    `Your consultation request has been logged. Our team will contact you shortly to confirm your appointment.\n\n` +
                    `Practice Area: ${practiceArea}`
                );

                // Fully reset interface layout parameters to default operating states upon completion
                bookingForm.reset();

            } catch (error) {
                console.error("Booking Save Exception:", error);
                alert("⛔ Something went wrong saving your request. Please check your connection and try again.");
            } finally {
                // Re-enable interactive trigger options for standard UI operations
                submitBtn.disabled = false;
                submitBtn.style.opacity = "1";
                btnText.textContent = "Submit Consultation Request";
                btnIcon.className = "fa-solid fa-paper-plane";
            }
        });
    }
});