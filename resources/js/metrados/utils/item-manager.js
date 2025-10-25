// resources/js/core/item-manager.js

/**
 * Gestiona la numeración jerárquica de items:
 * - Partidas: 01, 02, 03...
 * - Subpartidas: 01.01, 01.02, 01.03...
 * - Detalles: vacío (sin número)
 */
export class ItemManager {
    /**
     * Determina el tipo de item basado en su código
     */
    static getItemType(itemCode) {
        if (!itemCode || itemCode.trim() === '') return 'detail';

        const parts = itemCode.split('.');
        if (parts.length === 1) return 'partida';
        if (parts.length === 2) return 'subpartida';
        return 'detail';
    }

    /**
     * Obtiene el código de partida padre
     * Ej: "01.02" → "01"
     */
    static getParentPartida(itemCode) {
        if (!itemCode) return null;
        const parts = itemCode.split('.');
        return parts.length >= 2 ? parts[0] : null;
    }

    /**
     * Obtiene el código de subpartida padre
     * Ej: "01.02.01" → "01.02"
     */
    static getParentSubpartida(itemCode) {
        if (!itemCode) return null;
        const parts = itemCode.split('.');
        return parts.length >= 3 ? `${parts[0]}.${parts[1]}` : null;
    }

    /**
     * Genera el siguiente código de partida
     */
    static getNextPartidaCode(existingItems) {
        const partidas = existingItems
            .map(item => item['0'])
            .filter(code => code && /^\d+$/.test(code))
            .map(code => parseInt(code, 10));

        const max = partidas.length > 0 ? Math.max(...partidas) : 0;
        return String(max + 1).padStart(2, '0');
    }

    /**
     * Genera el siguiente código de subpartida dentro de una partida
     */
    static getNextSubpartidaCode(partidaCode, existingItems) {
        const subpartidas = existingItems
            .map(item => item['0'])
            .filter(code => code && code.startsWith(`${partidaCode}.`))
            .map(code => {
                const parts = code.split('.');
                return parts.length === 2 ? parseInt(parts[1], 10) : 0;
            });

        const max = subpartidas.length > 0 ? Math.max(...subpartidas) : 0;
        return `${partidaCode}.${String(max + 1).padStart(2, '0')}`;
    }

    /**
     * Formatea un código de item para visualización
     */
    static formatItemCode(code) {
        if (!code) return '';
        return code.toString().trim();
    }

    /**
     * Valida si un código de item es válido
     */
    static isValidItemCode(code) {
        if (!code) return false;

        // Partida: solo dígitos (01, 02, etc.)
        if (/^\d+$/.test(code)) return true;

        // Subpartida: XX.XX
        if (/^\d+\.\d+$/.test(code)) return true;

        return false;
    }

    /**
     * Obtiene todos los detalles (hijos) de una partida o subpartida
     */
    static getChildrenItems(parentCode, allItems) {
        if (!parentCode) return [];

        return allItems.filter(item => {
            const itemCode = item['0'];
            if (!itemCode) return false;

            const type = this.getItemType(itemCode);

            if (type === 'detail') {
                // Verificar si el detalle está justo después del padre
                const itemIndex = allItems.indexOf(item);
                if (itemIndex === 0) return false;

                let prevIndex = itemIndex - 1;
                while (prevIndex >= 0) {
                    const prevItem = allItems[prevIndex];
                    const prevCode = prevItem['0'];

                    if (prevCode === parentCode) return true;
                    if (prevCode && prevCode !== '') return false;

                    prevIndex--;
                }
            }

            return false;
        });
    }

    /**
     * Calcula la suma total de una partida/subpartida incluyendo sus detalles
     */
    static calculateParentTotal(parentCode, allItems, totalField = '13') {
        let total = 0;

        // Buscar el item padre
        const parentItem = allItems.find(item => item['0'] === parentCode);
        if (parentItem && parentItem[totalField]) {
            total += parseFloat(parentItem[totalField]) || 0;
        }

        // Sumar todos los detalles hijos
        const children = this.getChildrenItems(parentCode, allItems);
        children.forEach(child => {
            const childTotal = parseFloat(child[totalField]) || 0;
            total += childTotal;
        });

        return total;
    }

    /**
     * Agrupa items por su partida padre
     */
    static groupByPartida(items) {
        const groups = {};

        items.forEach(item => {
            const code = item['0'];
            const type = this.getItemType(code);

            if (type === 'partida') {
                if (!groups[code]) {
                    groups[code] = {
                        partida: item,
                        subpartidas: [],
                        detalles: []
                    };
                }
            } else if (type === 'subpartida') {
                const parent = this.getParentPartida(code);
                if (parent) {
                    if (!groups[parent]) {
                        groups[parent] = {
                            partida: null,
                            subpartidas: [],
                            detalles: []
                        };
                    }
                    groups[parent].subpartidas.push(item);
                }
            } else if (type === 'detail') {
                // Los detalles se agrupan con la última partida/subpartida válida
                const keys = Object.keys(groups);
                if (keys.length > 0) {
                    const lastKey = keys[keys.length - 1];
                    groups[lastKey].detalles.push(item);
                }
            }
        });

        return groups;
    }
}