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
    }

    // Agrega 'active' al modal + overlay y bloquea el scroll
    open() {
        this.modal.classList.add('active');
        this.overlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Quita 'active' y restaura el scroll
    close() {
        this.modal.classList.remove('active');
        this.overlay?.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Devuelve true si el modal está visible
    isOpen() {
        return this.modal.classList.contains('active');
    }
    
    registerCloseListeners() {

        // 1. Backdrop
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });

        // 2. Overlay compartido
        if (this.overlay) {
            this.overlay.addEventListener('click', () => {
                if (this.isOpen()) this.close();
            });
        }

        // 3. Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) this.close();
        });
    }
}