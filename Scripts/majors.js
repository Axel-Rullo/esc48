/* ================================================================
    MAJORS + MILESTONE
    ================================================================ */


/* ================================================================
    MILESTONE 
    ================================================================ */

function calcYears() {

    // Fecha de fundación: 1 de enero de 1985 (mes 0 = enero, 0-indexed)
    const founded = new Date(1985, 0, 1);
    const today   = new Date();

    let years = today.getFullYear() - founded.getFullYear();

    // Restar un año si el aniversario de este año todavía no pasó
    const monthDiff = today.getMonth() - founded.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < founded.getDate())) {
        years--;
    }

    return years;
}

function renderMilestoneBadge() {

    const el = document.getElementById('yearsCounter');
    if (el) el.textContent = calcYears();

    const words = ['técnicos', 'docentes'];
    const speed = { type: 60, erase: 40, pause: 1800, gap: 400 };
    let wordIdx  = 0;
    let charIdx  = 0;
    let erasing  = false;

    // Reemplazar el contenido estático del .milestone-text por la estructura dinámica
    const text = document.querySelector('.milestone-text');
    if (!text) return;

    text.innerHTML =
        `<strong id="yearsCounter">${calcYears()}</strong>` +
        ` años capacitando ` +
        `<span id="milestoneWord" class="milestone-word"></span>`;

    const target = document.getElementById('milestoneWord');
    if (!target) return;

    function tick() {
        const word = words[wordIdx];

        if (!erasing) {
            // Escribir carácter a carácter
            target.textContent = word.slice(0, ++charIdx);

            if (charIdx === word.length) {
                erasing = true;
                setTimeout(tick, speed.pause);
                return;
            }
            setTimeout(tick, speed.type);

        } else {
            // Borrar carácter a carácter
            target.textContent = word.slice(0, --charIdx);

            if (charIdx === 0) {
                erasing  = false;
                wordIdx  = (wordIdx + 1) % words.length;
                setTimeout(tick, speed.gap);
                return;
            }
            setTimeout(tick, speed.erase);
        }
    }

    tick();
}

/* ================================================================
    MAJORS RENDERER — Tarjetas dinámicas de carreras
================================================================ */

class MajorsRenderer {

    constructor() {
        this.init();
    }

    // =============================================================
    // INICIALIZAR
    // =============================================================

    init() {

        if (!window.AppData?.majors) {
            window.addEventListener('appdataLoaded', () => this.renderAll(), { once: true });
            return;
        }

        this.renderAll();
    }

    // =============================================================
    // RENDERIZAR AMBAS CATEGORÍAS
    // =============================================================

    renderAll() {

        const majors = window.AppData.majors.map((m, index) => {
            m.originalIndex = index;
            return m;
        });

        this.renderMajorsToContainer(
            'technicalMajors',
            majors.filter(m => m.type === 'technical')
        );

        this.renderMajorsToContainer(
            'professionalMajors',
            majors.filter(m => m.type === 'professional')
        );

        this.attachDelegation();
    }

    // =============================================================
    // RENDERIZAR UN CONTENEDOR
    // =============================================================

    renderMajorsToContainer(containerId, majors) {

        const container = document.getElementById(containerId);

        if (!container) {
            console.warn(`Contenedor no encontrado: ${containerId}`);
            return;
        }

        container.innerHTML = majors.map((major) => {

            // Índice real en el array original
            const originalIndex = major.originalIndex;

            // ID único por carrera para vincular con el modal de experiencias
            const majorId = `major-${originalIndex}-${major.title.replace(/\s+/g, '-').toLowerCase()}`;

            return `
                <div class="major-card" data-major-index="${originalIndex}">
                    <img src="${major.imageUrl}" alt="${major.title}" class="major-card-image">
                    <div class="major-card-content">
                        <h3 class="major-card-title">${major.title}</h3>
                        <p class="major-card-description major-card-description--clamped">${major.description}</p>
                        <div class="major-card-buttons">
                            <button
                                class="major-card-button"
                                data-major-index="${originalIndex}">
                                Más Info
                            </button>
                            <button
                                class="major-card-experiences-btn"
                                data-major-id="${majorId}"
                                data-major-title="${major.title}">
                                Experiencias
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // =============================================================
    // EVENT DELEGATION — Botones de tarjeta
    // =============================================================

    attachDelegation() {

        const section = document.querySelector('.majors-section');
        if (!section) return;

        section.addEventListener('click', (e) => {

            // -- Botón Experiencias --
            const expBtn = e.target.closest('.major-card-experiences-btn');
            if (expBtn) {
                e.preventDefault();
                if (window.experiencesModal) {
                    window.experiencesModal.openModal(
                        expBtn.dataset.majorTitle,
                        expBtn.dataset.majorId
                    );
                } else {
                    console.error('El modal de experiencias no está cargado');
                }
                return;
            }

            // -- Botón Más Info --
            const infoBtn = e.target.closest('.major-card-button');
            if (infoBtn) {
                e.preventDefault();

                const index = Number(infoBtn.dataset.majorIndex);
                const major = window.AppData.majors[index];

                if (!major) return;

                if (window.majorInfoModal) {
                    window.majorInfoModal.openModal(major);
                }
            }
        });
    }
}

/* ================================================================
    INICIALIZACIÓN
================================================================ */

onReady(() => {
    renderMilestoneBadge();
    window.majorsRenderer = new MajorsRenderer();
});