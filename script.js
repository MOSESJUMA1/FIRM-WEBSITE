let dbClient

window.addEventListener('load' ,() => {
    const supabaseUrl = "https://hjbrllpbpajzmgpgkadf.supabase.co/";
    const supabasekey = "sb_publishable_KJ0vSBO8Q1UFQZ52wywslA_zxrkJ9ga";

    if (window.supabase) {
        dbClient = window.supabase.createClient(supabaseUrl, supabasekey);
    } else {
        console.error("Supabase CDN failed to load in time!");
    }
});
document.addEventListener('DOMContentLoaded', async () => { 
    console.log("Next-Gen legal Engine initialized successfully."); 
    
    // 1. Fix Nav Link Activation Logic
    const currentPath = window.location.pathname; 
    const navLinks = document.querySelectorAll("nav ul li a"); 
    
    navLinks.forEach(link => { 
        link.classList.remove("active"); 
        const linkHref = link.getAttribute("href"); 
        
        if (currentPath.includes(linkHref) && linkHref !== "index.html") { 
            link.classList.add("active"); // Fixed: Added class assignment here
        } else if ((currentPath === "/" || currentPath.endsWith("index.html")) && linkHref === "index.html") { 
            if (!window.location.hash) { 
                link.classList.add("active"); 
            } 
        } 
    }); 

    // 2. Consultation Booking Handling
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
            const practiceArea = document.getElementById("practiceArea").value.trim(); 
            
            let formattedPhone = rawPhone; 
            if (rawPhone.startsWith("0")) { 
                formattedPhone = "+254" + rawPhone.substring(1); 
            } 

            submitBtn.disabled = true; 
            submitBtn.style.opacity = "0.7"; 
            btnText.textContent = "submitting..."; 
            btnIcon.className = "fa-solid fa-spinner fa-spin"; 

            try { 
                const { data, error } = await dbClient.from('bookings').insert([ 
                    { 
                        full_name: clientName, 
                        email: clientEmail, 
                        phone: formattedPhone, 
                        service_requested: practiceArea, 
                    } 
                ]); 

                if (error) throw error; // Fixed: Removed stray '|'

                // Fixed: Swapped single quotes to backticks and closed all string brackets
                alert(`Request Received!\n\nThank you, ${clientName}.\nYour consultation request has been logged. Our team will contact you shortly.\n\nPractice Area: ${practiceArea}`); 
                
                bookingForm.reset(); 
            } catch (error) { 
                console.error("Booking Save Exception:", error); 
                alert("Something went wrong. Please try again."); 
            } finally { 
                submitBtn.disabled = false; 
                submitBtn.style.opacity = "1"; 
                btnText.textContent = "Submit Consulation Request"; 
                btnIcon.className = "fa-solid fa-paper-plane"; 
            } 
        }); // Fixed: Properly closed event listener
    } 
}); // Fixed: Properly closed DOMContentLoaded event listener