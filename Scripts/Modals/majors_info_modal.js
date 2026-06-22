/* ================================================================
    MAJOR INFO MODAL
    ================================================================ */

class MajorInfoModal extends BaseModal {

    /* -----------------------------------------------------------------
        @param {string} modalId   - ID del elemento raíz del modal
    ----------------------------------------------------------------- */
    constructor(modalId) {

        const modalEl = document.getElementById(modalId);
        super(modalEl);

        this._cacheElements();
        this.registerCloseListeners();
        this._attachInternalClose();
    }

    // =================================================================
    // CACHEAR ELEMENTOS INTERNOS
    // =================================================================

    _cacheElements() {
        this._titleEl   = this.modal.querySelector('.major-info-modal__title');
        this._imageEl   = this.modal.querySelector('.major-info-modal__image');
        this._descEl    = this.modal.querySelector('.major-info-modal__desc');
        this._planEl    = this.modal.querySelector('.major-info-modal__curriculum');
        this._jobsEl    = this.modal.querySelector('.major-info-modal__careers');

        // Secciones padres para ocultar cuando no hay datos
        this._planSection = this._planEl?.closest('.major-info-modal__section');
        this._jobsSection = this._jobsEl?.closest('.major-info-modal__section');
    }

    // =================================================================
    // BOTÓN DE CIERRE INTERNO (×)
    // =================================================================

    _attachInternalClose() {
        const closeBtn = this.modal.querySelector('.major-info-modal__close');
        if (closeBtn) closeBtn.addEventListener('click', () => this.close());
    }

    // =================================================================
    // ABRIR CON DATOS DE UNA CARRERA
    //   @param {object} major - Objeto de la carrera desde AppData.majors
    // =================================================================

    openModal(major) {

        // -- Header: título --
        if (this._titleEl) {
            this._titleEl.textContent = major.title ?? '';
        }

        // -- Imagen --
        if (this._imageEl) {
            this._imageEl.src = major.imageUrl ?? '';
            this._imageEl.alt = major.title ?? '';
        }

        // -- Descripción extendida (respeta \\n como saltos de línea) --
        if (this._descEl) {
            this._descEl.textContent = major.description ?? '';
        }

        // -- Plan de estudio (array de strings) --
        if (this._planEl) {
            const items = Array.isArray(major.studyPlan) ? major.studyPlan : [];
            this._planEl.innerHTML = items
                .map(item => `<li>${item}</li>`)
                .join('');

            // Ocultar sección si no hay items
            if (this._planSection) {
                this._planSection.style.display = items.length ? '' : 'none';
            }
        }

        // -- Salidas laborales (array de strings) --
        if (this._jobsEl) {
            const items = Array.isArray(major.jobOutlets) ? major.jobOutlets : [];
            this._jobsEl.innerHTML = items
                .map(item => `<li>${item}</li>`)
                .join('');

            // Ocultar sección si no hay items
            if (this._jobsSection) {
                this._jobsSection.style.display = items.length ? '' : 'none';
            }
        }



        // Scroll al tope antes de abrir
        this.modal.querySelector('.major-info-modal__scroll')?.scrollTo(0, 0);

        this.open();
    }

    // =================================================================
    // VERIFICAR SI LA CARRERA TIENE DATOS EXTENDIDOS
    //   Siempre devuelve true: al menos la descripción se muestra
    //   @param {object} major - Objeto de la carrera
    // =================================================================

    hasContent(major) {
        return !!(major.description || major.studyPlan || major.jobOutlets);
    }
}

/* ================================================================
    INICIALIZACIÓN
   ================================================================ */

onReady(() => {
    window.majorInfoModal = new MajorInfoModal('majorInfoModal');
});