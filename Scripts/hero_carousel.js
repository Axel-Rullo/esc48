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
        this.autoPlayDuration = 15000; // ms

        // Referencias DOM cacheadas (se llenan en renderCarousel)
        this.items      = [];
        this.indicators = [];

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

        let news = window.AppData.heroNews;

        if (!news.length) {
            this.heroCarousel.innerHTML = '<p>No hay noticias disponibles.</p>';
            return;
        }

        // Ordenar: 'primicia' primero, 'destacado' segundo, el resto al final
        news = [...news].sort((a, b) => {
            const order = { primicia: 0, destacado: 1 };
            return (order[a.type] ?? 2) - (order[b.type] ?? 2);
        });

        this.heroCarousel.innerHTML   = '';
        this.heroIndicators.innerHTML = '';

        news.forEach((item, index) => {

            // ITEM — usando innerHTML en lugar de createElement × 7
            const heroItem = document.createElement('div');
            heroItem.className = `hero-item${index === 0 ? ' active' : ''}${item.type ? ` ${item.type}` : ''}`;
            heroItem.style.backgroundImage = `url('${item.imageUrl}')`;
            heroItem.innerHTML = `
                <div class="hero-content">
                    <a href="${item.link}" class="hero-title">${item.title}</a>
                    <a href="${item.link}" style="text-decoration:none; color:inherit">
                        <p class="hero-description">${item.description}</p>
                    </a>
                    <a href="${item.link}" class="hero-link-button">
                        Saber Más <i class="fas fa-arrow-right"></i>
                    </a>
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

        // Teclado — ignorar si el foco está en un campo de texto
        document.addEventListener('keydown', (e) => {
            const tag = document.activeElement.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;

            if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
                this.nextSlide();
                this.restartAutoPlay();
            } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
                this.previousSlide();
                this.restartAutoPlay();
            }
        });

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
    // AUTOPLAY Y BARRA DE PROGRESO
    // =============================================================

    animateProgressBar() {
        if (!this.progressBar) return;

        this.progressBar.style.transition = 'none';
        this.progressBar.style.width      = '0%';

        // Forzar reflow para que la transición se reinicie desde cero
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