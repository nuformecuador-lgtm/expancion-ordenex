// Types compartidos del dashboard.

export type Provincia =
  | 'San José'
  | 'Alajuela'
  | 'Cartago'
  | 'Heredia'
  | 'Guanacaste'
  | 'Puntarenas'
  | 'Limón'
  | 'Sin clasificar';

export type GamStatus = 'cubre' | 'parcial' | 'expandir' | 'no-aplica';

/**
 * Fila relevante de `orders` (CRM Director Ecommerce).
 * Mantenemos solo las columnas que el dashboard usa.
 */
export interface OrderRow {
  id: number;
  pais: string | null;
  pedido: string | null;
  fecha: string | null;
  estado: string | null;
  ciudad: string | null;
  precio: number | string | null;
  hora_confirmacion: string | null;
  created_at: string | null;
}

export interface CantonStat {
  canton: string;
  confirmadas: number;
  sinStock: number;
  total: number;
}

export interface ProvinciaStat {
  provincia: Provincia;
  gam: GamStatus;
  hub: string;
  ruta: string | null;
  confirmadas: number;
  sinStock: number;
  total: number;
  cantones: CantonStat[];
}

export interface DailyBucket {
  fecha: string; // YYYY-MM-DD
  confirmadas: number;
  sinStock: number;
}

export interface DashboardData {
  generatedAt: string;
  rangeFrom: string;
  rangeTo: string;
  totals: {
    confirmadas: number;
    sinStock: number;
    total: number;
    provinciasActivas: number;
  };
  cobertura: {
    cubre: number;
    parcial: number;
    expandir: number;
  };
  provincias: ProvinciaStat[];
  focusZones: ProvinciaStat[];
  estadoBreakdown: { estado: string; count: number }[];
  daily: DailyBucket[];
  warnings: string[];
}
