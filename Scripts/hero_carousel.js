/* ================================================================
    CARRUSEL HERO - AUTOPLAY CADA 15 SEGUNDOS
   ================================================================ */

class HeroCarousel {

    constructor() {
        this.heroCarousel    = document.getElementById('heroCarousel');
        this.heroIndicators  = document.getElementById('heroIndicators');
        this.progressBar     = document.querySelector('.hero-progress-bar');

        this.currentIndex     = 0;
        this.isAnimating      = false;
        this.autoPlayInterval = null;
        this.autoPlayDuration = 15000; // ms

        // Referencias DOM cacheadas (se llenan en renderCarousel)
        this.items      = [];
        this.indicators = [];

        // Array ordenado — fuente de verdad
        this.sortedNews = [];

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

        // Ordenar: primicia → destacado → sin tipo (noticia)
        const typeOrder = { primicia: 0, destacado: 1 };
        this.sortedNews = [...raw].sort((a, b) => {
            const pa = typeOrder[a.type] ?? 2;
            const pb = typeOrder[b.type] ?? 2;
            return pa - pb;
        });

        this.heroCarousel.innerHTML   = '';
        this.heroIndicators.innerHTML = '';

        this.sortedNews.forEach((item, index) => {

            // ITEM
            const typeClass = item.type || 'noticia';
            const heroItem = document.createElement('div');
            heroItem.className = `hero-item${index === 0 ? ' active' : ''} ${typeClass}`;
            heroItem.style.backgroundImage = `url('${item.imageUrl}')`;
            const hasLink = item.link && item.link !== '#' && item.link !== '';
            heroItem.innerHTML = `
                <div class="hero-content">
                    <span class="hero-title">${item.title}</span>
                    <div class="hero-text">
                        <p class="hero-description">${item.description || ''}</p>
                    </div>
                    ${hasLink ? `
                    <div class="hero-actions">
                        <a class="hero-link-button" href="${item.link}" target="_blank" rel="noopener noreferrer">
                            Saber más <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>` : ''}
                </div>
            `;
            this.heroCarousel.appendChild(heroItem);

            // INDICADOR
            const indicator = document.createElement('button');
            indicator.className = `hero-indicator${index === 0 ? ' active' : ''} ${typeClass}`;
            indicator.setAttribute('data-index', index);
            indicator.addEventListener('click', () => this.goToSlide(index));
            this.heroIndicators.appendChild(indicator);

        });

        // Cachear referencias para no repetir querySelectorAll en cada slide
        this.items      = this.heroCarousel.querySelectorAll('.hero-item');
        this.indicators = this.heroIndicators.querySelectorAll('.hero-indicator');

        // Marcar como visto el primer slide (ya está visible al cargar)
        const firstNews = this.sortedNews[0];
        if (firstNews) this.markAsVisited(firstNews);

        // Sincronizar data-visited con lo guardado en localStorage
        this.sortedNews.forEach((item, index) => {
        if (this.wasVisited(item)) {
                this.indicators[index]?.setAttribute('data-visited', 'true');
            }
        });

        // Aplicar padding-bottom al hero-content para que nunca tape los indicadores
        this._adjustContentPadding();
        
        let resizeTicking = false;
        window.addEventListener('resize', () => {
            if (!resizeTicking) {
                window.requestAnimationFrame(() => {
                    this._adjustContentPadding();
                    resizeTicking = false;
                });
                resizeTicking = true;
            }
        });
    }

    // =============================================================
    // AJUSTAR PADDING DINÁMICO SOBRE LOS INDICADORES
    // =============================================================

    _adjustContentPadding() {
        const indicatorsEl = this.heroIndicators;
        if (!indicatorsEl) return;

        // Altura del bloque de indicadores + su distancia al fondo
        const indicatorRect = indicatorsEl.getBoundingClientRect();
        const sectionRect   = this.heroCarousel.closest('.hero-news-section')?.getBoundingClientRect();
        if (!sectionRect) return;

        // Espacio desde el fondo de la sección hasta la parte superior de los indicadores
        const spaceNeeded = (sectionRect.bottom - indicatorRect.top) + 12; // 12px de margen extra

        document.querySelectorAll('.hero-content').forEach(el => {
            el.style.paddingBottom = `${spaceNeeded}px`;
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
        }, { passive: true });

        this.heroCarousel.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
            this.restartAutoPlay();
        }, { passive: true });

        document.addEventListener('keydown', (e) => {
            const tag = document.activeElement.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;

            if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
                if (this.isAnimating) return;
                this.nextSlide();
                this.restartAutoPlay();
            } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
                if (this.isAnimating) return;
                this.previousSlide();
                this.restartAutoPlay();
            }
        });

    }

    handleSwipe() {
        if (this.isAnimating) return;
        const distance = this.touchStartX - this.touchEndX;
        if (distance >  this.minSwipeDistance) this.nextSlide();
        if (distance < -this.minSwipeDistance) this.previousSlide();
    }

    // =============================================================
    // NAVEGACIÓN
    // =============================================================

    goToSlide(index) {
        if (this.isAnimating || this.currentIndex === index) return;
        this.isAnimating = true;
        this.currentIndex = index;
        this.showSlide();
        this.restartAutoPlay();
        setTimeout(() => { this.isAnimating = false; }, 800);
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
            if (newsItem) this.markAsVisited(newsItem);
        }
    }

    nextSlide() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.currentIndex = (this.currentIndex + 1) % this.items.length;
        this.showSlide();
        setTimeout(() => { this.isAnimating = false; }, 800);
    }

    previousSlide() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
        this.showSlide();
        setTimeout(() => { this.isAnimating = false; }, 800);
    }

    // =============================================================
    // PERSISTENCIA
    // =============================================================

    _storageKey(item) {
        const id = (item.link && item.link !== '#' && item.link !== '')
            ? item.link
            : item.title;
        return `heroVisited:${id}`;
    }

    wasVisited(item) {
        return localStorage.getItem(this._storageKey(item)) !== null;
    }

    markAsVisited(item) {
        const data = {
            visited:     true,
            title:       item.title       || '',
            description: item.description || '',
            link:        item.link        || ''
        };
        localStorage.setItem(this._storageKey(item), JSON.stringify(data));
    }

    // =============================================================
    // AUTOPLAY Y BARRA DE PROGRESO
    // =============================================================

    animateProgressBar() {
        if (!this.progressBar) return;
        this.progressBar.classList.remove('animating');
        void this.progressBar.offsetHeight; // Forzar reflow
        this.progressBar.style.animationDuration = `${this.autoPlayDuration}ms`;
        this.progressBar.classList.add('animating');
    }

    startAutoPlay() {
        if (this.isAutoPlaying) return;
        this.isAutoPlaying = true;
        
        if (!this._animationListener) {
            this._animationListener = (e) => {
                if (e.animationName === 'progress-fill') {
                    this.nextSlide();
                    this.restartAutoPlay();
                }
            };
            this.progressBar.addEventListener('animationend', this._animationListener);
        }
        this.animateProgressBar();
    }

    stopAutoPlay() {
        this.isAutoPlaying = false;
        if (this.progressBar) {
            this.progressBar.classList.remove('animating');
            this.progressBar.style.transform = 'scaleX(0)'; // Oculta visualmente durante esperas/pausas
        }
    }

    restartAutoPlay() {
        this.stopAutoPlay();
        
        // Si hay una transición en curso (ej. fade de 800ms), esperamos a que termine
        // para que la barra no empiece a correr sobre la imagen anterior.
        const delay = this.isAnimating ? 800 : 20;
        
        clearTimeout(this._restartTimeout);
        this._restartTimeout = setTimeout(() => {
            this.startAutoPlay();
        }, delay);
    }

}

/* ================================================================
    INICIALIZAR
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
    window.heroCarousel = new HeroCarousel();
});