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
        this._titleEl    = this.modal.querySelector('.major-info-modal__title');
        this._imageEl    = this.modal.querySelector('.major-info-modal__image');
        this._descEl     = this.modal.querySelector('.major-info-modal__desc');
        this._planEl     = this.modal.querySelector('.major-info-modal__curriculum');
        this._jobsEl     = this.modal.querySelector('.major-info-modal__careers');

        // Secciones padre para ocultar cuando no hay datos
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
    // PARSEAR CAMPO — convierte string con \n en HTML
    //
    //   Si el texto tiene líneas que empiezan con "- " se renderizan
    //   como <li> dentro de una <ul>. El resto se renderiza como <p>.
    //   Las líneas vacías separan bloques.
    //
    // =================================================================

    _parseField(text) {
        if (!text) return '';

        const lines  = text.split('\n');
        let   html   = '';
        let   buffer = [];
        let   inList = false;

        const flushBuffer = () => {
            if (!buffer.length) return;
            if (inList) {
                html += `<ul class="major-info-modal__list">${buffer.map(l => `<li>${l}</li>`).join('')}</ul>`;
            } else {
                html += `<p class="major-info-modal__text">${buffer.join('<br>')}</p>`;
            }
            buffer = [];
            inList = false;
        };

        for (const raw of lines) {
            const line = raw.trimEnd();

            if (line.trim() === '') {
                flushBuffer();
                continue;
            }

            const isBullet = line.startsWith('- ');

            // Cambio de modo (texto → lista o lista → texto): vaciar buffer
            if (buffer.length && isBullet !== inList) flushBuffer();

            inList = isBullet;
            buffer.push(isBullet ? line.slice(2) : line);
        }

        flushBuffer();
        return html;
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

        // -- Descripción (texto libre con \n y soporte de listas con "- ") --
        if (this._descEl) {
            this._descEl.innerHTML = this._parseField(major.description ?? '');
        }

        // -- Plan de estudio --
        if (this._planEl) {
            const content = this._parseField(
                Array.isArray(major.studyPlan)
                    ? major.studyPlan.join('\n')
                    : (major.studyPlan ?? '')
            );
            this._planEl.innerHTML = content;
            if (this._planSection) {
                this._planSection.style.display = content ? '' : 'none';
            }
        }

        // -- Salidas laborales --
        if (this._jobsEl) {
            const content = this._parseField(
                Array.isArray(major.jobOutlets)
                    ? major.jobOutlets.join('\n')
                    : (major.jobOutlets ?? '')
            );
            this._jobsEl.innerHTML = content;
            if (this._jobsSection) {
                this._jobsSection.style.display = content ? '' : 'none';
            }
        }

        // Scroll al tope antes de abrir
        this.modal.querySelector('.major-info-modal__scroll')?.scrollTo(0, 0);

        this.open();
    }

    // =================================================================
    // VERIFICAR SI LA CARRERA TIENE DATOS EXTENDIDOS
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