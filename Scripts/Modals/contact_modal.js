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

        this.isSubmitting  = false;
        this._alertPending = false;

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

        // Enter = "Enviar" - Shift + Enter = "Salto de línea")
        document.getElementById('asunto')?.addEventListener('keydown', (e) => {
            if (window.innerWidth > 1024 && e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.contactForm.requestSubmit();
            }
        });

        // lista de emails
        DataLoader.waitForAppData().then((data) => {
            if (data.emails?.length) {
                this.initEmailDropdown(data.emails);
            }
        });
    }

    // =============================================================
    // CERRAR
    // =============================================================

    close() {
        // Mismo seguro anti-spam que BaseModal
        if (!this.isOpen() || this._toggling) return;
        this._lockToggle();

        this.modal.classList.remove('active');
        this.overlay?.classList.remove('active');
        BaseModal._forceHideHint();

        if (this._alertPending) {
            // El scroll se mantiene bloqueado hasta terminar la animación
            return;
        }

        BaseModal._unlockScroll();
    }

    // =============================================================
    // DROPDOWN DE EMAILS
    // =============================================================

    initEmailDropdown(emails) {
        const btn      = document.getElementById('emailDropdownBtn');
        const dropdown = document.getElementById('emailDropdown');
        const list     = document.getElementById('emailDropdownList');

        if (!btn || !dropdown || !list) return;

        // Boton para copiar Email
        const toast = document.createElement('div');
        toast.className = 'email-copy-toast';
        toast.textContent = 'Copiado en el portapapeles';
        document.body.appendChild(toast);

        // Renderizar items desde AppData
        emails.forEach(({ label, address }) => {
            const li = document.createElement('li');
            li.className = 'email-dropdown-item';
            li.innerHTML = `
                <div class="email-item-info">
                    <span class="email-item-label">${label}</span>
                    <span class="email-item-address">${address}</span>
                </div>
                <button class="email-action-btn"
                        title="Copiar email"
                        aria-label="Copiar ${address}">&#128203;</button>`;

            // Copiar al portapapeles + mostrar alerta
            li.querySelector('button').addEventListener('click', (e) => {
                e.stopPropagation();
                navigator.clipboard?.writeText(address).then(() => {
                    toast.classList.add('visible');
                    setTimeout(() => toast.classList.remove('visible'), 2000);
                });
            });

            list.appendChild(li);
        });

        // Toggle abrir / cerrar
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.hidden = !dropdown.hidden;
        });

        // Cerrar al hacer clic fuera
        document.addEventListener('click', () => {
            dropdown.hidden = true;
        });

        // Evitar que un clic interno lo cierre
        dropdown.addEventListener('click', (e) => e.stopPropagation());
    }

    // =============================================================
    // SUBMIT
    // =============================================================

    handleSubmit(e) {

        e.preventDefault();
        if (this.isSubmitting) return;

        this.isSubmitting = true;
        this.setLoadingState('loading');
        BaseModal._forceHideHint();

        const formData = {
            nombre   : document.getElementById('nombre')?.value.trim(),
            apellidos: document.getElementById('apellidos')?.value.trim(),
            email    : document.getElementById('email')?.value.trim(),
            ciudad   : document.getElementById('ciudad')?.value.trim(),
            asunto   : document.getElementById('asunto')?.value.trim()
        };

        console.log('✓ Formulario enviado:', formData);

        // Simulación de envío — reemplazar con fetch() cuando haya backend
        setTimeout(async () => {

            try {
                this.setLoadingState('success');

                setTimeout(() => {
                    this.contactForm.reset();
                    this.setLoadingState('idle');
                    this.isSubmitting  = false;
                    this._alertPending = true;
                    this.close();

                    window.customAlert?.show(
                        '¡Gracias por tu mensaje!',
                        'Nos pondremos en contacto pronto.',
                        'success',
                        3000
                    );

                    // Restaurar scroll cuando la alerta termina
                    setTimeout(() => {
                        this._alertPending = false;
                        BaseModal._unlockScroll();
                    }, 3000);
                }, 1200);

            } catch {

                this.setLoadingState('idle');
                this.isSubmitting = false;

                window.customAlert?.show(
                    'Error al enviar',
                    'No se pudo enviar el mensaje. Intentá de nuevo.',
                    'error',
                    3000
                );
            }

        }, 1800); // 1.8s (enviando) + 1.2s (éxito) + 3.0s (alerta) = 6 segundos en total
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