/**
 * NEXT-GENERATION CORE ARCHITECTURE — CENTRALISED APPLICATION ENGINE
 * Handles multi-page telemetry, smooth transitions, and Supabase booking storage.
 */

// ==========================================
// SUPABASE CONNECTION
// ==========================================
const supabaseUrl = 'https://hjbrllpbpajzmgpgkadf.supabase.co';
const supabaseKey = 'sb_publishable_KJ0vSBO8QiUFQZ52wyws1A_zxrk39ga';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Next-Gen Legal Engine initialized successfully.");

    // ==========================================
    // 1. GLOBAL COMPONENTS & MULTI-PAGE NAVIGATION TRACKING
    // ==========================================
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll("nav ul li a");

    navLinks.forEach(link => {
        link.classList.remove("active");
        const linkHref = link.getAttribute("href");

        if (currentPath.includes(linkHref) && linkHref !== "index.html") {
            link.classList.add("active");
        } else if ((currentPath === "/" || currentPath.endsWith("index.html")) && linkHref === "index.html") {
            if (!window.location.hash) {
                link.classList.add("active");
            }
        }
    });

    // ==========================================
    // 2. CONTACT PORTAL & BOOKING SUBMISSION ENGINE
    // ==========================================
    const bookingForm = document.getElementById("consultationForm");

    if (bookingForm) {
        const submitBtn = document.getElementById("submitBtn");
        const btnText = submitBtn.querySelector(".btn-text");
        const btnIcon = submitBtn.querySelector("i");

        bookingForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const clientName = document.getElementById("clientName").value.trim();
            const clientEmail = document.getElementById("clientEmail").value.trim();
            const rawPhone = document.getElementById("mpesaPhone").value.trim();
            const practiceArea = document.getElementById("practiceArea").value;

            let formattedPhone = rawPhone;
            if (rawPhone.startsWith("0")) {
                formattedPhone = "254" + rawPhone.substring(1);
            }

            submitBtn.disabled = true;
            submitBtn.style.opacity = "0.7";
            btnText.textContent = "Submitting...";
            btnIcon.className = "fa-solid fa-spinner fa-spin";

            try {
                const { data, error } = await supabase.from('bookings').insert([
                    {
                        full_name: clientName,
                        email: clientEmail,
                        phone: formattedPhone,
                        service_requested: practiceArea
                    }
                ]);

                if (error) throw error;

                alert(
                    `✅ Request Received!\n\n` +
                    `Thank you, ${clientName}.\n` +
                    `Your consultation request has been logged. Our team will contact you shortly to confirm your appointment.\n\n` +
                    `Practice Area: ${practiceArea}`
                );

                bookingForm.reset();

            } catch (error) {
                console.error("Booking Save Exception:", error);
                alert("⛔ Something went wrong saving your request. Please check your connection and try again.");
            } finally {
                submitBtn.disabled = false;
                submitBtn.style.opacity = "1";
                btnText.textContent = "Submit Consultation Request";
                btnIcon.className = "fa-solid fa-paper-plane";
            }
        });
    }
});