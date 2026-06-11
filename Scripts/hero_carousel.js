/* ================================================================
    CARRUSEL HERO - AUTOPLAY CADA 15 SEGUNDOS
   ================================================================ */

class HeroCarousel {

    constructor() {
        this.heroCarousel    = document.getElementById('heroCarousel');
        this.heroIndicators  = document.getElementById('heroIndicators');
        this.progressBar     = document.querySelector('.hero-progress-bar');

        this.currentIndex     = 0;
        this.autoPlayInterval = null;
        this.autoPlayDuration = 15000;

        // Referencias DOM cacheadas (se llenan en renderCarousel)
        this.items      = [];
        this.indicators = [];

        // Array ordenado — fuente de verdad para openModal
        this.sortedNews = [];

        // Elementos del modal (fijos en el DOM)
        this.modal      = document.getElementById('heroNewsModal');
        this.modalBadge = document.getElementById('heroModalBadge');
        this.modalTitle = document.getElementById('heroModalTitle');
        this.modalDesc  = document.getElementById('heroModalDesc');
        this.modalLink  = document.getElementById('heroModalLink');
        this.overlay    = document.getElementById('overlay');

        // Swipe táctil
        this.touchStartX      = 0;
        this.touchEndX        = 0;
        this.minSwipeDistance = 50;

        if (!this.heroCarousel || !this.heroIndicators) {
            console.warn('HeroCarousel: Elementos no encontrados');
            return;
        }

        this.init();
    }

    init() {
        this.renderCarousel();
        this.setupEventListeners();
        this.startAutoPlay();
        window.dispatchEvent(new Event('heroCarouselReady'));
    }

    // =============================================================
    // RENDERIZAR
    // =============================================================

    renderCarousel() {

        if (!window.AppData?.heroNews) {
            window.addEventListener('appdataLoaded', () => this.renderCarousel(), { once: true });
            return;
        }

        const raw = window.AppData.heroNews;

        if (!raw.length) {
            this.heroCarousel.innerHTML = '<p>No hay noticias disponibles.</p>';
            return;
        }

        // Ya vienen ordenadas del JSON
        this.sortedNews = [...raw];

        this.heroCarousel.innerHTML   = '';
        this.heroIndicators.innerHTML = '';

        this.sortedNews.forEach((item, index) => {

            // ITEM
            const heroItem = document.createElement('div');
            heroItem.className = `hero-item${index === 0 ? ' active' : ''}${item.type ? ` ${item.type}` : ''}`;
            heroItem.style.backgroundImage = `url('${item.imageUrl}')`;
            heroItem.innerHTML = `
                <div class="hero-content">
                    <span class="hero-title">${item.title}</span>
                    <div class="hero-text">
                        <p class="hero-description">${item.description}</p>
                    </div>
                    <div class="hero-actions">
                        <button class="hero-link-button" data-index="${index}">
                            Saber Más <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            `;
            this.heroCarousel.appendChild(heroItem);

            // INDICADOR
            const indicator = document.createElement('button');
            indicator.className = `hero-indicator${index === 0 ? ' active' : ''}${item.type ? ` ${item.type}` : ''}`;
            indicator.setAttribute('data-index', index);
            indicator.addEventListener('click', () => this.goToSlide(index));
            this.heroIndicators.appendChild(indicator);

        });

        // Cachear referencias para no repetir querySelectorAll en cada slide
        this.items      = this.heroCarousel.querySelectorAll('.hero-item');
        this.indicators = this.heroIndicators.querySelectorAll('.hero-indicator');

        // Marcar como visto el primer slide (ya está visible al cargar)
        const firstNews = this.sortedNews[0];
        if (firstNews) this.markAsVisited(firstNews.link);

        // Sincronizar data-visited con lo guardado en localStorage
        this.sortedNews.forEach((item, index) => {
            if (this.wasVisited(item.link)) {
                this.indicators[index]?.setAttribute('data-visited', 'true');
            }
        });
    }

    // =============================================================
    // EVENTOS
    // =============================================================

    setupEventListeners() {

        // Swipe táctil
        this.heroCarousel.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
            this.stopAutoPlay();
        }, false);

        this.heroCarousel.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
            this.startAutoPlay();
        }, false);

        document.addEventListener('keydown', (e) => {
            const tag = document.activeElement.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;

            if (e.key === 'Escape') {
                this.closeModal();
                return;
            }

            if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
                this.nextSlide();
                this.restartAutoPlay();
            } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
                this.previousSlide();
                this.restartAutoPlay();
            }
        });

        // Abrir modal al hacer click en "Saber Más" (delegación de eventos)
        this.heroCarousel.addEventListener('click', (e) => {
            const btn = e.target.closest('.hero-link-button');
            if (!btn) return;
            const idx = parseInt(btn.dataset.index, 10);
            this.openModal(idx);
        });

        // Cerrar modal con el overlay general y el botón de cierre
        const closeBtn = document.getElementById('closeHeroModal');

        this.overlay?.addEventListener('click', () => this.closeModal());
        closeBtn?.addEventListener('click',     () => this.closeModal());

    }

    handleSwipe() {
        const distance = this.touchStartX - this.touchEndX;
        if (distance >  this.minSwipeDistance) this.nextSlide();
        if (distance < -this.minSwipeDistance) this.previousSlide();
    }

    // =============================================================
    // NAVEGACIÓN
    // =============================================================

    goToSlide(index) {
        this.currentIndex = index;
        this.showSlide();
        this.restartAutoPlay();
    }

    showSlide() {
        this.items.forEach(item => item.classList.remove('active'));
        this.indicators.forEach(ind  => ind.classList.remove('active'));

        this.items[this.currentIndex]?.classList.add('active');

        const activeIndicator = this.indicators[this.currentIndex];
        if (activeIndicator) {
            activeIndicator.classList.add('active');
            activeIndicator.setAttribute('data-visited', 'true');

            // Usa sortedNews — el mismo orden que el carrusel
            const newsItem = this.sortedNews[this.currentIndex];
            if (newsItem) this.markAsVisited(newsItem.link);
        }
    }

    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.items.length;
        this.showSlide();
    }

    previousSlide() {
        this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
        this.showSlide();
    }

    // =============================================================
    // PERSISTENCIA
    // =============================================================

    _storageKey(link) {
        return `heroVisited:${link}`;
    }

    wasVisited(link) {
        return localStorage.getItem(this._storageKey(link)) === 'true';
    }

    markAsVisited(link) {
        localStorage.setItem(this._storageKey(link), 'true');
    }

    // =============================================================
    // MODAL — TÍTULO Y DESCRIPCIÓN COMPLETAS
    // =============================================================

    openModal(index) {
        const item = this.sortedNews[index];
        if (!item || !this.modal) return;

        // Badge
        const badgeLabels = { primicia: '🌟 Primicia', destacado: '⭐ Destacado' };
        this.modalBadge.textContent = badgeLabels[item.type] || 'Noticia';
        this.modalBadge.className   = `hero-modal-badge ${item.type || ''}`;

        // Contenido completo (sin recorte)
        this.modalTitle.textContent = item.title;
        this.modalDesc.textContent  = item.description;

        // Botón "Ir a la nota" solo si el JSON tiene link real
        const hasLink = item.link && item.link !== '#' && item.link !== '';
        this.modalLink.href = hasLink ? item.link : '#';
        this.modalLink.toggleAttribute('hidden', !hasLink);

        this.modal.classList.add('active');
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.stopAutoPlay();
    }

    closeModal() {
        this.modal?.classList.remove('active');
        this.overlay?.classList.remove('active');
        document.body.style.overflow = '';
        this.startAutoPlay();
    }

    // =============================================================
    // AUTOPLAY Y BARRA DE PROGRESO
    // =============================================================

    animateProgressBar() {
        if (!this.progressBar) return;

        this.progressBar.style.transition = 'none';
        this.progressBar.style.width      = '0%';

        void this.progressBar.offsetHeight;

        this.progressBar.style.transition = `width ${this.autoPlayDuration}ms linear`;
        this.progressBar.style.width      = '100%';
    }

    startAutoPlay() {
        if (this.autoPlayInterval) return;

        this.animateProgressBar();
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
            this.animateProgressBar();
        }, this.autoPlayDuration);
    }

    stopAutoPlay() {
        clearInterval(this.autoPlayInterval);
        this.autoPlayInterval = null;
    }

    restartAutoPlay() {
        this.stopAutoPlay();
        this.startAutoPlay();
    }

}

/* ================================================================
    INICIALIZAR
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
    window.heroCarousel = new HeroCarousel();
});