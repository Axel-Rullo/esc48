/* ================================================================
    MODAL DE EXPERIENCIAS
    ================================================================
    Extiende BaseModal, que provee: open(), close(), isOpen()
    y registerCloseListeners() (Escape + backdrop + overlay).
    
    Este modal NO usa overlay compartido (maneja su propio cierre
    por backdrop) pero sí hereda open()/close() y el listener ESC.
    ================================================================ */

class ExperiencesModal extends BaseModal {

    constructor() {
        // Sin overlay compartido (null) — el backdrop lo maneja BaseModal
        super(null, null);

        this.experiences    = new Map();
        this.newExperiences = new Map();
        this.currentMajor   = null;
        this.currentRating  = 0;

        this.init();
    }

    // =============================================================
    // INICIALIZAR
    // =============================================================

    init() {
        this.createModal();

        // Ahora que el modal existe en el DOM, asignarlo a la clase base
        this.modal = document.getElementById('experiencesModal');

        this.attachListeners();
    }

    // =============================================================
    // CREAR MODAL EN EL DOM
    // =============================================================

    createModal() {
        const modalHTML = `
            <div class="experiences-modal" id="experiencesModal">
                <div class="experiences-modal-content">
                    <div class="experiences-modal-header">
                        <h2>
                            <i class="fas fa-comments"></i>
                            Experiencias
                        </h2>
                        <button class="experiences-modal-close" id="closeExperiencesModal">&times;</button>
                    </div>

                    <div class="experiences-modal-body">
                        <!-- FORMULARIO COLAPSABLE -->
                        <button class="experiences-form-toggle" id="formToggle">
                            <i class="fas fa-chevron-down"></i>
                            <span>Compartir tu Experiencia</span>
                        </button>

                        <div class="experiences-form-section" id="formSection" style="display: none;">
                            <form class="experiences-form" id="experiencesForm">
                                <div class="experiences-form-row">
                                    <div class="experiences-form-group">
                                        <label for="expName">Nombre <span class="required">*</span></label>
                                        <input type="text" id="expName" name="name" placeholder="Ej: Juan" required>
                                    </div>
                                    <div class="experiences-form-group">
                                        <label for="expLastname">Apellido <span class="required">*</span></label>
                                        <input type="text" id="expLastname" name="lastname" placeholder="Ej: Pérez" required>
                                    </div>
                                </div>

                                <div class="experiences-form-group">
                                    <label for="expUser">Usuario <span class="required">*</span></label>
                                    <input type="text" id="expUser" name="user" placeholder="Ej: juanperez" required>
                                </div>

                                <div class="experiences-form-group">
                                    <div class="experiences-textarea-header">
                                        <label for="expComment">Tu Experiencia <span class="required">*</span></label>
                                        <span class="experiences-textarea-tip">Enter = publicar, Shift + Enter = salto de línea</span>
                                    </div>
                                    <textarea id="expComment" name="comment" placeholder="Cuéntanos sobre tu experiencia en esta carrera..." required></textarea>
                                </div>

                                <div class="experiences-form-group">
                                    <label>Tu Calificación <span class="required">*</span></label>
                                    <div class="experiences-star-rating" id="formStarRating">
                                        ${this.generateStarHTML(0)}
                                    </div>
                                    <input type="hidden" id="ratingInput" name="rating">
                                </div>

                                <div class="experiences-form-buttons">
                                    <button type="button" class="experiences-btn-cancel" id="cancelExperience">
                                        <i class="fas fa-times"></i>
                                        Cancelar
                                    </button>
                                    <button type="submit" class="experiences-btn-submit">
                                        <i class="fas fa-paper-plane"></i>
                                        Publicar
                                    </button>
                                </div>
                            </form>
                        </div>

                        <!-- LISTA DE EXPERIENCIAS -->
                        <div class="experiences-list-section">
                            <div class="experiences-list-header">
                                <div>
                                    <h3>
                                        <i class="fas fa-star"></i>
                                        Experiencias de Estudiantes
                                    </h3>
                                </div>
                                <div class="experiences-average-rating">
                                    <div class="experiences-average-stars" id="averageStars"></div>
                                    <span class="experiences-average-text" id="averageText">--</span>
                                </div>
                            </div>
                            <div class="experiences-list" id="experiencesList">
                                <div class="experiences-list-empty">
                                    <i class="fas fa-inbox"></i>
                                    <p>Cargando experiencias...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // =============================================================
    // LISTENERS
    // =============================================================

    attachListeners() {

        const formToggle  = document.getElementById('formToggle');
        const formSection = document.getElementById('formSection');

        // Listeners estándar heredados: Escape + backdrop (desde BaseModal)
        this.registerCloseListeners();

        // Botón X del modal
        document.getElementById('closeExperiencesModal')
            .addEventListener('click', () => this.closeModal());

        // Toggle del formulario colapsable
        formToggle.addEventListener('click', () => {
            const abierto = formSection.style.display !== 'none';
            formSection.style.display = abierto ? 'none' : 'block';
            formToggle.classList.toggle('active', !abierto);
        });

        // Cancelar: cierra el formulario colapsable
        document.getElementById('cancelExperience').addEventListener('click', () => {
            formSection.style.display = 'none';
            formToggle.classList.remove('active');
        });

        // Bloquear touchmove fuera del cuerpo del modal (mobile)
        document.addEventListener('touchmove', (e) => {
            if (this.isOpen()) {
                const modalBody = this.modal.querySelector('.experiences-modal-body');
                if (!modalBody.contains(e.target)) e.preventDefault();
            }
        }, { passive: false });

        // Ajustar altura en resize
        window.addEventListener('resize', () => this.adjustModalHeight());
        this.adjustModalHeight();

        // Submit del formulario de experiencias
        document.getElementById('experiencesForm').addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.currentRating === 0) {
                this.showRatingAlert();
                return;
            }
            this.showBackendPendingMessage();
        });

        // =========================================================
        // ENTER en desktop envía el formulario
        // SHIFT + ENTER en textarea = salto de línea
        // =========================================================

        document.addEventListener('keydown', (e) => {

            const isDesktop     = window.innerWidth > 1024;
            const isFormVisible = formSection.style.display !== 'none';

            if (!isDesktop || !this.isOpen() || !isFormVisible) return;

            const expCommentField = document.getElementById('expComment');
            const isInTextarea    = e.target === expCommentField;

            if (isInTextarea) {
                // Shift+Enter = salto de línea (comportamiento nativo)
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    document.getElementById('experiencesForm').requestSubmit();
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('experiencesForm').requestSubmit();
            }
        });

        // Clic en estrellas (event delegation)
        document.addEventListener('click', (e) => {
            const star = e.target.closest('#formStarRating .experiences-star');
            if (star) {
                this.updateFormStars(parseFloat(star.getAttribute('data-value')));
            }
        });
    }

    // =============================================================
    // ABRIR / CERRAR (sobreescriben los de BaseModal)
    // open() de BaseModal no se usa aquí porque openModal() recibe
    // parámetros adicionales (título de la carrera). closeModal()
    // además limpia el estado interno.
    // =============================================================

    openModal(majorTitle, majorId) {

        this.currentMajor  = { title: majorTitle, id: majorId };
        this.currentRating = 0;

        // Actualizar título del modal
        this.modal.querySelector('h2').innerHTML = `
            <i class="fas fa-comments"></i>
            Experiencias: ${majorTitle}
        `;

        document.getElementById('experiencesForm').reset();
        this.updateFormStars(0);
        this.loadExperiences();

        // Reusar el open() de BaseModal
        this.open();
        this.adjustModalHeight();
    }

    closeModal() {
        // Reusar el close() de BaseModal y limpiar estado
        this.close();
        this.currentMajor = null;
    }

    // =============================================================
    // ESTRELLAS — GENERAR HTML
    // =============================================================

    generateStarHTML(rating) {
        const roundedRating = Math.round(rating);
        let html = '';

        for (let i = 1; i <= 5; i++) {
            const isFull = roundedRating >= i;
            html += `
                <span class="experiences-star${isFull ? ' experiences-star-full' : ''}" data-value="${i}">
                    <i class="fas fa-star"></i>
                </span>
            `;
        }
        return html;
    }

    // =============================================================
    // ESTRELLAS — RENDERIZAR (solo display, sin interacción)
    // =============================================================

    renderStars(rating) {
        const roundedRating = Math.round(rating);
        let html = '';

        for (let i = 0; i < 5; i++) {
            const isFull = i < roundedRating;
            html += `<span class="experiences-star-display${isFull ? ' experiences-star-full' : ''}"><i class="fas fa-star"></i></span>`;
        }
        return html;
    }

    // =============================================================
    // ESTRELLAS — ACTUALIZAR FORMULARIO
    // =============================================================

    updateFormStars(rating) {

        this.currentRating = rating;

        document.querySelectorAll('#formStarRating .experiences-star').forEach(star => {
            const value = parseFloat(star.getAttribute('data-value'));
            star.classList.toggle('experiences-star-full', value <= rating);
            star.classList.remove('experiences-star-half');
        });

        // Actualizar input hidden para validación
        document.getElementById('ratingInput').value = rating > 0 ? rating : '';
    }

    // =============================================================
    // CARGAR EXPERIENCIAS DESDE window.ExperiencesData
    // =============================================================

    loadExperiencesFromData() {
        try {
            const data = window.ExperiencesData;

            if (!data?.experiences) {
                console.warn('✗ No hay datos de experiencias disponibles');
                return;
            }

            Object.keys(data.experiences).forEach(majorId => {
                this.experiences.set(majorId, data.experiences[majorId] || []);
            });

            console.log('✓ Experiencias cargadas desde window.ExperiencesData', this.experiences);

        } catch (error) {
            console.error('✗ Error al cargar experiencias:', error);
        }
    }

    // =============================================================
    // RENDERIZAR LISTA
    // =============================================================

    loadExperiences() {

        const list           = document.getElementById('experiencesList');
        const jsonExperiences = this.experiences.get(this.currentMajor.id) || [];
        const allExperiences  = [...jsonExperiences];

        // Promedio
        const average     = this.calculateAverageRating(allExperiences);
        const averageStars = document.getElementById('averageStars');
        const averageText  = document.getElementById('averageText');

        if (allExperiences.length > 0) {
            averageStars.innerHTML = this.renderStars(average);
            averageText.textContent = `${average} (${allExperiences.length})`;
        } else {
            averageStars.innerHTML  = '';
            averageText.textContent = 'Sin calificaciones';
        }

        if (allExperiences.length === 0) {
            list.innerHTML = `
                <div class="experiences-list-empty">
                    <i class="fas fa-inbox"></i>
                    <p>No hay experiencias aún. ¡Sé el primero en compartir!</p>
                </div>
            `;
            return;
        }

        list.innerHTML = allExperiences.map(exp => `
            <div class="experience-card">
                <div class="experience-card-header">
                    <span class="experience-card-name">${this.escapeHTML(exp.name)} ${this.escapeHTML(exp.lastname)}</span>
                    <div class="experience-card-rating">
                        ${this.renderStars(exp.rating || 0)}
                        <span class="experience-card-rating-text">${Math.round(exp.rating || 0)}</span>
                    </div>
                </div>
                <p class="experience-card-text">${this.escapeHTML(exp.comment)}</p>
                <div class="experience-card-meta">📅 ${exp.date}</div>
            </div>
        `).join('');
    }

    // =============================================================
    // CALCULAR PROMEDIO
    // =============================================================

    calculateAverageRating(experiences) {
        if (experiences.length === 0) return 0;
        const sum = experiences.reduce((acc, exp) => acc + (exp.rating || 0), 0);
        return (sum / experiences.length).toFixed(1);
    }

    // =============================================================
    // ALERTA DE CALIFICACIÓN PENDIENTE
    // =============================================================

    showRatingAlert() {

        document.getElementById('experiencesRatingAlert')?.remove();

        const alert = document.createElement('div');
        alert.id        = 'experiencesRatingAlert';
        alert.className = 'experiences-rating-alert';
        alert.innerHTML = `
            <div class="experiences-alert-content">
                <i class="fas fa-exclamation-circle"></i>
                <p>Por favor selecciona una calificación</p>
            </div>
        `;

        document.body.appendChild(alert);

        // Animar entrada
        setTimeout(() => alert.classList.add('experiences-alert-show'), 10);

        // Animar salida y remover
        setTimeout(() => {
            alert.classList.remove('experiences-alert-show');
            setTimeout(() => alert.remove(), 300);
        }, 4000);
    }

    // =============================================================
    // MENSAJE BACKEND PENDIENTE
    // =============================================================

    showBackendPendingMessage() {

        const submitBtn  = document.querySelector('#experiencesForm .experiences-btn-submit');
        const originalHTML = submitBtn.innerHTML;

        submitBtn.innerHTML         = '<i class="fas fa-clock"></i> Próximamente';
        submitBtn.style.background  = 'var(--content-text-light)';
        submitBtn.disabled          = true;

        setTimeout(() => {
            submitBtn.innerHTML        = originalHTML;
            submitBtn.style.background = '';
            submitBtn.disabled         = false;
        }, 2500);
    }

    // =============================================================
    // ESCAPE DE HTML (seguridad contra XSS)
    // =============================================================

    escapeHTML(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // =============================================================
    // AJUSTAR ALTURA EN MOBILE
    // =============================================================

    adjustModalHeight() {
        const modalContent = this.modal?.querySelector('.experiences-modal-content');
        if (!modalContent) return;

        const maxHeight = Math.min(window.innerHeight - 20, window.innerHeight * 0.92);
        modalContent.style.maxHeight = `${maxHeight}px`;
    }
}

/* =================================================================
    INICIALIZACIÓN
================================================================ */

onReady(() => {

    window.experiencesModal = new ExperiencesModal();

    // Cargar datos (pueden ya estar disponibles o llegar después)
    if (window.ExperiencesData) {
        window.experiencesModal.loadExperiencesFromData();
    } else {
        window.addEventListener('experiencesDataLoaded', () => {
            window.experiencesModal.loadExperiencesFromData();
        }, { once: true });
    }

    // Listener de estrellas del formulario (el modal ya existe en DOM)
    setTimeout(() => {
        document.getElementById('formStarRating')?.addEventListener('click', (e) => {
            const star = e.target.closest('.experiences-star');
            if (star) {
                window.experiencesModal.updateFormStars(
                    parseFloat(star.getAttribute('data-value'))
                );
            }
        });
    }, 100);
});