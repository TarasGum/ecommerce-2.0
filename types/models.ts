// types/models.ts
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: "superadmin" | "admin" | "user";
  project: number;
  project_name: string;
  is_active: boolean;
  date_joined: string;
  updated_at: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Auth types
export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RefreshResponse {
  access: string;
}

// User creation payload
export interface CreateUserPayload {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  role: string;
  project?: number;
}

// User update payload
export interface UpdateUserPayload {
  is_active?: boolean;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
}

// Order types
export interface Order {
  autoid: string;
  id: string; // customer ID
  invoice: string; // may contain whitespace
  name: string; // customer name
  inv_date: string | null;
  due_date: string | null;
  status: 'O' | 'X' | 'U';
  tax: string; // decimal
  subtotal: string;
  total: string;
  balance: string;
  items?: OrderItem[];
}

export interface OrderItem {
  autoid: string;
  inven: string; // product code
  doc_aid: string; // parent order reference
  quan: string; // quantity
  descr: string; // description
  price: string;
  so_amount: string; // line total
}

// Customer types
export interface Customer {
  id: string; // customer ID (natural key)
  l_name: string; // customer name/company
  phone?: string;
  email?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  in_level?: string; // Wholesale/Retail
  inactive?: boolean;
  last_order_date?: string | null;
}

export interface CreateCustomerPayload {
  l_name: string;
  phone?: string;
  email?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  in_level?: string;
  inactive?: boolean;
}

export interface UpdateCustomerPayload {
  l_name?: string;
  phone?: string;
  email?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  in_level?: string;
  inactive?: boolean;
}

// Profile types
export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

// Payload Logs types (SuperAdmin only)
export interface PayloadLogListParams {
  limit?: number;
  offset?: number;
  created_after?: string;
  created_before?: string;
  entity?: string;
  is_error?: boolean;
  method?: string;
  project_id?: number;
  status_code?: number;
}

export interface PayloadLog {
  id: number;
  project_id: number;
  project_name: string;
  method: string;
  url: string;
  entity: string;
  key: string;
  payload: Record<string, any> | null;
  response: Record<string, any> | null;
  status_code: number;
  is_error: boolean;
  error_message: string | null;
  duration_ms: number;
  created_at: string;
}

export interface PayloadLogDetail extends PayloadLog {
  is_autoid: boolean;
}

export interface PayloadLogListResponse {
  count: number;
  limit: number;
  offset: number;
  results: PayloadLog[];
}
