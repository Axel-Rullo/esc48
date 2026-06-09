/* ================================================================
    MODAL TELÉFONO
    ================================================================
    Extiende BaseModal, que provee: open(), close(), isOpen()
    y registerCloseListeners() (Escape + backdrop + overlay).
    ================================================================ */

class PhoneModal extends BaseModal {

    constructor() {
        // Pasar el modal y el overlay a la clase base
        super(
            document.getElementById('phoneModal'),
            document.getElementById('overlay')
        );

        this.phoneBtn      = document.getElementById('phoneBtn');
        this.closePhoneBtn = document.getElementById('closePhoneModal');
        this.phoneList     = document.getElementById('phoneList');

        this.init();
    }

    // =============================================================
    // INICIALIZAR
    // =============================================================

    init() {

        this.renderPhones();

        // Listeners estándar: Escape + backdrop + overlay (desde BaseModal)
        this.registerCloseListeners();

        // Botón del footer que abre el modal
        this.phoneBtn?.addEventListener('click', () => this.open());

        // Botón X del modal
        this.closePhoneBtn?.addEventListener('click', () => this.close());
    }

    // =============================================================
    // RENDERIZAR LISTA DE TELÉFONOS
    // =============================================================

    renderPhones() {

        // Si AppData aún no está disponible, esperar al evento
        if (!window.AppData) {
            window.addEventListener('appdataLoaded', () => this.renderPhones(), { once: true });
            return;
        }

        this.phoneList.innerHTML = window.AppData.phones.map(phone => `
            <li class="phone-item">
                <span class="phone-label">${phone.label}</span>
                <a href="tel:${phone.number.replace(/\D/g, '')}" class="phone-number">
                    ${phone.number}
                </a>
            </li>
        `).join('');
    }
}

// Instancia global
window.phoneModal = new PhoneModal();