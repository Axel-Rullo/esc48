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
    github:     { label: "GitHub",             icon: "fab fa-github",              color: "#24292e" },

    // ── COMUNICACIÓN ─────────────────────────────────────────────
    telegram:   { label: "Telegram",           icon: "fab fa-telegram",            color: "#26a5e4" },
    discord:    { label: "Discord",            icon: "fab fa-discord",             color: "#5865f2" },

    // ── CONTENIDO / DIFUSIÓN ─────────────────────────────────────
    tiktok:     { label: "TikTok",             icon: "fab fa-tiktok",              color: "#010101" },
    spotify:    { label: "Spotify",            icon: "fab fa-spotify",             color: "#1db954" },
    soundcloud: { label: "SoundCloud",         icon: "fab fa-soundcloud",          color: "#ff5500" },

    // ── PLATAFORMAS EDUCATIVAS ────────────────────────────────────
    moodle:     { label: "Moodle / Aula",      icon: "fas fa-graduation-cap",      color: "#f98012" },
    meet:       { label: "Google Meet",        icon: "fas fa-video",               color: "#00897b" },

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