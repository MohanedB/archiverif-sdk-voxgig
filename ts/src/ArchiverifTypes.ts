// Typed models for the Archiverif SDK.
//
// GENERATED from the API model: main.kit.entity.<e>.fields{} and per-op
// params (op.<name>.points[].g.params[]). Field/param types come from the
// canonical type sentinels via @voxgig/sdkgen canonToType (source of truth:
// @voxgig/apidef VALID_CANON). Do not edit by hand.

export interface DocumentType {
  code: string
  is_active: boolean
  jurisdiction?: any
  label_en: string
  label_fr: string
  order: number
  parsed: boolean
  requestable: boolean
  reuse_eligible: boolean
  short_en: string
  short_fr: string
  validity_hint_en?: any
  validity_hint_fr?: any
  verify_note_en?: any
  verify_note_fr?: any
  verify_url?: any
}

export interface DocumentTypeListMatch {
  jurisdiction?: any
}

export interface KeyInfo {
  created_at: string
  key_preview: string
  last_used_at: any
  plan: string
  rate_limit_per_minute: number
}

export interface KeyInfoLoadMatch {
  created_at?: string
  key_preview?: string
  last_used_at?: any
  plan?: string
  rate_limit_per_minute?: number
}

export interface Verify {
  address: any
  autre_nom: any
  bond_amount: any
  bond_company: any
  categories: any[]
  company_name: any
  date_debut_restriction: any
  date_delivrance: any
  date_fin_restriction: any
  date_paiement_annuel: any
  email: string
  id?: string
  is_active_today: boolean
  last_seen: string
  licence_id: string
  mandataire: any
  municipalite: any
  neq: any
  nombre_sous_categories: any
  phone: any
  region: any
  restriction: any
  source?: string
  status: string
  statut_juridique: any
  suspended_since: any
  type_licence: any
}

export interface VerifyLoadMatch {
  id: string
}

export interface Watchlist {
}

export interface WatchlistLoadMatch {
  include?: any
  limit?: number
  offset?: number
}

