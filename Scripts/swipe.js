/* ================================================================
   SWIPE HINT — Hero Carousel
   ================================================================ */

class SwipeHint {

    static ICON_SRC   = './Images/Swipe/swipe.png';
    static MIN_SWIPE  = 40;
    static BREAKPOINT = 1024;
    static STORAGE_KEY = 'swipeHintDismissed';

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
    // DETECTAR MODO
    // =============================================================

    _isMobile() {
        return window.innerWidth <= SwipeHint.BREAKPOINT;
    }

    // =============================================================
    // INYECTAR OVERLAY
    // =============================================================

    _inject(carousel) {

        // Ya fue visto → no mostrar
        if (localStorage.getItem(SwipeHint.STORAGE_KEY)) return;

        const section = carousel.closest('.hero-news-section') || carousel.parentElement;
        if (section) section.style.position = 'relative';

        // Overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'swipe-hint-overlay';
        this.overlay.setAttribute('role', 'status');

        if (this._isMobile()) {
            this._buildMobile();
        } else {
            this._buildDesktop();
        }

        section.appendChild(this.overlay);

        this._bindEvents();
    }

    // =============================================================
    // CONTENIDO MOBILE — ícono dedo + "Deslizá para pasar"
    // =============================================================

    _buildMobile() {
        this.overlay.setAttribute('aria-label', 'Deslizá para navegar entre noticias');

        const icon = document.createElement('img');
        icon.className = 'swipe-hint-icon';
        icon.src       = SwipeHint.ICON_SRC;
        icon.alt       = '';

        const text = document.createElement('p');
        text.className   = 'swipe-hint-text';
        text.textContent = 'Deslizá para navegar';

        const sub = document.createElement('p');
        sub.className   = 'swipe-hint-subtext';
        sub.textContent = '(Tocar para cerrar)';

        this.overlay.appendChild(icon);
        this.overlay.appendChild(text);
        this.overlay.appendChild(sub);
    }

    // =============================================================
    // CONTENIDO DESKTOP — teclas flecha + A / D
    // =============================================================

    _buildDesktop() {
        this.overlay.setAttribute('aria-label', 'Usá las teclas para navegar entre noticias');
        this.overlay.classList.add('swipe-hint-overlay--desktop');

        // SVG flecha izquierda
        const arrowLeft = `
            <svg class="swipe-hint-key-icon" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="1" y="1" width="22" height="22" rx="4" ry="4"
                        stroke="#fff" stroke-width="1.8" fill="rgba(255,255,255,0.08)"/>
                <polyline points="14,7 9,12 14,17"
                        stroke="#fff" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`;

        // SVG flecha derecha
        const arrowRight = `
            <svg class="swipe-hint-key-icon" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="1" y="1" width="22" height="22" rx="4" ry="4"
                        stroke="#fff" stroke-width="1.8" fill="rgba(255,255,255,0.08)"/>
                <polyline points="10,7 15,12 10,17"
                        stroke="#fff" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`;

        // Tecla A
        const keyA = `
            <svg class="swipe-hint-key-icon" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="1" y="1" width="22" height="22" rx="4" ry="4"
                        stroke="#fff" stroke-width="1.8" fill="rgba(255,255,255,0.08)"/>
                <text x="12" y="17" text-anchor="middle"
                    font-family="system-ui, sans-serif" font-size="13"
                    font-weight="600" fill="#fff">A</text>
            </svg>`;

        // Tecla D
        const keyD = `
            <svg class="swipe-hint-key-icon" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="1" y="1" width="22" height="22" rx="4" ry="4"
                        stroke="#fff" stroke-width="1.8" fill="rgba(255,255,255,0.08)"/>
                <text x="12" y="17" text-anchor="middle"
                        font-family="system-ui, sans-serif" font-size="13"
                        font-weight="600" fill="#fff">D</text>
            </svg>`;

        // Fila de teclas
        const keysRow = document.createElement('div');
        keysRow.className   = 'swipe-hint-keys-row';
        keysRow.innerHTML   = `
            ${arrowLeft}
            <span class="swipe-hint-keys-sep">/</span>
            ${keyA}
            <span class="swipe-hint-keys-label">Anterior</span>

            <span class="swipe-hint-keys-divider"></span>

            <span class="swipe-hint-keys-label">Siguiente</span>
            ${keyD}
            <span class="swipe-hint-keys-sep">/</span>
            ${arrowRight}
        `;

        const text = document.createElement('p');
        text.className   = 'swipe-hint-text';
        text.textContent = 'Usá las teclas para navegar';

        const close = document.createElement('p');
        close.className   = 'swipe-hint-subtext';
        close.textContent = '(Click para cerrar)';

        this.overlay.appendChild(keysRow);
        this.overlay.appendChild(text);
        this.overlay.appendChild(close);
    }

    // =============================================================
    // EVENTOS
    // =============================================================

    _bindEvents() {

        // ── TOUCH inicio (solo mobile) ───────────────────────────
        this.overlay.addEventListener('touchstart', (e) => {
            this._touchStartX = e.changedTouches[0].clientX;
            this._touchStartY = e.changedTouches[0].clientY;
        }, { passive: true });

        // ── TOUCH fin: swipe horizontal → dismiss + navegar ─────
        this.overlay.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].clientX - this._touchStartX;
            const dy = e.changedTouches[0].clientY - this._touchStartY;

            const isHorizontal = Math.abs(dx) > Math.abs(dy);
            const isSwipe      = Math.abs(dx) >= SwipeHint.MIN_SWIPE;

            if (isHorizontal && isSwipe) {
                // Evitar que el carousel reciba el mismo touchend
                e.stopPropagation();
                this.dismiss();
                const hc = window.heroCarousel;
                if (hc) {
                    dx < 0 ? hc.nextSlide() : hc.previousSlide();
                    hc.restartAutoPlay();
                }
            }
        }, { passive: false });

        // ── CLICK / TAP → cerrar ─────────────────────────────────
        this.overlay.addEventListener('click', () => this.dismiss());

        // ── TECLADO: flechas / A / D → cerrar y navegar ─────────
        // useCapture: true + stopImmediatePropagation evita que el
        // carousel reciba el mismo evento y navegue por duplicado.
        this._keyHandler = (e) => {
            const key = e.key;
            if (key === 'ArrowRight' || key.toLowerCase() === 'd') {
                e.stopImmediatePropagation();
                this.dismiss();
                window.heroCarousel?.nextSlide();
                window.heroCarousel?.restartAutoPlay();
            } else if (key === 'ArrowLeft' || key.toLowerCase() === 'a') {
                e.stopImmediatePropagation();
                this.dismiss();
                window.heroCarousel?.previousSlide();
                window.heroCarousel?.restartAutoPlay();
            }
        };
        document.addEventListener('keydown', this._keyHandler, true);
    }

    // =============================================================
    // OCULTAR
    // =============================================================

    dismiss() {
        if (!this.overlay || this.overlay.classList.contains('hiding')) return;

        localStorage.setItem(SwipeHint.STORAGE_KEY, '1');
        document.removeEventListener('keydown', this._keyHandler, true);

        this.overlay.classList.add('hiding');
        this.overlay.addEventListener('transitionend', () => {
            this.overlay.classList.add('hidden');
        }, { once: true });
    }

    // Borra el flag del localStorage y recarga (útil para debug)
    static reset() {
        localStorage.removeItem(SwipeHint.STORAGE_KEY);
        location.reload();
    }

}

/* ================================================================
    INICIALIZAR
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
    window.swipeHint = new SwipeHint();
});