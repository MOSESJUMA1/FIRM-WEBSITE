/**
 * APEX LEGAL
 * Authentication + Role Based Access Control
 *
 * Roles: admin, advocate
 */

(function(){

"use strict";


const CONFIG = {

    SUPABASE_URL:
    "https://hjbrllpbpajzmgpgkadf.supabase.co",

    SUPABASE_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqYnJsbHBicGFxem1ncGdrYWRmIiwiaWF0IjoxNzg2Njk2MTkyLCJleHAiOjIxMDIyNzIxOTJ9.MeUv7ugRF0QMXamvgVdJ0oFvpdnxBAgH3efi8Hnszv4",

    SESSION_TIME:
    8 * 60 * 60 * 1000

};


let sb = null;



function init(){

    if(!window.supabase){
        console.error("[ApexAuth] window.supabase not found. Make sure the Supabase CDN script loads BEFORE auth.js.");
        return;
    }

    try{
        sb = supabase.createClient(
            CONFIG.SUPABASE_URL,
            CONFIG.SUPABASE_KEY
        );
        console.log("[ApexAuth] Supabase client initialized.");
    }catch(err){
        console.error("[ApexAuth] Failed to create Supabase client:", err);
        sb = null;
    }

}




async function hashPassword(password){

    const data = new TextEncoder().encode(password);

    const hash = await crypto.subtle.digest("SHA-256", data);

    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

}





function createSession(role, id, name, email){

    sessionStorage.setItem("apex_role",   role);
    sessionStorage.setItem("apex_id",     id);
    sessionStorage.setItem("apex_name",   name);
    sessionStorage.setItem("apex_email",  email);
    sessionStorage.setItem("apex_time",   String(Date.now()));

}





function getSession(){

    const time = Number(sessionStorage.getItem("apex_time"));

    if(!time){
        return null;
    }

    if(Date.now() - time > CONFIG.SESSION_TIME){
        logout();
        return null;
    }

    return {
        role:  sessionStorage.getItem("apex_role"),
        id:    sessionStorage.getItem("apex_id"),
        name:  sessionStorage.getItem("apex_name"),
        email: sessionStorage.getItem("apex_email")
    };

}





function logout(){

    sessionStorage.clear();
    window.location.href = "login.html";

}





async function loginAdmin(email, password){

    if(email !== "admin@apexlegal.co.ke" || password !== "Admin@123"){
        throw new Error("Invalid admin credentials");
    }

    createSession("admin", "admin", "Administrator", email);

    return { role: "admin" };

}





async function loginAdvocate(email, password){

    if(!sb){
        throw new Error("Database unavailable. Supabase client failed to initialize.");
    }

    const hashed = await hashPassword(password);

    const { data, error } = await sb
        .from("advocates")
        .select("*")
        .eq("email", email)
        .eq("password", hashed)
        .eq("status", "active")
        .single();

    if(error || !data){
        console.error("[ApexAuth] Advocate login error:", error);
        throw new Error("Invalid advocate credentials");
    }

    createSession("advocate", data.id, data.name, data.email);

    return { role: "advocate" };

}





function guard(allowedRoles){

    const session = getSession();

    if(!session){
        window.location.href = "login.html";
        return false;
    }

    if(allowedRoles && !allowedRoles.includes(session.role)){

        if(session.role === "admin"){
            window.location.href = "admin-dashboard.html";
        }else{
            window.location.href = "advocate-dashboard.html";
        }

        return false;
    }

    return true;

}





function generateToken(){

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let token = "";

    for(let i = 0; i < 10; i++){
        token += chars[Math.floor(Math.random() * chars.length)];
    }

    return "APX-" + token;

}



/* =========================================================
   EXPORTS
   ========================================================= */

window.ApexAuth = {

    init,
    loginAdmin,
    loginAdvocate,
    logout,
    guard,
    getSession,
    hashPassword,
    generateToken,

    // Expose the Supabase client so the dashboard can query tables
    supabase: function(){
        return sb;
    }

};


/* Auto-init */
if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
}else{
    init();
}


})();