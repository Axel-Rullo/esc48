/* =========================================================================
    BASE MODAL
    ========================================================================= */

class BaseModal {

    /* -----------------------------------------------------------------
        @param {HTMLElement} modalEl   - Elemento raíz del modal
        @param {HTMLElement} overlayEl - Overlay semitransparente (opcional)
    ----------------------------------------------------------------- */
    constructor(modalEl, overlayEl = null) {
        this.modal   = modalEl;
        this.overlay = overlayEl;

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
        // Solo ocultar si no queda ningún otro modal abierto
        const anyOpen = document.querySelector('[class*="modal"].active, .modal.active');
        if (!anyOpen) {
            document.getElementById('modalShortcutsHint')?.classList.remove('active');
        }
    }

    // =================================================================
    // OPEN / CLOSE / IS OPEN
    // =================================================================

    // Agrega 'active' al modal + overlay y bloquea el scroll
    open() {
        this.modal.classList.add('active');
        this.overlay?.classList.add('active');
        document.body.classList.add('modal-open');
        BaseModal._showHint();
    }

    // Quita 'active' y restaura el scroll solo si no hay otros modales abiertos
    close() {
        this.modal.classList.remove('active');
        this.overlay?.classList.remove('active');
        const anyOpen = document.querySelector('.modal.active, #phoneModal.active');
        if (!anyOpen) {
            document.body.classList.remove('modal-open');
        }
        BaseModal._hideHint();
    }

    // Devuelve true si el modal está visible
    isOpen() {
        return this.modal.classList.contains('active');
    }

    // =================================================================
    // LISTENERS DE CIERRE
    // =================================================================

    registerCloseListeners() {

        // Cierre por click fuera: solo en desktop (pointer = mouse/trackpad, no touch)
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
    }
}