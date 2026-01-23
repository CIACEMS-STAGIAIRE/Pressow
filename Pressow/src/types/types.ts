export type NotificationType = 'success' | 'error'

export interface ProviderSummary {
  id: string
  nom_commercial: string
  type: string
  adresse: string
  quartier: string
}

export interface AuthUser {
  id: string
  username: string
  email: string
  phone: string
  phone_verified: boolean
  phone_verified_at?: string | null
  first_name: string
  last_name: string
  photo_profil?: string | null
  role: string
  role_display: string
  custom_role?: string | null
  latitude?: number | null
  longitude?: number | null
  adresse?: string | null
  quartier?: string | null
  date_inscription: string
  is_active: boolean
  provider?: ProviderSummary | null
  permissions: string[]
}

export interface LoginResponse {
  access: string
  user: AuthUser
}

export interface RefreshResponse {
  access: string
}

export interface RegisterProviderPayload {
  name: string
  company_name: string
  service_type: string
  city: string
  phone: string
  email?: string
  login: string
  password: string
  password_confirm: string
}

export interface RegisterClientPayload {
  phone: string
  first_name?: string
  last_name?: string
  password?: string
  password_confirm?: string
  email?: string
}

export interface PendingTokenResponse {
  requires_otp: boolean
  pending_token?: string
  detail?: string
}

export interface OTPVerifyPayload {
  pending_token: string
  code: string
  otp_id?: string
}
