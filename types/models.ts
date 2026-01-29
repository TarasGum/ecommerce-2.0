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
  db_type: string;
  db_host: string;
  db_port?: number;
  db_name?: string;
  db_username?: string;
  api_endpoint?: string;
  api_login?: string;
  extra_columns?: string;
  user_count: string;
  created_at: string;
  updated_at: string;
}

// Project creation payload
export interface CreateProjectPayload {
  name: string;
  db_type: string;
  db_host: string;
  db_port: number;
  db_name: string;
  db_username: string;
  db_password: string;
  api_endpoint?: string;
  api_login?: string;
  api_password?: string;
  extra_columns?: string;
}

// Project update payload
export interface UpdateProjectPayload {
  name?: string;
  db_type?: string;
  db_host?: string;
  db_port?: number;
  db_name?: string;
  db_username?: string;
  db_password?: string;
  api_endpoint?: string;
  api_login?: string;
  api_password?: string;
  extra_columns?: string;
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

// Proposal types (Quotes)
export interface Proposal {
  autoid: string;
  b_id: string; // customer ID
  quote: string; // quote number
  b_name: string; // customer name
  qt_date: string | null; // quote date
  status: 'O' | 'A' | 'L' | 'C' | 'E'; // Open, Accepted, Lost, Cancelled, Expired
  tax: string; // decimal
  subtotal: string;
  total: string;
  items?: ProposalItem[];
}

export interface ProposalItem {
  autoid: string;
  inven: string; // product code
  doc_aid: string; // parent proposal reference
  quan: string; // quantity
  descr: string; // description
  amount: string; // line total
}

// Task types
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskStatus {
  id: number;
  project: number;
  name: string;
  is_default: boolean;
  color: string;
  order: number;
  created_at: string;
  updated_at: string;
}

// Task List Item (from GET /tasks/)
export interface TaskListItem {
  id: number;
  project: number;
  title: string;
  status: number;
  status_name: string;
  status_color: string;
  priority: TaskPriority;
  due_date: string | null;
  author: number;
  author_name: string;
  responsible_user: number | null;
  responsible_user_name: string | null;
  attachment_count: string;
  created_at: string;
  updated_at: string;
}

// User Summary (used in task details)
export interface UserSummary {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
}

// Task Attachment
export interface TaskAttachment {
  id: number;
  task: number;
  file_name: string;
  file_size: number;
  file_size_mb: string;
  file_type: string;
  uploaded_by: number;
  uploaded_by_details: UserSummary;
  download_url: string;
  created_at: string;
}

// Linked Item Summary types (returned with Task details)
export interface LinkedOrderSummary {
  autoid: string;
  invoice: string;
  name: string;
  total: string;
  status: 'O' | 'X' | 'U';
}

export interface LinkedProposalSummary {
  autoid: string;
  quote: string;
  b_name: string;
  total: string;
  status: 'O' | 'A' | 'L' | 'C' | 'E';
}

export interface LinkedCustomerSummary {
  id: string;
  l_name: string;
  email?: string;
  phone?: string;
}

// Task Detail (from GET /tasks/{id}/)
export interface Task extends TaskListItem {
  description: string | null;
  status_details: TaskStatus;
  author_details: UserSummary;
  responsible_user_details: UserSummary | null;
  linked_order_autoid: string | null;
  linked_proposal_autoid: string | null;
  linked_customer_autoid: string | null;
  linked_order_details: LinkedOrderSummary | null;
  linked_proposal_details: LinkedProposalSummary | null;
  linked_customer_details: LinkedCustomerSummary | null;
  attachments: TaskAttachment[];
}

// Task Payloads
export interface CreateTaskPayload {
  project?: number;
  title: string;
  description?: string;
  status: number;
  priority: TaskPriority;
  due_date?: string | null;
  responsible_user?: number | null;
  linked_order_autoid?: string | null;
  linked_proposal_autoid?: string | null;
  linked_customer_autoid?: string | null;
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {}

export interface CreateTaskStatusPayload {
  project?: number;
  name: string;
  color: string;
  order?: number;
}

export interface UpdateTaskStatusPayload extends Partial<CreateTaskStatusPayload> {}

// Product types (Mirror DB - TEST API, will be changed)
export interface Product {
  autoid: string;
  id: string; // product code / SKU
  upc: string;
  type: string; // Purchased, Manufactured, Service
  descr_1: string; // primary description
  descr_2: string; // secondary description
  base: string; // base price (stringified decimal)
  cost: string; // cost value (stringified decimal) - used as price for now
  count: string; // inventory quantity (stringified decimal, may be negative)
  location: string;
  inactive: boolean;
}

export interface ProductsListResponse {
  count: number;
  limit: number;
  offset: number;
  results: Product[];
}
