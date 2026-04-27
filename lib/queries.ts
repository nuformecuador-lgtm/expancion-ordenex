// Lectura de órdenes desde el CRM.
// Solo trae lo que el dashboard necesita: confirmadas + sin stock, país CR,
// últimos N días.

import { supabase } from './supabase';
import {
  ESTADOS_CONFIRMADOS,
  ESTADO_SIN_STOCK,
  PAIS_CR,
  RANGE_DAYS,
} from './gam-config';
import type { OrderRow } from './types';

export interface FetchParams {
  days?: number; // ventana hacia atrás
}

export interface FetchResult {
  rows: OrderRow[];
  rangeFrom: string;
  rangeTo: string;
}

const SELECT_COLS = [
  'id',
  'pais',
  'pedido',
  'fecha',
  'estado',
  'ciudad',
  'precio',
  'hora_confirmacion',
  'created_at',
].join(',');

const ESTADOS_RELEVANTES = [...ESTADOS_CONFIRMADOS, ESTADO_SIN_STOCK];

export async function fetchOrdersCR({ days = RANGE_DAYS }: FetchParams = {}): Promise<FetchResult> {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);

  const rangeFrom = from.toISOString();
  const rangeTo = to.toISOString();

  const { data, error } = await supabase
    .from('orders')
    .select(SELECT_COLS)
    .eq('pais', PAIS_CR)
    .in('estado', ESTADOS_RELEVANTES)
    .gte('created_at', rangeFrom)
    .lte('created_at', rangeTo)
    .order('created_at', { ascending: false })
    .limit(50000);

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[queries] fetchOrdersCR error:', error.message);
    return { rows: [], rangeFrom, rangeTo };
  }

  return {
    rows: (data ?? []) as unknown as OrderRow[],
    rangeFrom,
    rangeTo,
  };
}
