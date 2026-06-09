/* ================================================================
    INICIALIZACIÓN PRINCIPAL
================================================================ */

document.addEventListener('DOMContentLoaded', () => {
    console.log('=== INICIALIZANDO APLICACIÓN ===');

    DataLoader.waitForAppData().then(() => {

        // RENDERIZADO DINÁMICO
        DynamicRenderer.renderNav();
        DynamicRenderer.renderSidebar();
        DynamicRenderer.renderFooterSocials();

        console.log('✓ Renderizado dinámico completado');

        // MENÚS DESPLEGABLES
        if (typeof DropdownMenu !== 'undefined') {

            new DropdownMenu({
                toggleSelector: '.menu-list [data-toggle]',
                submenuClass: 'active',
                toggleClass: 'active'
            });

            new DropdownMenu({
                toggleSelector: '.nav [data-toggle]',
                submenuClass: 'active',
                toggleClass: 'active'
            });

            console.log('✓ Menús desplegables inicializados');
        }

        console.log('=== APLICACIÓN LISTA ===');
    });
});

/* ================================================================
    API PÚBLICA
   ================================================================ */

window.app = {

    // Acceso de solo lectura a AppData
    get data() {
        return window.AppData || null;
    },

    addNavItem(item) {
        if (window.AppData?.nav) {
            window.AppData.nav.push(item);
            DynamicRenderer.renderNav();
        }
    },

    addSidebarItem(item) {
        if (window.AppData?.sidebar) {
            window.AppData.sidebar.push(item);
            DynamicRenderer.renderSidebar();
        }
    },

    addHeroNews(newsData) {
        if (window.AppData?.heroNews) {
            window.AppData.heroNews.push(newsData);
            // Reiniciar el carrusel si ya fue inicializado
            window.heroCarousel?.renderCarousel();
        }
    },

    addSocial(social) {
        if (window.AppData?.socials) {
            window.AppData.socials.push(social);
            DynamicRenderer.renderFooterSocials();
        }
    },

    // Mezcla datos nuevos sobre AppData y los loguea
    updateData(newData) {
        Object.assign(window.AppData, newData);
        console.log('Datos actualizados:', window.AppData);
    }

};