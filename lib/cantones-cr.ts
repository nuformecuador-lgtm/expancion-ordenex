// Mapa cantón → provincia de Costa Rica (división política oficial).
// Fuente: 7 provincias × 84 cantones (información pública del INEC/IFAM).
// Las claves se normalizan (mayúsculas, sin tildes, sin espacios extra) en `normalizeCanton`.

import type { Provincia } from './types';

const RAW: Record<Provincia, string[]> = {
  'San José': [
    'San José', 'Escazú', 'Desamparados', 'Puriscal', 'Tarrazú', 'Aserrí', 'Mora',
    'Goicoechea', 'Santa Ana', 'Alajuelita', 'Vázquez de Coronado', 'Coronado',
    'Acosta', 'Tibás', 'Moravia', 'Montes de Oca', 'Turrubares', 'Dota',
    'Curridabat', 'Pérez Zeledón', 'León Cortés', 'León Cortés Castro',
  ],
  'Alajuela': [
    'Alajuela', 'San Ramón', 'Grecia', 'San Mateo', 'Atenas', 'Naranjo',
    'Palmares', 'Poás', 'Orotina', 'San Carlos', 'Zarcero', 'Sarchí',
    'Valverde Vega', 'Upala', 'Los Chiles', 'Guatuso', 'Río Cuarto',
  ],
  'Cartago': [
    'Cartago', 'Paraíso', 'La Unión', 'Jiménez', 'Turrialba', 'Alvarado',
    'Oreamuno', 'El Guarco',
  ],
  'Heredia': [
    'Heredia', 'Barva', 'Santo Domingo', 'Santa Bárbara', 'San Rafael',
    'San Isidro', 'Belén', 'Flores', 'San Pablo', 'Sarapiquí',
  ],
  'Guanacaste': [
    'Liberia', 'Nicoya', 'Santa Cruz', 'Bagaces', 'Carrillo', 'Cañas',
    'Abangares', 'Tilarán', 'Nandayure', 'La Cruz', 'Hojancha',
  ],
  'Puntarenas': [
    'Puntarenas', 'Esparza', 'Buenos Aires', 'Montes de Oro', 'Osa',
    'Quepos', 'Aguirre', 'Golfito', 'Coto Brus', 'Parrita', 'Corredores',
    'Garabito', 'Monteverde', 'Puerto Jiménez',
  ],
  'Limón': [
    'Limón', 'Pococí', 'Siquirres', 'Talamanca', 'Matina', 'Guácimo',
  ],
  'Sin clasificar': [],
};

export function normalizeCanton(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar tildes
    .replace(/[^a-zA-Z\s]/g, ' ')    // quitar números y signos (datos sucios: teléfonos pegados)
    .toUpperCase()
    .trim()
    .replace(/\s+/g, ' ');
}

const LOOKUP: Map<string, Provincia> = (() => {
  const m = new Map<string, Provincia>();
  for (const [prov, cantones] of Object.entries(RAW) as [Provincia, string[]][]) {
    for (const c of cantones) {
      m.set(normalizeCanton(c), prov);
    }
  }
  return m;
})();

/**
 * Devuelve la provincia para un cantón dado, o 'Sin clasificar' si no matchea.
 * El campo `ciudad` del CRM viene sucio (a veces incluye teléfonos), por eso
 * aplicamos `normalizeCanton` antes de buscar.
 */
export function provinciaDeCanton(rawCiudad: string | null | undefined): Provincia {
  if (!rawCiudad) return 'Sin clasificar';
  const norm = normalizeCanton(rawCiudad);
  if (!norm) return 'Sin clasificar';

  // Match directo
  const direct = LOOKUP.get(norm);
  if (direct) return direct;

  // Match parcial: si el string contiene el nombre de un cantón conocido.
  const entries = Array.from(LOOKUP.entries());
  for (const [key, prov] of entries) {
    if (norm.includes(key) || key.includes(norm)) return prov;
  }

  return 'Sin clasificar';
}

export function cleanCantonName(rawCiudad: string | null | undefined): string {
  if (!rawCiudad) return '—';
  // limpiamos números (teléfonos pegados) y dejamos primer segmento legible
  const cleaned = rawCiudad.replace(/\d{4,}/g, '').replace(/\s+/g, ' ').trim();
  return cleaned || '—';
}
