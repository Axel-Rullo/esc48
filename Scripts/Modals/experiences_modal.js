/* ================================================================
    MODAL DE EXPERIENCIAS
    ================================================================ */

class ExperiencesModal extends BaseModal {

    constructor() {
        super(null, null);

        this.experiences   = new Map();
        this.currentMajor  = null;
        this.currentRating = 0;
        this.myExperience  = null;   // Experiencia propia del usuario
        this.isEditing     = false;  // true cuando se está editando la experiencia propia

        this.init();
    }

    // =============================================================
    // INICIALIZAR
    // =============================================================

    init() {
        this.modal       = document.getElementById('experiencesModal');
        this.formSection = document.getElementById('formSection');
        this.formToggle  = document.getElementById('formToggle');
        this.myExpPanel  = document.getElementById('myExperiencePanel');
        this.myExpToggle = document.getElementById('myExperienceToggle');

        const starContainer = document.getElementById('formStarRating');
        if (starContainer) starContainer.innerHTML = this.generateStarHTML(0);

        this.attachListeners();
    }

    // =============================================================
    // LISTENERS
    // =============================================================

    attachListeners() {

        // Escape + backdrop (heredados de BaseModal)
        this.registerCloseListeners();

        // Botón X
        document.getElementById('closeExperiencesModal')
            .addEventListener('click', () => this.closeModal());

        // Función auxiliar para el acordeón
        const togglePanel = (btnToOpen, panelToOpen, btnToClose, panelToClose) => {
            const isOpening = panelToOpen.style.display === 'none';

            // Si abrimos este, cerramos el otro
            if (isOpening) {
                panelToClose.style.display = 'none';
                btnToClose?.classList.remove('active');
            }

            // Alternamos el estado del actual
            panelToOpen.style.display = isOpening ? 'block' : 'none';
            btnToOpen?.classList.toggle('active', isOpening);
        };

        // Toggle del formulario colapsable (Compartir)
        this.formToggle?.addEventListener('click', () => {
            togglePanel(this.formToggle, this.formSection, this.myExpToggle, this.myExpPanel);
        });

        // Toggle de Mi Experiencia
        this.myExpToggle?.addEventListener('click', () => {
            togglePanel(this.myExpToggle, this.myExpPanel, this.formToggle, this.formSection);
        });

        // Cancelar: cierra el formulario y limpia los campos
        document.getElementById('cancelExperience')?.addEventListener('click', () => {
            document.getElementById('experiencesForm').reset();
            this.updateFormStars(0);
            this.formSection.style.display = 'none';
            this.formToggle.classList.remove('active');
        });

        // Bloquear scroll externo en mobile cuando el modal está abierto
        document.addEventListener('touchmove', (e) => {
            if (!this.isOpen()) return;
            const modalBody = this.modal.querySelector('.experiences-modal-body');
            if (!modalBody.contains(e.target)) e.preventDefault();
        }, { passive: false });

        // Ajustar altura en resize
        window.addEventListener('resize', () => this.adjustModalHeight());
        this.adjustModalHeight();

        // Submit del formulario
        document.getElementById('experiencesForm').addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.currentRating === 0) {
                this.showRatingAlert();
                return;
            }
            submitExperience();
        });

        // Enter en desktop envía el formulario; Shift+Enter = salto de línea en textarea
        document.addEventListener('keydown', (e) => {

            const isDesktop     = window.innerWidth > 1024;
            const isFormVisible = formSection.style.display !== 'none';

            if (!isDesktop || !this.isOpen() || !isFormVisible) return;

            const expCommentField = document.getElementById('expComment');
            const isInTextarea    = e.target === expCommentField;

            if (isInTextarea && e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                document.getElementById('experiencesForm').requestSubmit();
            } else if (!isInTextarea && e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('experiencesForm').requestSubmit();
            }
        });

        // Clic en estrellas del formulario (event delegation)
        document.addEventListener('click', (e) => {
            const star = e.target.closest('#formStarRating .experiences-star');
            if (star) this.updateFormStars(parseFloat(star.getAttribute('data-value')));
        });

        // Hover: iluminar estrellas hasta el cursor
        document.addEventListener('mouseover', (e) => {
            const star = e.target.closest('#formStarRating .experiences-star');
            if (!star) return;
            const hoverValue = parseFloat(star.getAttribute('data-value'));
            document.querySelectorAll('#formStarRating .experiences-star').forEach(s => {
                s.classList.toggle('experiences-star-hover', parseFloat(s.getAttribute('data-value')) <= hoverValue);
            });
        });

        // Al salir del contenedor de estrellas, restaurar estado real
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('#formStarRating')) return;
            document.querySelectorAll('#formStarRating .experiences-star')
                .forEach(s => s.classList.remove('experiences-star-hover'));
        });
    }

    // =============================================================
    // ABRIR / CERRAR
    // =============================================================

    openModal(majorTitle, majorId) {

        const majorKey     = this.majorTitleToKey(majorTitle);
        this.currentMajor  = { title: majorTitle, id: majorId, key: majorKey };
        this.currentRating = 0;

        // Guardar carrera activa para el backend (ver sección Backend al final)
        window.selectedMajor = { title: majorTitle, id: majorId, key: majorKey };

        // Título del modal
        this.modal.querySelector('h2').innerHTML = `
            <i class="fas fa-comments"></i>
            Experiencias: ${majorTitle}
        `;

        document.getElementById('experiencesForm').reset();
        this.updateFormStars(0);

        // Pedir al backend los datos de esta carrera antes de renderizar
        Promise.all([
            fetchExperiencesByMajor(majorKey),
            fetchMyExperience(),
        ]).then(([experiences, myExperience]) => {
            if (experiences) this.experiences.set(majorKey, experiences);
            this.myExperience = myExperience ?? null;
            this.loadExperiences();
        });

        this.open();
        this.adjustModalHeight();
    }

    closeModal() {
        this.close();
        this.currentMajor = null;

        // Cerrar paneles abiertos al salir
        if (this.formSection) this.formSection.style.display = 'none';
        if (this.formToggle)  this.formToggle.classList.remove('active');
        if (this.myExpPanel)  this.myExpPanel.style.display = 'none';
        if (this.myExpToggle) this.myExpToggle.classList.remove('active');
    }

    // =============================================================
    // CONVERTIR TÍTULO DE CARRERA A CLAVE CORTA
    // =============================================================

    majorTitleToKey(title) {
        const map = {
            'técnico superior en desarrollo de software':        'software',
            'técnico superior en gestión de las organizaciones': 'gestion',
            'profesorado en educación inicial':                  'inicial',
            'profesorado en educación primaria':                 'primaria',
        };
        return map[title.toLowerCase()] ?? title.toLowerCase().replace(/\s+/g, '-');
    }

    // =============================================================
    // ESTRELLAS
    // =============================================================

    generateStarHTML(rating) {
        const roundedRating = Math.round(rating);
        let html = '';
        for (let i = 1; i <= 5; i++) {
            html += `
                <span class="experiences-star${roundedRating >= i ? ' experiences-star-full' : ''}" data-value="${i}">
                    <i class="fas fa-star"></i>
                </span>
            `;
        }
        return html;
    }

    // =============================================================
    // ESTRELLAS — RENDERIZAR
    // =============================================================

    renderStars(rating) {
        const value = parseFloat(rating) || 0;
        let html = '';

        for (let i = 1; i <= 5; i++) {
            if (value >= i) {
                // Estrella completa
                html += `<span class="experiences-star-display experiences-star-full"><i class="fas fa-star"></i></span>`;
            } else if (value > i - 1) {
                // Estrella parcial: dos íconos superpuestos.
                // .star-bg = base gris; .star-fg = capa dorada recortada por width
                const fill = Math.round((value - (i - 1)) * 100);
                html += `<span class="experiences-star-display experiences-star-partial" style="--star-fill:${fill}%">
                    <i class="fas fa-star star-bg"></i>
                    <span class="star-fg"><i class="fas fa-star"></i></span>
                </span>`;
            } else {
                // Estrella vacía
                html += `<span class="experiences-star-display"><i class="fas fa-star"></i></span>`;
            }
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
        });

        document.getElementById('ratingInput').value = rating > 0 ? rating : '';
    }

    // =============================================================
    // CARGAR EXPERIENCIAS
    // =============================================================

    loadExperiencesFromData() {
        try {
            const data = window.ExperiencesData;

            if (!data?.experiences) {
                console.warn('✗ No hay datos de experiencias disponibles');
                return;
            }

            // Cargar experiencia propia si viene en el JSON
            if (data.myExperience) {
                this.myExperience = data.myExperience;
                console.log('✓ Experiencia propia cargada', this.myExperience);
            }

            Object.keys(data.experiences).forEach(major => {
                const entry = data.experiences[major];
                const rawReviews = Array.isArray(entry) ? entry : entry.reviews ?? [];
                const reviews    = rawReviews.map(({ id, ...rest }) => rest);

                this.experiences.set(major, Array.isArray(entry)
                    ? { averageRating: null, totalReviews: reviews.length, reviews }
                    : { averageRating: entry.averageRating ?? null,
                        totalReviews:  entry.totalReviews  ?? reviews.length,
                        reviews }
                );
            });

            console.log('✓ Experiencias cargadas', this.experiences);

        } catch (error) {
            console.error('✗ Error al cargar experiencias:', error);
        }
    }

    // =============================================================
    // RENDERIZAR LISTA DE EXPERIENCIAS
    // =============================================================

    loadExperiences() {

        const list   = document.getElementById('experiencesList');
        const entry  = this.experiences.get(this.currentMajor.key)
                    ?? { averageRating: null, totalReviews: 0, reviews: [] };

        const { averageRating, totalReviews, reviews } = entry;

        // Promedio — siempre viene del backend; si no hay datos queda sin calificaciones
        const averageStars = document.getElementById('averageStars');
        const averageText  = document.getElementById('averageText');

        if (averageRating !== null && totalReviews > 0) {
            averageStars.innerHTML  = this.renderStars(parseFloat(averageRating));
            averageText.textContent = `${averageRating} (${totalReviews})`;
        } else {
            averageStars.innerHTML  = '';
            averageText.textContent = 'Sin calificaciones';
        }

        // Renderizar la experiencia propia
        this.renderMyExperience();

        // Lista de reseñas
        if (reviews.length === 0) {
            list.innerHTML = `
                <div class="experiences-list-empty">
                    <i class="fas fa-inbox"></i>
                    <p>No hay experiencias aún. ¡Sé el primero en compartir!</p>
                </div>
            `;
            return;
        }

        list.innerHTML = reviews.map(exp => `
            <div class="experience-card">
                <div class="experience-card-header">
                    <span class="experience-card-name">${this.escapeHTML(exp.name)}</span>
                    <div class="experience-card-rating">
                        ${this.renderStars(exp.rating || 0)}
                    </div>
                </div>
                <p class="experience-card-text">${this.escapeHTML(exp.comment)}</p>
                <div class="experience-card-meta">📅 ${exp.date}</div>
            </div>
        `).join('');
    }

    // =============================================================
    // RENDERIZAR EXPERIENCIA PROPIA
    // =============================================================

    renderMyExperience() {

        const panel = document.getElementById('myExperiencePanel');
        if (!panel) return;

        // Solo mostrar si la experiencia es de la carrera actual
        const mine = (this.myExperience?.major === this.currentMajor.key)
            ? this.myExperience
            : null;

        // Salir del modo edición al cambiar de carrera
        this.isEditing = false;

        if (!mine) {
            panel.innerHTML = `
                <div class="my-experience-empty">
                    <i class="fas fa-user-circle"></i>
                    <p>Aún no publicaste tu experiencia en esta carrera.</p>
                </div>
            `;
            return;
        }

        const nameParts = (mine.name || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ');

        panel.innerHTML = `
            <div class="my-experience-card" id="myExperienceCard">
                <div class="my-experience-view" id="myExperienceView">
                    <div class="my-experience-card-header">
                        <span class="experience-card-name">${this.escapeHTML(mine.name)}</span>
                        <div class="my-experience-card-rating">
                            ${this.renderStars(mine.rating || 0)}
                        </div>
                    </div>
                    <p class="experience-card-text">${this.escapeHTML(mine.comment)}</p>
                    <div class="experience-card-meta">\u{1F4C5} ${mine.date}</div>
                    <div class="my-experience-actions">
                        <button class="my-exp-btn my-exp-btn-edit" id="myExpEditBtn">
                            <i class="fas fa-pen"></i> Editar
                        </button>
                        <button class="my-exp-btn my-exp-btn-delete" id="myExpDeleteBtn">
                            <i class="fas fa-trash"></i> Borrar
                        </button>
                    </div>
                </div>
            </div>

            <div class="my-experience-edit" id="myExperienceEdit" style="display:none;">
                <form class="experiences-form" id="myExperienceForm">
                    <div class="experiences-form-row">
                        <div class="experiences-form-group">
                            <label for="myExpName">Nombre <span class="required">*</span></label>
                            <input type="text" id="myExpName" value="${this.escapeHTML(firstName)}" maxlength="40" required>
                        </div>
                        <div class="experiences-form-group">
                            <label for="myExpLastname">Apellido <span class="required">*</span></label>
                            <input type="text" id="myExpLastname" value="${this.escapeHTML(lastName)}" maxlength="40" required>
                        </div>
                    </div>
                    <div class="experiences-form-group">
                        <label for="myExpComment">Tu Experiencia <span class="required">*</span></label>
                        <textarea id="myExpComment" rows="3" maxlength="500">${this.escapeHTML(mine.comment)}</textarea>
                    </div>
                    <div class="experiences-form-group">
                        <label>Tu Calificación <span class="required">*</span></label>
                        <div class="experiences-star-rating" id="myExpStarRating">
                            ${this.generateStarHTML(mine.rating || 0)}
                        </div>
                    </div>
                    <div class="experiences-form-buttons">
                        <button type="button" class="experiences-btn-cancel" id="myExpCancelBtn">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                        <button type="button" class="experiences-btn-submit" id="myExpSaveBtn">
                            <i class="fas fa-check"></i> Aplicar
                        </button>
                    </div>
                </form>
            </div>
        `;

        // Listeners de la card propia (solo se registran si la card existe)
        this.attachMyExperienceListeners(mine);
    }

    // =============================================================
    // LISTENERS DE LA EXPERIENCIA PROPIA
    // =============================================================

    attachMyExperienceListeners(mine) {

        const view   = document.getElementById('myExperienceView');
        const edit   = document.getElementById('myExperienceEdit');
        const stars  = document.getElementById('myExpStarRating');

        // Guardar el rating de edición por separado para no pisar currentRating
        this.editRating = mine.rating || 0;

        // Estrellas del panel de edición
        stars?.addEventListener('click', (e) => {
            const star = e.target.closest('.experiences-star');
            if (!star) return;
            this.editRating = parseFloat(star.getAttribute('data-value'));
            stars.querySelectorAll('.experiences-star').forEach(s => {
                s.classList.toggle('experiences-star-full', parseFloat(s.getAttribute('data-value')) <= this.editRating);
            });
        });

        // Hover en estrellas de edición
        stars?.addEventListener('mouseover', (e) => {
            const star = e.target.closest('.experiences-star');
            if (!star) return;
            const val = parseFloat(star.getAttribute('data-value'));
            stars.querySelectorAll('.experiences-star').forEach(s => {
                s.classList.toggle('experiences-star-hover', parseFloat(s.getAttribute('data-value')) <= val);
            });
        });

        stars?.addEventListener('mouseleave', () => {
            stars.querySelectorAll('.experiences-star').forEach(s => s.classList.remove('experiences-star-hover'));
        });

        const card   = document.getElementById('myExperienceCard');

        // Botón Editar → oculta la card completa y muestra el formulario
        document.getElementById('myExpEditBtn')?.addEventListener('click', () => {
            card.style.display = 'none';
            edit.style.display = 'block';
            this.isEditing = true;
        });

        // Botón Cancelar → oculta el editor y restaura la card
        document.getElementById('myExpCancelBtn')?.addEventListener('click', () => {
            edit.style.display = 'none';
            card.style.display = '';
            this.isEditing = false;
            // Restaurar estrellas al valor original
            this.editRating = mine.rating || 0;
            stars?.querySelectorAll('.experiences-star').forEach(s => {
                s.classList.toggle('experiences-star-full', parseFloat(s.getAttribute('data-value')) <= this.editRating);
            });
        });

        // Botón Guardar
        document.getElementById('myExpSaveBtn')?.addEventListener('click', () => {
            updateExperience(mine.id, this.editRating);
        });

        // Botón Borrar → abre la alerta de confirmación
        document.getElementById('myExpDeleteBtn')?.addEventListener('click', () => {
            this.showDeleteConfirm(mine.id);
        });
    }

    // =============================================================
    // ALERTA DE CONFIRMACIÓN — Borrar experiencia
    // =============================================================

    showDeleteConfirm(id) {

        document.getElementById('experiencesDeleteConfirm')?.remove();

        const overlay = document.createElement('div');
        overlay.id        = 'experiencesDeleteConfirm';
        overlay.className = 'experiences-delete-overlay';
        overlay.innerHTML = `
            <div class="experiences-delete-dialog">
                <div class="experiences-delete-icon">
                    <i class="fas fa-trash-alt"></i>
                </div>
                <p class="experiences-delete-title">¿Querés borrar tu experiencia?</p>
                <p class="experiences-delete-subtitle">Esta acción no se puede deshacer.</p>
                <div class="experiences-delete-buttons">
                    <button class="experiences-btn-submit experiences-delete-confirm" id="deleteConfirmYes">
                        <i class="fas fa-check"></i> Sí, borrar
                    </button>
                    <button class="experiences-btn-cancel experiences-delete-cancel" id="deleteConfirmNo">
                        <i class="fas fa-times"></i> No
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        setTimeout(() => overlay.classList.add('experiences-delete-overlay-show'), 10);

        const close = () => {
            overlay.classList.remove('experiences-delete-overlay-show');
            setTimeout(() => overlay.remove(), 300);
        };

        document.getElementById('deleteConfirmYes').addEventListener('click', () => {
            close();
            deleteExperience(id);
        });

        document.getElementById('deleteConfirmNo').addEventListener('click', close);

        // Clic en el fondo cierra el diálogo
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });
    }

    // =============================================================
    // ALERTA — SIN CALIFICACIÓN AL INTENTAR PUBLICAR
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

        setTimeout(() => alert.classList.add('experiences-alert-show'), 10);
        setTimeout(() => {
            alert.classList.remove('experiences-alert-show');
            setTimeout(() => alert.remove(), 300);
        }, 4000);
    }

    // =============================================================
    // ESCAPE DE HTML — Seguridad contra XSS
    // =============================================================

    escapeHTML(text) {
        if (text == null) return '';
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }

    // =============================================================
    // AJUSTAR ALTURA EN MOBILE
    // =============================================================

    adjustModalHeight() {
        const modalContent = this.modal?.querySelector('.experiences-modal-content');
        if (!modalContent) return;
        modalContent.style.maxHeight = `${Math.min(window.innerHeight - 20, window.innerHeight * 0.92)}px`;
    }
}

/* ================================================================
    INICIALIZACIÓN
    ================================================================ */

onReady(() => {

    window.experiencesModal = new ExperiencesModal();

    if (window.ExperiencesData) {
        window.experiencesModal.loadExperiencesFromData();
    } else {
        window.addEventListener('experiencesDataLoaded', () => {
            window.experiencesModal.loadExperiencesFromData();
        }, { once: true });
    }

});