/* ================================================================
    REDES SOCIALES
   ================================================================ */

const SOCIAL_NETWORKS = {

    // ── META ─────────────────────────────────────────────────────
    facebook:   { label: "Facebook",           icon: "fab fa-facebook-f",          color: "#1877f2" },
    instagram:  { label: "Instagram",          icon: "fab fa-instagram",           color: "#e4405f" },
    threads:    { label: "Threads",            icon: "fab fa-threads",             color: "#101010" },
    whatsapp:   { label: "WhatsApp",           icon: "fab fa-whatsapp",            color: "#25d366" },
    messenger:  { label: "Messenger",          icon: "fab fa-facebook-messenger",  color: "#0084ff" },

    // ── GOOGLE ───────────────────────────────────────────────────
    youtube:    { label: "YouTube",            icon: "fab fa-youtube",             color: "#ff0000" },

    // ── PROFESIONAL / ACADÉMICO ───────────────────────────────────
    twitter:    { label: "Twitter / X",        icon: "fab fa-x-twitter",           color: "#000000" },
    linkedin:   { label: "LinkedIn",           icon: "fab fa-linkedin-in",         color: "#0a66c2" },

    // ── CONTENIDO / DIFUSIÓN ─────────────────────────────────────
    tiktok:     { label: "TikTok",             icon: "fab fa-tiktok",              color: "#010101" },

    // ── CONTACTO INSTITUCIONAL ────────────────────────────────────
    email:      { label: "Correo Electrónico", icon: "fas fa-envelope",            color: "#ea4335" },
    website:    { label: "Sitio Web",          icon: "fas fa-globe",               color: "#6366f1" },

    // ── FALLBACK ─────────────────────────────────────────────────
    default:    { label: "Enlace",             icon: "fas fa-link",                color: "#6b7280" }
};

/* ================================================================
    OPCIONES PARA EL SELECT DEL PANEL ADMIN
   ================================================================ */

const SOCIAL_NETWORK_OPTIONS = Object.entries(SOCIAL_NETWORKS)
    .filter(([slug]) => slug !== "default")
    .map(([slug, data]) => ({
        value: slug,
        label: data.label
    }));