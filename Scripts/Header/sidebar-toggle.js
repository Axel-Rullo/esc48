/* ================================================================
    MÓDULO SIDEBAR - MENÚ LATERAL OCULTO/VISIBLE
   ================================================================ */

class SidebarModule {

    constructor() {
        this.toggleBtn = document.querySelector('.sidebar-toggle-btn');
        this.leftMenu  = document.querySelector('.left-menu');
        this.overlay   = document.getElementById('overlay');

        if (!this.toggleBtn || !this.leftMenu) {
            console.warn('❌ Sidebar: Elementos no encontrados');
            return;
        }

        this.isOpen = false;
        this.init();
    }

    init() {
        this.attachEventListeners();
        console.log('✓ Sidebar module inicializado');
    }

    attachEventListeners() {

        // Botón toggle
        this.toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        // Overlay → cerrar
        this.overlay?.addEventListener('click', () => this.close());

        // Clic fuera del menú → cerrar
        document.addEventListener('click', (e) => {
            if (!this.leftMenu.contains(e.target) && !this.toggleBtn.contains(e.target)) {
                this.close();
            }
        });

        // Resize a mobile → cerrar
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 1024) this.close();
        });

    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.leftMenu.classList.add('expanded');
        this.toggleBtn.classList.add('open');
        this.overlay?.classList.add('active');
        this.isOpen = true;
    }

    close() {
        this.leftMenu.classList.remove('expanded');
        this.toggleBtn.classList.remove('open');
        this.overlay?.classList.remove('active');
        this.isOpen = false;
    }

}

/* ================================================================
    MÓDULO TEMA - CAMBIO CLARO/OSCURO
   ================================================================ */

class ThemeModule {

    constructor() {
        this.toggleBtn  = document.getElementById('theme-toggle');
        this.lightTheme = document.getElementById('light-theme');
        this.darkTheme  = document.getElementById('dark-theme');
        this.icon       = this.toggleBtn?.querySelector('i');

        if (!this.toggleBtn || !this.lightTheme || !this.darkTheme) {
            console.warn('❌ Theme: Elementos no encontrados');
            return;
        }

        this.isDark = false;
        this.init();
    }

    init() {
        this.loadSavedTheme();
        this.toggleBtn.addEventListener('click', () => this.toggle());
        console.log('✓ Theme module inicializado');
    }

    toggle() {
        this.isDark = !this.isDark;
        this.isDark ? this.applyDark() : this.applyLight();
        localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
    }

    applyDark() {
        this.lightTheme.disabled = true;
        this.darkTheme.disabled  = false;
        this.icon.classList.replace('fa-sun', 'fa-moon');
    }

    applyLight() {
        this.lightTheme.disabled = false;
        this.darkTheme.disabled  = true;
        this.icon.classList.replace('fa-moon', 'fa-sun');
    }

    loadSavedTheme() {
        // Aplica el tema guardado en localStorage al cargar la página
        if (localStorage.getItem('theme') === 'dark') {
            this.isDark = true;
            this.applyDark();
        } else {
            this.isDark = false;
            this.applyLight();
        }
    }

}

/* ================================================================
    MÓDULO MENÚ MOBILE - HAMBURGUESA
   ================================================================ */

class MobileMenuModule {

    constructor() {
        this.hamburger  = document.getElementById('hamburger-btn');
        this.mobileMenu = document.getElementById('mobile-menu');
        this.closeBtn   = document.getElementById('close-menu');
        this.overlay    = document.getElementById('overlay');

        // Elementos que se mueven físicamente al menú mobile
        this.nav          = document.querySelector('.nav');
        this.leftMenu     = document.querySelector('.left-menu');
        this.navOriginal  = document.getElementById('nav-original');
        this.leftOriginal = document.querySelector('.left-menu').parentElement;
        this.mobileNav    = document.querySelector('.mobile-nav');
        this.mobileLeft   = document.querySelector('.mobile-left-menu');

        if (!this.hamburger || !this.mobileMenu) {
            console.warn('❌ Mobile Menu: Elementos no encontrados');
            return;
        }

        this.init();
    }

    init() {
        this.hamburger.addEventListener('click', () => this.open());
        this.closeBtn.addEventListener('click', () => this.close());
        this.overlay?.addEventListener('click', () => this.close());
        console.log('✓ Mobile Menu module inicializado');
    }

    open() {
        this.mobileMenu.classList.add('active');
        document.body.classList.add('menu-open');
        this.overlay?.classList.add('active');

        // Mover nav y menú lateral al contenedor mobile
        this.mobileNav?.appendChild(this.nav);
        this.mobileLeft?.appendChild(this.leftMenu);
    }

    close() {
        this.mobileMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
        this.overlay?.classList.remove('active');

        // Devolver elementos a su posición original en el DOM
        this.navOriginal?.appendChild(this.nav);
        this.leftOriginal?.appendChild(this.leftMenu);
    }

}

/* ================================================================
    INICIALIZACIÓN
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
    new SidebarModule();
    new ThemeModule();
    new MobileMenuModule();
});