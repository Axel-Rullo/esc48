/* ================================================================
    MODAL DE EXPERIENCIAS
    ================================================================ */

class ExperiencesModal extends BaseModal {

    constructor() {
        super(null, null);

        this.experiences   = new Map();
        this.currentMajor  = null;
        this.currentRating = 0;

        this.init();
    }

    // =============================================================
    // INICIALIZAR
    // El modal ya existe en el DOM (index.html); solo se referencia
    // y se generan las estrellas vacías del formulario.
    // =============================================================

    init() {
        this.modal = document.getElementById('experiencesModal');

        const starContainer = document.getElementById('formStarRating');
        if (starContainer) starContainer.innerHTML = this.generateStarHTML(0);

        this.attachListeners();
    }

    // =============================================================
    // LISTENERS
    // =============================================================

    attachListeners() {

        const formToggle  = document.getElementById('formToggle');
        const formSection = document.getElementById('formSection');

        // Escape + backdrop (heredados de BaseModal)
        this.registerCloseListeners();

        // Botón X
        document.getElementById('closeExperiencesModal')
            .addEventListener('click', () => this.closeModal());

        // Toggle del formulario colapsable
        formToggle.addEventListener('click', () => {
            const abierto = formSection.style.display !== 'none';
            formSection.style.display = abierto ? 'none' : 'block';
            formToggle.classList.toggle('active', !abierto);
        });

        // Cancelar: cierra el formulario y limpia los campos
        document.getElementById('cancelExperience').addEventListener('click', () => {
            document.getElementById('experiencesForm').reset();
            this.updateFormStars(0);
            formSection.style.display = 'none';
            formToggle.classList.remove('active');
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
    // openModal() recibe el título y el id de la carrera pulsada.
    // closeModal() limpia el estado interno además de cerrar.
    // =============================================================

    openModal(majorTitle, majorId) {

        this.currentMajor  = { title: majorTitle, id: majorId, key: this.majorTitleToKey(majorTitle) };
        this.currentRating = 0;

        // Guardar carrera activa para el backend (ver sección Backend al final)
        window.selectedMajor = {
            title: majorTitle,
            id:    majorId,
            key:   this.majorTitleToKey(majorTitle)
        };

        // Título del modal
        this.modal.querySelector('h2').innerHTML = `
            <i class="fas fa-comments"></i>
            Experiencias: ${majorTitle}
        `;

        document.getElementById('experiencesForm').reset();
        this.updateFormStars(0);
        this.loadExperiences();

        this.open();
        this.adjustModalHeight();
    }

    closeModal() {
        this.close();
        this.currentMajor = null;
    }

    // =============================================================
    // CONVERTIR TÍTULO DE CARRERA A CLAVE CORTA
    // Permite mapear el título completo al id usado en el JSON
    // y enviado al backend.
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
    // ESTRELLAS — GENERAR HTML (interactivas, para el formulario)
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
    // ESTRELLAS — RENDERIZAR (solo display, admite fracciones)
    // Usa --star-fill para pintar exactamente el % de estrella
    // parcial (ej. 4.6 → estrella 5 tiene --star-fill: 60%).
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
    // ESTRELLAS — ACTUALIZAR FORMULARIO (al hacer clic)
    // =============================================================

    updateFormStars(rating) {
        this.currentRating = rating;

        document.querySelectorAll('#formStarRating .experiences-star').forEach(star => {
            const value = parseFloat(star.getAttribute('data-value'));
            star.classList.toggle('experiences-star-full', value <= rating);
            star.classList.remove('experiences-star-half');
        });

        document.getElementById('ratingInput').value = rating > 0 ? rating : '';
    }

    // =============================================================
    // CARGAR EXPERIENCIAS DESDE window.ExperiencesData
    // Normaliza la estructura del JSON al Map interno.
    // =============================================================

    loadExperiencesFromData() {
        try {
            const data = window.ExperiencesData;

            if (!data?.experiences) {
                console.warn('✗ No hay datos de experiencias disponibles');
                return;
            }

            Object.keys(data.experiences).forEach(majorId => {
                const entry = data.experiences[majorId];

                // La clave del JSON ya es corta (software, gestion, etc.)
                // Se guarda tal cual para que el backend la reciba igual
                this.experiences.set(majorId, Array.isArray(entry)
                    ? { averageRating: null, totalReviews: entry.length, reviews: entry }
                    : { averageRating: entry.averageRating ?? null,
                        totalReviews:  entry.totalReviews  ?? entry.reviews?.length ?? 0,
                        reviews:       entry.reviews       ?? [] }
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
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, m => map[m]);
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

    setTimeout(() => {
        document.getElementById('formStarRating')?.addEventListener('click', (e) => {
            const star = e.target.closest('.experiences-star');
            if (star) window.experiencesModal.updateFormStars(parseFloat(star.getAttribute('data-value')));
        });
    }, 100);
});

/* ===============================================================
    BACKEND — Todo lo que se debe trabajar esta abajo
    ================================================================ */

// -------------------------------------------------------------
// SUBMIT — Publicar experiencia nueva
// Recolecta los campos del formulario y los empaqueta en un
// objeto listo para enviarse al backend.
// -------------------------------------------------------------

function submitExperience() {

    const payload = {
        major:   window.selectedMajor?.key   ?? null,   // clave corta: 'software', 'gestion', etc.
        name:    document.getElementById('expName').value.trim(),
        lastname:document.getElementById('expLastname').value.trim(),
        user:    document.getElementById('expUser').value.trim(),
        comment: document.getElementById('expComment').value.trim(),
        rating:  window.experiencesModal?.currentRating ?? 0,
    };

    console.log('📦 Payload listo para el backend:', payload);

    // TODO: reemplazar con la llamada real al backend
    // fetch('/api/experiences', {
    //     method:  'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body:    JSON.stringify(payload),
    // });
}

// -------------------------------------------------------------
// Carrera activa seleccionada por el usuario.
// Se actualiza cada vez que se abre el modal de una carrera.
//
//   window.selectedMajor = {
//       title: "Técnico Superior en Desarrollo de Software",
//       id:    "major-0-técnico-superior-en-desarrollo-de-software",
//       key:   "software"
//   }
// -------------------------------------------------------------