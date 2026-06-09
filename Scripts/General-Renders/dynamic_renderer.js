/* ================================================================
    RENDERIZADOR DE CONTENIDO DINÁMICO
   ================================================================ */

class DynamicRenderer {

    /* ================================================================
        NAVEGACIÓN
       ================================================================ */

    static renderNav() {

        if (!window.AppData) {
            window.addEventListener('appdataLoaded', () => DynamicRenderer.renderNav(), { once: true });
            return;
        }

        const nav = document.querySelector('.nav ul');
        if (!nav) return;

        nav.innerHTML = '';

        const totalItems   = window.AppData.nav.length;
        const itemsPerPage = 6;

        // =========================================================
        // NAV SIMPLE
        // =========================================================

        if (totalItems <= itemsPerPage) {

            window.AppData.nav.forEach(item => {
                nav.appendChild(DynamicRenderer.createNavItem(item));
            });

        }

        // =========================================================
        // NAV CON CARRUSEL
        // =========================================================

        else {

            const navCarouselWrapper = document.createElement('div');
            navCarouselWrapper.className = 'nav-carousel-wrapper';
            navCarouselWrapper.innerHTML = `
                <button class="nav-carousel-btn nav-carousel-prev" data-nav-carousel="prev">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <div class="nav-carousel"></div>
                <button class="nav-carousel-btn nav-carousel-next" data-nav-carousel="next">
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;

            const navCarousel = navCarouselWrapper.querySelector('.nav-carousel');

            window.AppData.nav.forEach(item => {
                navCarousel.appendChild(DynamicRenderer.createNavItem(item));
            });

            nav.appendChild(navCarouselWrapper);

            // BOTÓN ANTERIOR
            navCarouselWrapper
                .querySelector('[data-nav-carousel="prev"]')
                .addEventListener('click', () => navCarousel.scrollBy({ left: -100, behavior: 'smooth' }));

            // BOTÓN SIGUIENTE
            navCarouselWrapper
                .querySelector('[data-nav-carousel="next"]')
                .addEventListener('click', () => navCarousel.scrollBy({ left: 100, behavior: 'smooth' }));

        }

    }

    /**
     * Crea un item del nav.
     * Solo abre en pestaña nueva si el JSON lo indica con "target"
     * o si el link es un PDF.
     */
    static createNavItem(item) {

        const li = document.createElement('li');
        const a  = document.createElement('a');

        a.className   = 'nav-link';
        a.href        = item.link || '#';
        a.textContent = item.label;

        const isPDF = item.link?.toLowerCase().endsWith('.pdf');

        if (isPDF || item.target) {
            a.target = item.target || '_blank';
            a.rel    = 'noopener noreferrer';
        }

        li.appendChild(a);
        return li;

    }

    /* ================================================================
        MENÚ LATERAL
       ================================================================ */

    static renderSidebar() {

        if (!window.AppData) {
            window.addEventListener('appdataLoaded', () => DynamicRenderer.renderSidebar(), { once: true });
            return;
        }

        const menuList = document.querySelector('.menu-list');
        if (!menuList) return;

        menuList.innerHTML = '';

        window.AppData.sidebar.forEach(section => {
            menuList.appendChild(DynamicRenderer.createMenuDropdown(section));
        });

    }

    /**
     * Crea menú desplegable principal
     */
    static createMenuDropdown(section) {

        const li     = document.createElement('li');
        li.className = 'menu-item menu-item-dropdown';

        // BOTÓN PRINCIPAL
        const button = document.createElement('button');
        button.className = 'menu-link menu-dropdown-toggle';
        button.setAttribute('data-toggle', section.id);
        button.innerHTML = `
            ${section.label}
            <i class="fas fa-chevron-down menu-dropdown-icon"></i>
        `;

        // SUBMENÚ
        const ul = document.createElement('ul');
        ul.className = 'menu-submenu';
        ul.id        = `${section.id}-submenu`;

        // =========================================================
        // MENÚ ESPECIAL: DATOS INSTITUCIONALES
        // =========================================================

        if (section.label === 'Datos Institucionales') {

            const fixedItems = [
                {
                    label: 'Contacto',
                    action: () => {
                        DynamicRenderer.closeMobileMenu();
                        document.getElementById('contactBtn')?.click();
                    }
                },
                {
                    label: 'Teléfonos',
                    action: () => {
                        DynamicRenderer.closeMobileMenu();
                        document.getElementById('phoneBtn')?.click();
                    }
                },
                {
                    label: 'Ubicación',
                    action: () => {
                        DynamicRenderer.closeMobileMenu();
                        document.querySelector('.location-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                },
                {
                    label: 'Redes',
                    action: () => {
                        DynamicRenderer.closeMobileMenu();
                        document.querySelector('.footer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            ];

            fixedItems.forEach(item => ul.appendChild(DynamicRenderer.createMenuLink(item)));

        }

        // =========================================================
        // ITEMS DEL JSON
        // =========================================================

        section.items.forEach(item => {

            // SUBMENÚ ANIDADO
            if (item.items?.length > 0) {
                ul.appendChild(DynamicRenderer.createSubmenuItem(item));
            }
            // LINK SIMPLE
            else {
                ul.appendChild(DynamicRenderer.createMenuLink(item));
            }

        });

        li.appendChild(button);
        li.appendChild(ul);

        return li;

    }

    /**
     * Crea submenú multinivel
     */
    static createSubmenuItem(item) {

        const li     = document.createElement('li');
        li.className = 'menu-item submenu-item';

        // BOTÓN DESPLEGABLE
        const button = document.createElement('button');
        button.className = 'menu-link submenu-dropdown-toggle';
        button.setAttribute('data-toggle', item.id);
        button.innerHTML = `
            ${item.label}
            <i class="fas fa-chevron-right submenu-dropdown-icon"></i>
        `;

        // SUBMENÚ NIVEL 2
        const ul     = document.createElement('ul');
        ul.className = 'menu-submenu submenu-level-2';
        ul.id        = `${item.id}-submenu`;

        item.items.forEach(subitem => {
            ul.appendChild(DynamicRenderer.createMenuLink(subitem));
        });

        li.appendChild(button);
        li.appendChild(ul);

        return li;

    }

    /**
     * Crea link o botón de acción en el menú.
     * Solo abre en pestaña nueva si el JSON lo indica con "target"
     * o si el link es un PDF.
     */
    static createMenuLink(item) {

        const li     = document.createElement('li');
        li.className = 'submenu-item';

        // ACCIÓN / MODAL
        if (item.action) {

            const button       = document.createElement('button');
            button.className   = 'menu-link submenu-link';
            button.type        = 'button';
            button.textContent = item.label;
            button.addEventListener('click', item.action);
            li.appendChild(button);
            return li;

        }

        const a       = document.createElement('a');
        a.className   = 'menu-link submenu-link';
        a.textContent = item.label;
        a.href        = item.link || '#';

        const isPDF = item.link?.toLowerCase().endsWith('.pdf');

        if (isPDF || item.target) {
            a.target = item.target || '_blank';
            a.rel    = 'noopener noreferrer';
        }

        li.appendChild(a);
        return li;

    }

    /* ================================================================
        FOOTER
       ================================================================ */

    static renderFooterSocials() {

        if (!window.AppData) {
            window.addEventListener('appdataLoaded', () => DynamicRenderer.renderFooterSocials(), { once: true });
            return;
        }

        const socialsContainer = document.querySelector('.socials-container');
        if (!socialsContainer) return;

        socialsContainer.innerHTML = '';

        window.AppData.socials.forEach(social => {

            if (social.isModal) return;

            const networkKey  = social.network?.toLowerCase() ?? 'default';
            const networkData = (typeof SOCIAL_NETWORKS !== 'undefined')
                ? (SOCIAL_NETWORKS[networkKey] ?? SOCIAL_NETWORKS['default'])
                : { label: networkKey, icon: 'fas fa-link', color: '#6b7280' };

            const a     = document.createElement('a');
            a.href      = social.link || '#';
            a.className = 'social-icon';
            a.title     = networkData.label;

            a.style.setProperty('--social-color', networkData.color);

            a.target = '_blank';
            a.rel    = 'noopener noreferrer';

            a.innerHTML = `<i class="${networkData.icon}"></i>`;
            socialsContainer.appendChild(a);

        });

    }

    /* ================================================================
        UTILIDADES
       ================================================================ */

    /**
     * Cierra el menú hamburguesa
     */
    static closeMobileMenu() {
        document.getElementById('mobile-menu')?.classList.remove('active');
        document.getElementById('hamburger-btn')?.classList.remove('active');
    }

}