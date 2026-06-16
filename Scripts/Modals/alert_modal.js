/* =========================================================================
    GESTOR DE ALERTA
    ========================================================================= */

class AlertModal {

    constructor() {
        this.alertElement   = document.getElementById('customAlert');
        this.titleElement   = document.getElementById('customAlertTitle');
        this.messageElement = document.getElementById('customAlertMessage');
        this.iconElement    = document.getElementById('customAlertIcon');

        this.timeout = null;

        // Iconos por tipo de alerta
        this.icons = {
            success : '✓',
            error   : '✕'
        };
    }

    /* -----------------------------------------------------------------
        Muestra la alerta
        @param {string} title    - Título de la alerta
        @param {string} message  - Mensaje descriptivo
        @param {string} type     - 'success' | 'error'
        @param {number} duration - Duración en ms (default: 3000)
    ----------------------------------------------------------------- */
    show(title, message, type = 'success', duration = 3000) {

        if (!this.alertElement) return;

        // Normalizar: solo se aceptan 'success' y 'error'
        const safeType = type === 'error' ? 'error' : 'success';

        // Actualizar contenido
        this.titleElement.textContent   = title;
        this.messageElement.textContent = message;

        // Resetear clase anterior y aplicar la nueva
        this.alertElement.classList.remove('success', 'error');
        this.alertElement.classList.add(safeType);

        // Icono según tipo
        if (this.iconElement) {
            this.iconElement.textContent = this.icons[safeType];
        }

        // Mostrar y programar el cierre automático
        this.alertElement.classList.add('active');
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => this.hide(), duration);
    }

    // Oculta la alerta
    hide() {
        this.alertElement?.classList.remove('active');
    }
}

// Instancia global
window.customAlert = new AlertModal();