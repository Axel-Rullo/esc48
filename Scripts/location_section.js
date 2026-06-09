/* ================================================================
    SECCIÓN DE UBICACIÓN
   ================================================================ */

class LocationSection {

    constructor() {
        this.mapContainer = document.getElementById('map-container');
        this.googleBtn    = document.getElementById('locationGoogleBtn');

        this.map = null;

        // Coordenadas de la escuela
        this.schoolLocation = {
            lat  : -32.58880,
            lng  : -61.16765,
            name : 'Instituto de Educación Superior Nº48 <br>"Gral. José de San Martín"'
        };

        this.init();
    }

    /* ================================================================
        INIT
       ================================================================ */

    init() {
        if (!this.mapContainer) return;

        this.initializeMap();

        // Abrir Google Maps en pestaña nueva
        this.googleBtn?.addEventListener('click', () => {
            window.open('https://maps.app.goo.gl/zWQgnPgiyyzjUFrdA', '_blank', 'noopener,noreferrer');
        });
    }

    /* ================================================================
        MAPA
       ================================================================ */

    initializeMap() {

        if (typeof L === 'undefined') {
            console.error('Leaflet no está cargado');
            return;
        }

        try {

            // Mapa estático — todos los controles de interacción desactivados
            this.map = L.map(this.mapContainer, {
                zoomControl      : false,
                attributionControl: false,
                scrollWheelZoom  : false,
                dragging         : false,
                touchZoom        : false,
                doubleClickZoom  : false,
                boxZoom          : false,
                keyboard         : false,
                tap              : false,
                zoomSnap         : 0,
                zoomDelta        : 0,
                interactive      : false
            }).setView([this.schoolLocation.lat, this.schoolLocation.lng], 17);

            // Capa base + capa de etiquetas (CartoCDN light)
            const tileOptions = { attribution: '', maxZoom: 19, minZoom: 2 };

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', tileOptions)
                .addTo(this.map);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', tileOptions)
                .addTo(this.map);

            // Ícono personalizado con Font Awesome
            const schoolIcon = L.divIcon({
                className  : 'school-icon-marker',
                html       : `<div class="school-marker-icon"><i class="fas fa-school"></i></div>`,
                iconSize   : [55, 55],
                iconAnchor : [27, 55],
                popupAnchor: [0, -55]
            });

            // Marcador + popup fijo (no se cierra al hacer clic)
            L.marker([this.schoolLocation.lat, this.schoolLocation.lng], { icon: schoolIcon })
                .addTo(this.map)
                .bindPopup(
                    `<div class="location-popup-content"><h3>${this.schoolLocation.name}</h3></div>`,
                    { maxWidth: 280, closeButton: false, autoClose: false, closeOnClick: false, className: 'location-popup-custom' }
                )
                .openPopup();

            // Forzar recalculo de tamaño por si el contenedor aún no tenía dimensiones al montar
            setTimeout(() => this.map.invalidateSize(), 150);

        } catch (error) {
            console.error('Error al inicializar el mapa:', error);
        }
    }

}

/* ================================================================
    INIT
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
    window.locationSection = new LocationSection();
});