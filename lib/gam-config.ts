// Constantes de negocio para la operación COD de Costa Rica.
// Definen qué provincias cubre GAM hoy y dónde se planea expandir.

import type { Provincia, GamStatus } from './types';

export const GAM_STATUS: Record<Provincia, GamStatus> = {
  'San José': 'cubre',
  'Heredia': 'cubre',
  'Cartago': 'cubre',
  'Alajuela': 'parcial',
  'Guanacaste': 'expandir',
  'Limón': 'expandir',
  'Puntarenas': 'expandir',
  'Sin clasificar': 'no-aplica',
};

export const HUB_MAP: Record<Provincia, string> = {
  'Guanacaste': 'Liberia / Santa Cruz',
  'Limón': 'Limón centro',
  'Alajuela': 'Alajuela ciudad',
  'Puntarenas': 'Puntarenas',
  'Cartago': 'Cartago',
  'Heredia': 'Heredia',
  'San José': 'GAM (cubre)',
  'Sin clasificar': '—',
};

export const RUTA_MAP: Partial<Record<Provincia, string>> = {
  'Guanacaste': 'Ruta R6 + R7',
  'Limón': 'Ruta R5',
  'Puntarenas': 'Ruta R2',
};

// Estados que el dashboard considera CONFIRMADOS (cualquier canal).
// El usuario confirmó: "se mide todo lo confirmado no importa el canal".
export const ESTADOS_CONFIRMADOS = [
  'CONFIRMADO EFFICHAT',
  'CONFIRMADO LLAMADA',
  'CONFIRMADO WHATSAPP',
  'CARRITO CONFIRMADO',
] as const;

export const ESTADO_SIN_STOCK = 'PRODUCTO SIN STOCK';

export const PAIS_CR = 'CR';

export const PROVINCIAS_ORDER: Provincia[] = [
  'San José',
  'Alajuela',
  'Heredia',
  'Cartago',
  'Guanacaste',
  'Puntarenas',
  'Limón',
  'Sin clasificar',
];

// Provincias que son foco de expansión (lo que el dashboard quiere resaltar).
export const FOCUS_PROVINCIAS: Provincia[] = ['Guanacaste', 'Limón', 'Puntarenas'];

// Ventana de lectura por defecto: últimos 7 días.
export const RANGE_DAYS = 7;
