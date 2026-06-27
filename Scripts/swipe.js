/* ================================================================
   SWIPE HINT — Hero Carousel
   - Se muestra siempre al abrir la página.
   - Dura 10 segundos o hasta que el usuario interactúe.
   - Clic/tap → cierra el overlay.
   - Swipe horizontal → cierra Y pasa de slide.
   - Teclas flecha → cierra y navega.
   ================================================================ */

class SwipeHint {

    /* ------------------------------------------------------------
       Ruta del ícono PNG
       ------------------------------------------------------------ */
    static ICON_SRC = './Images/Swipe/swipe.png';

    /* Distancia mínima en px para considerar un swipe válido */
    static MIN_SWIPE = 40;

    // =============================================================

    constructor() {
        this.overlay      = null;
        this._touchStartX = 0;
        this._touchStartY = 0;
        this.init();
    }

    // =============================================================
    // INIT
    // =============================================================

    init() {

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this._waitForCarousel());
        } else {
            this._waitForCarousel();
        }
    }

    _waitForCarousel() {
        const carousel = document.getElementById('heroCarousel');

        if (carousel) {
            this._inject(carousel);
        } else {
            window.addEventListener('heroCarouselReady', () => {
                const c = document.getElementById('heroCarousel');
                if (c) this._inject(c);
            }, { once: true });
        }
    }

    // =============================================================
    // INYECTAR OVERLAY
    // =============================================================

    _inject(carousel) {

        const section = carousel.closest('.hero-news-section') || carousel.parentElement;
        if (section) section.style.position = 'relative';

        // Crear overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'swipe-hint-overlay';
        this.overlay.setAttribute('role', 'status');
        this.overlay.setAttribute('aria-label', 'Deslizá para navegar entre noticias');

        // Ícono
        const icon = document.createElement('img');
        icon.className = 'swipe-hint-icon';
        icon.src       = SwipeHint.ICON_SRC;
        icon.alt       = '';

        // Texto
        const text = document.createElement('p');
        text.className   = 'swipe-hint-text';
        text.textContent = 'Deslizá para pasar';

        this.overlay.appendChild(icon);
        this.overlay.appendChild(text);
        section.appendChild(this.overlay);

        // Auto-descartar a los 10 segundos
        this._autoHideTimer = setTimeout(() => this.dismiss(), 20000);

        this._bindEvents();
    }

    // =============================================================
    // EVENTOS
    // =============================================================

    _bindEvents() {

        // ── TOUCH: registrar inicio ──────────────────────────────
        this.overlay.addEventListener('touchstart', (e) => {
            // Guardar posición inicial
            this._touchStartX = e.changedTouches[0].clientX;
            this._touchStartY = e.changedTouches[0].clientY;

            // NO llamar stopPropagation aquí: queremos que touchstart
            // llegue al heroCarousel para que detenga su autoplay.
        }, { passive: true });

        // ── TOUCH: evaluar swipe al soltar ──────────────────────
        this.overlay.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].clientX - this._touchStartX;
            const dy = e.changedTouches[0].clientY - this._touchStartY;

            // Solo swipe horizontal (dx mayor que dy)
            const isHorizontal = Math.abs(dx) > Math.abs(dy);
            const isSwipe      = Math.abs(dx) >= SwipeHint.MIN_SWIPE;

            if (isHorizontal && isSwipe) {
                // Descartar el overlay
                this.dismiss();

                // Pasar al slide correspondiente usando la instancia
                // global del carousel (window.heroCarousel)
                const hc = window.heroCarousel;
                if (hc) {
                    if (dx < 0) {
                        hc.nextSlide();
                    } else {
                        hc.previousSlide();
                    }
                    hc.restartAutoPlay();
                }

            }
            // Si NO fue swipe (fue un tap), no hacemos nada →
            // el overlay sigue visible y bloquea el tap al carousel.
        }, { passive: true });

        // ── CLICK / TAP sin arrastrar: descartar overlay ────────
        this.overlay.addEventListener('click', () => {
            this.dismiss();
        });

        // ── TECLADO: flechas descartan y navegan ────────────────
        this._keyHandler = (e) => {
            if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
                this.dismiss();
                window.heroCarousel?.nextSlide();
                window.heroCarousel?.restartAutoPlay();
            } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
                this.dismiss();
                window.heroCarousel?.previousSlide();
                window.heroCarousel?.restartAutoPlay();
            }
        };
        document.addEventListener('keydown', this._keyHandler);
    }

    // =============================================================
    // OCULTAR
    // =============================================================

    dismiss() {
        if (!this.overlay || this.overlay.classList.contains('hiding')) return;

        clearTimeout(this._autoHideTimer);
        document.removeEventListener('keydown', this._keyHandler);

        // Animación de salida → luego ocultar del DOM
        this.overlay.classList.add('hiding');
        this.overlay.addEventListener('transitionend', () => {
            this.overlay.classList.add('hidden');
        }, { once: true });
    }

}

/* ================================================================
    INICIALIZAR
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
    window.swipeHint = new SwipeHint();
});