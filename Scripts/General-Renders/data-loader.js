/* ================================================================
    CARGADOR DE DATOS DESDE JSON
   ================================================================ */

class DataLoader {

    /* ================================================================
        CARGAR APPDATA
       ================================================================ */

    static async loadAppData(filePath = './Jsons/appdata.json') {
        try {
            const response = await fetch(filePath);

            if (!response.ok) throw new Error(`Error al cargar datos: ${response.status}`);

            const data     = await response.json();
            window.AppData = data;

            console.log('✓ AppData cargado desde', filePath);
            window.dispatchEvent(new CustomEvent('appdataLoaded', { detail: data }));

            return data;

        } catch (error) {
            console.error('✗ Error al cargar AppData:', error);
            throw error;
        }
    }

    /* ================================================================
        CARGAR EXPERIENCIAS
       ================================================================ */

    static async loadExperiencesData(filePath = './Jsons/experiencies.json') {
        try {
            const response = await fetch(filePath);

            if (!response.ok) throw new Error(`Error al cargar experiencias: ${response.status}`);

            const data            = await response.json();
            window.ExperiencesData = data;

            console.log('✓ ExperiencesData cargado desde', filePath);
            window.dispatchEvent(new CustomEvent('experiencesDataLoaded', { detail: data }));

            return data;

        } catch (error) {
            console.error('✗ Error al cargar ExperiencesData:', error);
            return null;
        }
    }

    /* ================================================================
        CARGAR TODO
       ================================================================ */

    static async loadAllData() {
        try {
            await Promise.all([
                DataLoader.loadAppData(),
                DataLoader.loadExperiencesData()
            ]);

            console.log('✓ Todos los datos cargados');
            window.dispatchEvent(new CustomEvent('allDataLoaded'));

        } catch (error) {
            console.error('✗ Error al cargar datos:', error);
        }
    }

    /* ================================================================
        ACCESO SINCRÓNICO (si ya fueron cargados)
       ================================================================ */

    static getAppData()         { return window.AppData         || null; }
    static getExperiencesData() { return window.ExperiencesData || null; }

    /* ================================================================
        ESPERAR A QUE LOS DATOS ESTÉN LISTOS
       ================================================================ */

    static waitForAppData() {
        return new Promise(resolve => {
            if (window.AppData) return resolve(window.AppData);
            window.addEventListener('appdataLoaded', e => resolve(e.detail), { once: true });
        });
    }

    static waitForExperiencesData() {
        return new Promise(resolve => {
            if (window.ExperiencesData) return resolve(window.ExperiencesData);
            window.addEventListener('experiencesDataLoaded', e => resolve(e.detail), { once: true });
        });
    }

}

/* ================================================================
    HELPER GLOBAL
    ================================================================ */

function onReady(fn) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
        fn();
    }
}

/* ================================================================
    ARRANQUE AUTOMÁTICO
   ================================================================ */

onReady(() => DataLoader.loadAllData());