/* =========================================================================
    BASE MODAL
    ========================================================================= */

class BaseModal {

    // Contador global de modales abiertos
    static _openCount = 0;

    // Tiempo mínimo (ms) entre un open()/close() y el siguiente.
    static TOGGLE_LOCK_MS = 300;

    // Tope (ms) para liberar el scroll después de cerrar, por si el modal
    // no tiene ninguna transición CSS definida y el evento 'transitionend'
    // nunca llega.
    static CLOSE_ANIMATION_FALLBACK_MS = 500;

    /* -----------------------------------------------------------------
        @param {HTMLElement} modalEl   - Elemento raíz del modal
        @param {HTMLElement} overlayEl - Overlay semitransparente (opcional)
    ----------------------------------------------------------------- */
    constructor(modalEl, overlayEl = null) {
        this.modal   = modalEl;
        this.overlay = overlayEl;

        this._toggling    = false;  // true mientras el modal está "en tránsito"
        this._toggleTimer = null;

        BaseModal._ensureHint();    // Crea el panel una sola vez para todos los modales
    }

    // =================================================================
    // PANEL DE ATAJOS
    // =================================================================

    static _ensureHint() {
        if (document.getElementById('modalShortcutsHint')) return;

        const hint = document.createElement('div');
        hint.id = 'modalShortcutsHint';
        hint.setAttribute('aria-hidden', 'true');
        hint.innerHTML = `
            <p class="msh-label">Cerrar con</p>
            <div class="msh-item">
                <kbd>Esc</kbd>
                <span>teclado</span>
            </div>
            <div class="msh-item">
                <kbd>Click</kbd>
                <span>afuera</span>
            </div>
            <div class="msh-item">
                <kbd>✕</kbd>
                <span>botón</span>
            </div>`;

        document.body.appendChild(hint);
    }

    static _showHint() {
        document.getElementById('modalShortcutsHint')?.classList.add('active');
    }

    static _hideHint() {
        // Solo ocultar si no queda ningún otro modal abierto (según el contador)
        if (BaseModal._openCount === 0) {
            document.getElementById('modalShortcutsHint')?.classList.remove('active');
        }
    }

    // =================================================================
    // CONTADOR DE MODALES ABIERTOS (bloqueo de scroll)
    // =================================================================

    // Suma un modal al contador global y bloquea el scroll del body.
    static _lockScroll() {
        BaseModal._openCount++;
        document.body.classList.add('modal-open');
    }

    // Resta un modal al contador y solo libera el scroll cuando llega a 0.
    static _unlockScroll() {
        BaseModal._openCount = Math.max(0, BaseModal._openCount - 1);
        if (BaseModal._openCount === 0) {
            document.body.classList.remove('modal-open');
        }
    }

    // =================================================================
    // SEGURO ANTI-SPAM
    // =================================================================

    // Bloquea nuevos toggles (open/close)
    _lockToggle() {
        this._toggling = true;
        clearTimeout(this._toggleTimer);
        this._toggleTimer = setTimeout(() => {
            this._toggling = false;
        }, BaseModal.TOGGLE_LOCK_MS);
    }

    // evita liberar el scroll mientras el modal todavía se está viendo.
    _afterCloseAnimation(callback) {
        let done = false;

        const finish = () => {
            if (done) return;
            done = true;
            this.modal.removeEventListener('transitionend', onTransitionEnd);
            callback();
        };

        // Ignoramos transiciones que "burbujean" desde elementos hijos
        // (ej: un botón interno con su propia transición de color)
        const onTransitionEnd = (e) => {
            if (e.target === this.modal) finish();
        };

        this.modal.addEventListener('transitionend', onTransitionEnd);
        setTimeout(finish, BaseModal.CLOSE_ANIMATION_FALLBACK_MS);
    }

    // =================================================================
    // OPEN / CLOSE / IS OPEN
    // =================================================================

    // Agrega 'active' al modal + overlay y bloquea el scroll
    open() {
        // Ya está abierto, o se acaba de togglear hace instantes: ignorar
        if (this.isOpen() || this._toggling) return;
        this._lockToggle();

        this.modal.classList.add('active');
        this.overlay?.classList.add('active');

        BaseModal._lockScroll();
        BaseModal._showHint();
    }

    // Quita 'active' (arranca la animación de cierre) y al terminar restaura el scroll
    close() {
        // Ya está cerrado, o se acaba de togglear hace instantes: ignorar
        if (!this.isOpen() || this._toggling) return;
        this._toggling = true; // se libera recién cuando termine la animación

        this.modal.classList.remove('active');
        this.overlay?.classList.remove('active');

        this._afterCloseAnimation(() => {
            BaseModal._unlockScroll();
            BaseModal._hideHint();
            this._toggling = false;
        });
    }

    // Devuelve true si el modal está visible
    isOpen() {
        return this.modal.classList.contains('active');
    }

    // =================================================================
    // LISTENERS DE CIERRE
    // =================================================================

    registerCloseListeners() {

        // Cierre por click fuera: solo en desktop
        const isDesktop = () => window.matchMedia('(pointer: fine)').matches;

        // 1. Backdrop
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal && isDesktop()) this.close();
        });

        // 2. Overlay compartido
        if (this.overlay) {
            this.overlay.addEventListener('click', () => {
                if (this.isOpen() && isDesktop()) this.close();
            });
        }

        // 3. Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) this.close();
        });

        // 4. Scroll táctil en mobile bloqueado hasta terminar de cerrar el modal.
        document.addEventListener('touchmove', (e) => {
            if (!this.isOpen()) return;
            if (!this.modal.contains(e.target)) e.preventDefault();
        }, { passive: false });
    }
}