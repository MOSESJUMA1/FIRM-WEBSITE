/**
 * APEX LEGAL - UNIFIED AUTHENTICATION & RBAC
 * Include this script on EVERY page: <script src="auth.js"></script>
 */

(function() {
    'use strict';

    const CONFIG = {
        SUPABASE_URL: 'https://hjbrllpbpajzmgpgkadf.supabase.co',
        SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqYnJsbHBicGFqem1ncGdrYWRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2OTYxOTIsImV4cCI6MjEwMjI3MjE5Mn0.MeUv7ugRF0QMXamvgVdJ0oFvpdnxBAgH3efi8Hnszv4',
        SESSION_HOURS: 8,
        ADMIN_HASH: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9' // SHA-256 of 'admin123'
    };

    let sb = null;

    // Initialize
    function init() {
        if (window.supabase) {
            sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
        }
        renderNav();
    }

    async function hash(pw) {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw + 'apex-salt'));
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
    }

    function generateToken() {
        const arr = new Uint8Array(24);
        crypto.getRandomValues(arr);
        return 'alx-' + Array.from(arr).map(b => b.toString(36)).join('').slice(0,16);
    }

    // SESSION
    function getSession() {
        const exp = parseInt(sessionStorage.getItem('apex_exp') || '0');
        if (Date.now() > exp) { clearSession(); return null; }
        return {
            token: sessionStorage.getItem('apex_tok'),
            role: sessionStorage.getItem('apex_role'),
            name: sessionStorage.getItem('apex_name'),
            email: sessionStorage.getItem('apex_email'),
            id: sessionStorage.getItem('apex_id')
        };
    }

    function setSession(role, name, email, id) {
        const exp = Date.now() + (CONFIG.SESSION_HOURS * 3600000);
        sessionStorage.setItem('apex_tok', generateToken());
        sessionStorage.setItem('apex_role', role);
        sessionStorage.setItem('apex_name', name);
        sessionStorage.setItem('apex_email', email);
        sessionStorage.setItem('apex_id', id || '');
        sessionStorage.setItem('apex_exp', exp.toString());
    }

    function clearSession() {
        ['apex_tok','apex_role','apex_name','apex_email','apex_id','apex_exp'].forEach(k => sessionStorage.removeItem(k));
    }

    // AUTH METHODS
    async function loginAdmin(email, password) {
        if (email !== 'admin@apexlegal.co.ke') throw new Error('Invalid credentials');
        const h = await hash(password);
        if (h !== CONFIG.ADMIN_HASH) throw new Error('Invalid credentials');
        setSession('admin', 'Administrator', email, 'admin');
        return { role: 'admin' };
    }

    async function loginAdvocate(email, password) {
        if (!sb) throw new Error('Auth service down');

        // Try Supabase Auth first
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (!error && data.user) {
            const { data: prof } = await sb.from('profiles').select('role,full_name').eq('id', data.user.id).single();
            const role = prof?.role || 'advocate';
            setSession(role, prof?.full_name || email, email, data.user.id);
            return { role };
        }

        // Legacy fallback: advocates table
        const { data: rows } = await sb.from('advocates').select('*').eq('email', email).eq('status','active');
        if (!rows?.length) throw new Error('Invalid credentials');
        const adv = rows[0];
        if ((await hash(password)) !== adv.password) throw new Error('Invalid credentials');
        setSession('advocate', adv.name, email, adv.id);
        return { role: 'advocate' };
    }

    async function logout() {
        if (sb) await sb.auth.signOut().catch(()=>{});
        clearSession();
        window.location.href = 'index.html';
    }

    // ROUTE GUARDS
    function guard(allowedRoles) {
        const s = getSession();
        if (!s || !s.token) {
            window.location.href = 'login.html?reason=unauthorized';
            return false;
        }
        if (allowedRoles && !allowedRoles.includes(s.role)) {
            const map = { admin: 'admin-dashboard.html', advocate: 'staff-dashboard.html' };
            window.location.href = map[s.role] || 'index.html';
            return false;
        }
        return true;
    }

    // NAV RENDERER
    function renderNav() {
        document.querySelectorAll('[data-apex-nav]').forEach(el => {
            const s = getSession();
            const role = s?.role;
            let html = `
                <li><a href="index.html">Home</a></li>
                <li><a href="about.html">About Us</a></li>
                <li><a href="index.html#services">Practice Areas</a></li>
                <li><a href="team.html">Our Team</a></li>
                <li><a href="contact.html">Book Consultation</a></li>
            `;
            if (role === 'admin') {
                html += `<li><a href="admin-dashboard.html">Admin</a></li>`;
            }
            if (role === 'advocate' || role === 'admin') {
                html += `<li><a href="staff-dashboard.html">Dashboard</a></li>`;
            }
            if (role) {
                html += `<li><a href="#" onclick="ApexAuth.logout();return false;" class="btn-nav">Logout (${s.name})</a></li>`;
            } else {
                html += `<li><a href="login.html" class="btn-nav">Staff Login</a></li>`;
            }
            el.innerHTML = html;
        });
    }

    // PUBLIC API
    window.ApexAuth = {
        init, loginAdmin, loginAdvocate, logout, guard, getSession, hash, supabase: () => sb, generateToken
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();