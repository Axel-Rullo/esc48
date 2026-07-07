/* ================================================================
    SISTEMA DE MENÚS DESPLEGABLES MULTINIVEL Y REUTILIZABLE
   ================================================================ */

class DropdownMenu {

    constructor(config = {}) {
        this.toggleSelector = config.toggleSelector;
        this.submenuClass   = config.submenuClass || 'active';
        this.toggleClass    = config.toggleClass  || 'active';

        this.init();
    }

    init() {
        this.attachEventListeners();
        this.watchMobileMenu();
    }

    // Observa el mobile-menu para bloquear/desbloquear scroll al abrir/cerrar
    watchMobileMenu() {
        const mobileMenu = document.querySelector('.mobile-menu');
        if (!mobileMenu) return;

        new MutationObserver(() => {
            if (mobileMenu.classList.contains('active')) {
                document.body.classList.add('modal-open');
            } else {
                if (typeof BaseModal !== 'undefined' && BaseModal._openCount > 0) {
                    return; // No remover si hay modales abiertos
                }
                document.body.classList.remove('modal-open');
            }
        }).observe(mobileMenu, { attributeFilter: ['class'] });
    }

    attachEventListeners() {

        // Toggle de cada submenú
        document.querySelectorAll(this.toggleSelector).forEach(toggle => {

            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const submenu = document.getElementById(`${toggle.dataset.toggle}-submenu`);
                if (!submenu) return;

                this.closeOtherSubmenus(submenu);

                submenu.classList.toggle(this.submenuClass);
                toggle.classList.toggle(this.toggleClass);
            });

        });

        // Cerrar submenús al hacer clic fuera (excepto dentro del menú lateral o nav)
        document.addEventListener('click', (e) => {

            const dentroDeMenu = e.target.closest('.menu-list') || e.target.closest('.nav');
            if (dentroDeMenu) return;

            // Clic fuera del mobile-menu y del botón hamburguesa → cerrar el menú mobile
            const dentroDelMobileMenu = e.target.closest('.mobile-menu');
            const esHamburguesa       = e.target.closest('.hamburger');
            if (!dentroDelMobileMenu && !esHamburguesa) {
                const mobileMenu = document.querySelector('.mobile-menu');
                if (mobileMenu?.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                    document.body.classList.remove('menu-open');
                    if (typeof DynamicRenderer !== 'undefined') DynamicRenderer.closeMobileMenu();
                }
            }

            // Clic en un modal o en los botones de contacto → cerrar todo
            const esAccionModal =
                e.target.closest('.modal') ||
                e.target.id === 'contactBtn' ||
                e.target.id === 'phoneBtn';

            if (esAccionModal) {
                this.closeAllSubmenus();
                // DynamicRenderer se carga antes que dropdown_menu.js (ver index.html)
                if (typeof DynamicRenderer !== 'undefined') DynamicRenderer.closeMobileMenu();
            }

        });

    }

    // Cierra los submenús hermanos del submenú que se está abriendo
    closeOtherSubmenus(currentSubmenu) {

        currentSubmenu.closest('ul')
            ?.querySelectorAll('.menu-submenu')
            .forEach(submenu => {

                if (submenu === currentSubmenu || submenu.contains(currentSubmenu)) return;

                submenu.classList.remove(this.submenuClass);

                const toggleId = submenu.id.replace('-submenu', '');
                document.querySelector(`[data-toggle="${toggleId}"]`)
                    ?.classList.remove(this.toggleClass);

            });

    }

    // Cierra todos los submenús y toggles abiertos
    closeAllSubmenus() {

        document.querySelectorAll('.menu-submenu').forEach(s => {
            s.classList.remove(this.submenuClass);
        });

        document.querySelectorAll('.menu-dropdown-toggle, .submenu-dropdown-toggle, .nav-dropdown-toggle').forEach(t => {
            t.classList.remove(this.toggleClass);
        });

    }

}