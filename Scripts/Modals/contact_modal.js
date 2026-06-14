/* ================================================================
    MODAL CONTACTO
    ================================================================ */

class ContactModal extends BaseModal {

    constructor() {
        super(
            document.getElementById('contactModal'),
            document.getElementById('overlay')
        );

        this.contactForm = document.getElementById('contactForm');
        this.closeBtn    = document.getElementById('closeModal');
        this.submitBtn   = this.contactForm?.querySelector('button[type="submit"]');

        this.isSubmitting = false;

        this.init();
    }

    // =============================================================
    // INICIALIZAR
    // =============================================================

    init() {
        if (!this.modal || !this.contactForm) return;

        this.registerCloseListeners();

        // Botón X del modal
        this.closeBtn?.addEventListener('click', () => this.close());

        // Abrir al hacer clic en el botón del footer
        document.addEventListener('click', (e) => {
            if (e.target.closest('#contactBtn')) {
                e.preventDefault();
                this.open();
            }
        });

        // Submit del formulario
        this.contactForm.addEventListener('submit', (e) => this.handleSubmit(e));

        // Enter en desktop envía (Shift+Enter = salto de línea)
        document.getElementById('asunto')?.addEventListener('keydown', (e) => {
            if (window.innerWidth > 1024 && e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.contactForm.requestSubmit();
            }
        });
    }

    // =============================================================
    // SUBMIT
    // =============================================================

    handleSubmit(e) {

        e.preventDefault();
        if (this.isSubmitting) return;

        this.isSubmitting = true;
        this.setLoadingState('loading');

        const formData = {
            nombre   : document.getElementById('nombre')?.value.trim(),
            apellidos: document.getElementById('apellidos')?.value.trim(),
            email    : document.getElementById('email')?.value.trim(),
            ciudad   : document.getElementById('ciudad')?.value.trim(),
            asunto   : document.getElementById('asunto')?.value.trim()
        };

        console.log('✓ Formulario enviado:', formData);

        // Simulación de envío — reemplazar con fetch() cuando haya backend
        setTimeout(() => {

            this.setLoadingState('success');

            setTimeout(() => {
                this.contactForm.reset();
                this.setLoadingState('idle');
                this.isSubmitting = false;
                this.close();

                window.customAlert?.show(
                    '¡Gracias por tu mensaje!',
                    'Nos pondremos en contacto pronto.',
                    'success',
                    3000
                );
            }, 1200);

        }, 800);
    }

    // =============================================================
    // ESTADOS VISUALES DEL BOTÓN ENVIAR
    // =============================================================

    setLoadingState(state) {

        if (!this.submitBtn) return;

        // Guardar texto original la primera vez
        if (!this.submitBtn.dataset.originalText) {
            this.submitBtn.dataset.originalText = this.submitBtn.textContent.trim();
        }

        switch (state) {

            case 'loading':
                this.submitBtn.disabled   = true;
                this.submitBtn.innerHTML  = `<span class="btn-spinner"></span> Enviando...`;
                this.submitBtn.classList.replace('btn-success', 'btn-loading') ||
                this.submitBtn.classList.add('btn-loading');
                break;

            case 'success':
                this.submitBtn.innerHTML = `<span class="btn-check">✓</span> ¡Enviado!`;
                this.submitBtn.classList.replace('btn-loading', 'btn-success') ||
                this.submitBtn.classList.add('btn-success');
                break;

            default:
                this.submitBtn.disabled     = false;
                this.submitBtn.textContent  = this.submitBtn.dataset.originalText || 'Enviar Mensaje';
                this.submitBtn.classList.remove('btn-loading', 'btn-success');
                break;
        }
    }
}

// Instancia global
window.contactModal = new ContactModal();