export type BusinessLine = 1000 | 2000 | 3000 | 4000

export type QuoteStatus =
  | 'pendiente'
  | 'enviada'
  | 'aprobada'
  | 'facturada'
  | 'por_facturar'
  | 'no_aprobada'

export type UserRole = 'admin' | 'comercial' | 'readonly'

export interface Company {
  id: string
  name: string
  short_name: string | null
  rut: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  company_id: string | null
  full_name: string
  email: string | null
  phone: string | null
  notes: string | null
  created_at: string
  updated_at: string
  company?: Company
}

export interface Profile {
  id: string
  full_name: string | null
  role: UserRole
  business_lines: BusinessLine[]
  created_at: string
  updated_at: string
}

export interface Quote {
  id: string
  quote_number: string
  short_name: string | null
  company_id: string | null
  contact_id: string | null
  created_by: string | null
  business_line: BusinessLine
  group_name: string | null
  has_uf_section: boolean
  subtotal_clp: number
  discount_pct: number
  iva_clp: number
  total_clp: number
  subtotal_uf: number
  discount_pct_uf: number
  iva_uf: number
  total_uf: number
  payment_conditions: string | null
  delivery_time: string | null
  warranty: string | null
  dispatch: string | null
  contact_scope: string | null
  notes: string | null
  status: QuoteStatus
  quote_date: string
  sent_at: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
  company?: Company
  contact?: Contact
}

export interface QuoteItem {
  id: string
  quote_id: string
  item_order: number
  material_code: string | null
  description: string
  availability: string
  unit: string | null
  quantity: number
  currency: 'CLP' | 'UF'
  unit_price: number
  total_price: number
  selected_supplier: string | null
  cost_unit: number | null
  margin_pct: number | null
  created_at: string
  supplier_quotes?: SupplierQuote[]
}

export interface SupplierQuote {
  id: string
  quote_item_id: string
  supplier_name: string
  cost_unit: number
  margin_pct: number
  sell_unit: number
  is_selected: boolean
  url_reference: string | null
  notes: string | null
  created_at: string
}

export interface RentalFaena {
  id: string
  quote_id: string
  lugar_faena: string | null
  uso_especifico: string | null
  plazo_ejecucion: string | null
  estandar_minero: string | null
  equipamiento_add: string | null
  responsable_mant: string | null
  realiza_en_faena: 'Sí' | 'No' | 'No aplica'
  kit_repuestos: 'Sí' | 'No' | 'No aplica'
  plazo_retiro: string | null
  created_at: string
  updated_at: string
}

export interface QuoteFile {
  id: string
  quote_id: string
  file_type: 'pdf' | 'excel' | 'adjunto'
  file_name: string
  storage_path: string
  size_bytes: number | null
  uploaded_by: string | null
  created_at: string
}

export interface PipelineView {
  id: string
  quote_number: string
  short_name: string | null
  business_line: BusinessLine
  group_name: string | null
  status: QuoteStatus
  quote_date: string
  total_clp: number
  total_uf: number
  has_uf_section: boolean
  payment_conditions: string | null
  notes: string | null
  created_at: string
  sent_at: string | null
  approved_at: string | null
  company_name: string | null
  company_short: string | null
  contact_name: string | null
  contact_email: string | null
  created_by_name: string | null
  item_count: number
  file_count: number
}

export interface IncomeProjection {
  id: string
  quote_id: string
  period_label: string
  payment_date: string
  amount_clp: number | null
  amount_uf: number | null
  percentage: number | null
  is_paid: boolean
  paid_at: string | null
  created_at: string
}