/* =========================================================================
    GESTOR DE ALERTA — Simple y directo
    =========================================================================
    AlertModal NO extiende BaseModal porque su comportamiento es distinto:
    no bloquea el scroll, no usa overlay y se cierra solo con un timeout.
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
            error   : '✕',
            warning : '!',
            info    : 'ℹ'
        };
    }

    /* -----------------------------------------------------------------
        Muestra la alerta
        @param {string} title    - Título de la alerta
        @param {string} message  - Mensaje descriptivo
        @param {string} type     - 'success' | 'error' | 'warning' | 'info'
        @param {number} duration - Duración en ms (default: 3000)
    ----------------------------------------------------------------- */
    show(title, message, type = 'success', duration = 3000) {

        if (!this.alertElement) return;

        // Actualizar contenido
        this.titleElement.textContent   = title;
        this.messageElement.textContent = message;

        // Resetear clases de tipo anteriores y aplicar la nueva
        this.alertElement.classList.remove('success', 'error', 'warning', 'info');
        this.alertElement.classList.add(type);

        // Icono según tipo (con fallback a 'success')
        if (this.iconElement) {
            this.iconElement.textContent = this.icons[type] ?? this.icons.success;
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