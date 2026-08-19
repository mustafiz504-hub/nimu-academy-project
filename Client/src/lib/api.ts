export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || (import.meta.env.PROD ? 'https://nimu-academy-backend.onrender.com/api' : 'http://localhost:8000/api');

const TOKEN_KEY = 'nimu_auth_token';
const USER_KEY = 'nimu_auth_user';

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  phone_number?: string | null;
  country_code?: string | null;
  role: 'user' | 'admin' | 'superadmin' | string;
  is_verified?: boolean;
  email_verified?: boolean;
  phone_verified?: boolean;
  marketing_opt_in?: boolean;
  created_at?: string;
}

export interface ApiCourse {
  id: number;
  name: string;
  description?: string | null;
  duration?: string | null;
  timing?: string | null;
  mode?: string | null;
  price: number | string;
  topics?: string[] | null;
  active?: boolean;
  created_at?: string;
}

export interface ApiProduct {
  id: number;
  name: string;
  description?: string | null;
  price: number | string;
  category?: string | null;
  image_url?: string | null;
  available?: boolean;
  created_at?: string;
}

export interface ApiGalleryImage {
  id: number;
  image_url: string;
  public_id: string;
  title?: string | null;
  section?: string | null;
  created_at?: string;
}

export interface ApiStudent {
  id: number;
  student_id: string;
  student_name: string;
  email: string;
  phone: string;
  course_name: string;
  approved: boolean;
  completed: boolean;
  completion_date: string;
  certificate_id: string;
  created_at?: string;
}

export interface ApiOrder {
  id: number;
  user_id?: number | null;
  product_id?: number | null;
  product_name?: string | null;
  user_name?: string | null;
  user_email?: string | null;
  customer_name: string;
  phone: string;
  address: string;
  flavor?: string | null;
  size?: string | null;
  custom_message?: string | null;
  delivery_date: string;
  special_instructions?: string | null;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled' | string;
  total_price?: number | string | null;
  created_at?: string;
}

export interface ApiEnrollment {
  id: number;
  user_id?: number | null;
  course_id?: number | null;
  course_name?: string | null;
  course_price?: number | string | null;
  user_email?: string | null;
  student_name: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  batch_timing?: string | null;
  mode?: string | null;
  how_heard?: string | null;
  message?: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | string;
  created_at?: string;
}

export interface ActivityLog {
  id: number;
  user_id?: number | null;
  action: string;
  user_name?: string | null;
  user_email?: string | null;
  user_role?: string | null;
  created_at?: string;
}

// ─── OTP Auth Payloads ────────────────────────────────────────────────────────

export interface SignupInitiatePayload {
  name: string;
  email: string;
  password: string;
  terms_agreed: boolean;
  marketing_opt_in?: boolean;
}

export interface SignupVerifyPayload {
  email: string;
  otp: string;
}

export interface LoginInitiatePayload {
  email: string;
  password: string;
}

export interface LoginVerifyPayload {
  identifier: string;
  otp: string;
}

export interface OtpResendPayload {
  identifier: string;
  purpose: 'signup' | 'login';
}

export interface OtpInitiateResponse {
  message: string;
  channel?: 'email' | 'phone';
  maskedTarget?: string;
  maskedEmail?: string;
  maskedPhone?: string;
  email?: string;
  identifier?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: ApiUser;
}

// ─── Infrastructure ───────────────────────────────────────────────────────────

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  auth?: boolean;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

export const getStoredUser = (): ApiUser | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as ApiUser;
  } catch {
    return null;
  }
};

export const storeAuth = (token: string, user: ApiUser) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearStoredAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const toJsonBody = (body: unknown) => (body === undefined ? undefined : JSON.stringify(body));

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers);

  const isFormData = options.body instanceof FormData;

  if (options.body !== undefined && !headers.has('Content-Type') && !isFormData) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.auth !== false && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: isFormData ? (options.body as any) : toJsonBody(options.body),
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    if (response.status === 401) clearStoredAuth();
    const message =
      typeof data === 'object' && data && 'message' in data
        ? String((data as { message?: unknown }).message)
        : 'Request failed.';
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

export const api = {
  auth: {
    // ── New OTP-only endpoints ──
    signupInitiate: (body: SignupInitiatePayload) =>
      request<OtpInitiateResponse>('/auth/signup/initiate', { method: 'POST', body, auth: false }),
    signupVerify: (body: SignupVerifyPayload) =>
      request<AuthResponse>('/auth/signup/verify', { method: 'POST', body, auth: false }),
    loginInitiate: (body: LoginInitiatePayload) =>
      request<OtpInitiateResponse>('/auth/login/initiate', { method: 'POST', body, auth: false }),
    loginVerify: (body: LoginVerifyPayload) =>
      request<AuthResponse>('/auth/login/verify', { method: 'POST', body, auth: false }),
    resendOtp: (body: OtpResendPayload) =>
      request<{ message: string }>('/auth/otp/resend', { method: 'POST', body, auth: false }),
    logout: () => request<{ message: string }>('/auth/logout', { method: 'POST', auth: false }),
    me: () => request<{ user: ApiUser }>('/auth/me'),
  },
  user: {
    profile: () => request<{ user: ApiUser }>('/user/profile'),
    updateProfile: (body: { name: string; phone?: string }) =>
      request<{ message: string; user: ApiUser }>('/user/profile', { method: 'PUT', body }),
    orders: () => request<{ orders: ApiOrder[] }>('/user/orders'),
    enrollments: () => request<{ enrollments: ApiEnrollment[] }>('/user/enrollments'),
  },
  courses: {
    list: () => request<{ courses: ApiCourse[] }>('/courses', { auth: false }),
    get: (id: number | string) => request<{ course: ApiCourse }>(`/courses/${id}`, { auth: false }),
    create: (body: Partial<ApiCourse>) =>
      request<{ message: string; course: ApiCourse }>('/courses', { method: 'POST', body }),
    update: (id: number | string, body: Partial<ApiCourse>) =>
      request<{ message: string; course: ApiCourse }>(`/courses/${id}`, { method: 'PUT', body }),
    delete: (id: number | string) =>
      request<{ message: string }>(`/courses/${id}`, { method: 'DELETE' }),
  },
  gallery: {
    list: (section?: string) => request<{ images: ApiGalleryImage[] }>(`/gallery${section ? `?section=${section}` : ''}`, { auth: false }),
    add: (body: Partial<ApiGalleryImage>) =>
      request<{ message: string; image: ApiGalleryImage }>('/gallery', { method: 'POST', body }),
    delete: (id: number | string) =>
      request<{ message: string }>(`/gallery/${id}`, { method: 'DELETE' }),
  },
  products: {
    list: () => request<{ products: ApiProduct[] }>('/products', { auth: false }),
    get: (id: number | string) => request<{ product: ApiProduct }>(`/products/${id}`, { auth: false }),
    create: (body: Partial<ApiProduct>) =>
      request<{ message: string; product: ApiProduct }>('/products', { method: 'POST', body }),
    update: (id: number | string, body: Partial<ApiProduct>) =>
      request<{ message: string; product: ApiProduct }>(`/products/${id}`, { method: 'PUT', body }),
    delete: (id: number | string) =>
      request<{ message: string }>(`/products/${id}`, { method: 'DELETE' }),
  },
  orders: {
    list: () => request<{ orders: ApiOrder[]; total: number }>('/orders'),
    get: (id: number | string) => request<{ order: ApiOrder }>(`/orders/${id}`),
    create: (body: Partial<ApiOrder>) =>
      request<{ message: string; order: ApiOrder }>('/orders', { method: 'POST', body }),
    updateStatus: (id: number | string, status: ApiOrder['status']) =>
      request<{ message: string; order: ApiOrder }>(`/orders/${id}/status`, {
        method: 'PUT',
        body: { status },
      }),
    delete: (id: number | string) =>
      request<{ message: string }>(`/orders/${id}`, { method: 'DELETE' }),
  },
  enrollments: {
    list: () => request<{ enrollments: ApiEnrollment[]; total: number }>('/enrollments'),
    get: (id: number | string) => request<{ enrollment: ApiEnrollment }>(`/enrollments/${id}`),
    create: (body: Partial<ApiEnrollment>) =>
      request<{ message: string; enrollment: ApiEnrollment }>('/enrollments', {
        method: 'POST',
        body,
        auth: true,
      }),
    updateStatus: (id: number | string, status: ApiEnrollment['status']) =>
      request<{ message: string; enrollment: ApiEnrollment }>(`/enrollments/${id}/status`, {
        method: 'PUT',
        body: { status },
      }),
    delete: (id: number | string) =>
      request<{ message: string }>(`/enrollments/${id}`, { method: 'DELETE' }),
  },
  students: {
    list: () => request<{ students: ApiStudent[]; total: number }>('/students'),
    search: (q: string) =>
      request<{ student: ApiStudent }>(`/students/search?q=${encodeURIComponent(q)}`, { auth: false }),
    create: (body: {
      student_name: string;
      phone: string;
      email?: string;
      course_name?: string;
      completion_date?: string;
    }) =>
      request<{ message: string; student: ApiStudent }>('/students', { method: 'POST', body }),
    update: (
      id: number | string,
      body: Partial<Pick<ApiStudent, 'student_name' | 'phone' | 'email' | 'course_name' | 'approved' | 'completed' | 'completion_date'>>
    ) =>
      request<{ message: string; student: ApiStudent }>(`/students/${id}`, { method: 'PUT', body }),
    delete: (id: number | string) =>
      request<{ message: string }>(`/students/${id}`, { method: 'DELETE' }),
  },
  upload: async (file: File, folder: 'products' | 'users' | 'courses' | 'banners' | 'general' = 'general'): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    return request<{ imageUrl: string }>(`/upload?folder=${folder}`, {
      method: 'POST',
      body: formData,
    });
  },
  admin: {
    dashboard: () => request<{ stats: Record<string, number> }>('/admin/dashboard'),
    orders: () => request<{ orders: ApiOrder[]; total: number }>('/admin/orders'),
    enrollments: () => request<{ enrollments: ApiEnrollment[]; total: number }>('/admin/enrollments'),
    users: () => request<{ users: ApiUser[]; total: number }>('/admin/users'),
    updateOrderStatus: (id: number | string, status: ApiOrder['status']) =>
      request<{ message: string; order: ApiOrder }>(`/admin/orders/${id}/status`, {
        method: 'PUT',
        body: { status },
      }),
    updateEnrollmentStatus: (id: number | string, status: ApiEnrollment['status']) =>
      request<{ message: string; enrollment: ApiEnrollment }>(`/admin/enrollments/${id}/status`, {
        method: 'PUT',
        body: { status },
      }),
    makeAdmin: (userId: number) =>
      request<{ message: string; user: ApiUser }>('/admin/make-admin', {
        method: 'POST',
        body: { userId },
      }),
    removeAdmin: (userId: number) =>
      request<{ message: string; user: ApiUser }>('/admin/remove-admin', {
        method: 'POST',
        body: { userId },
      }),
  },
  superadmin: {
    dashboard: () => request<{ stats: Record<string, number> }>('/superadmin/dashboard'),
    admins: () => request<{ admins: ApiUser[]; total: number }>('/superadmin/admins'),
    makeAdmin: (userId: number) =>
      request<{ message: string; user: ApiUser }>('/superadmin/make-admin', {
        method: 'POST',
        body: { userId },
      }),
    removeAdmin: (userId: number) =>
      request<{ message: string; user: ApiUser }>('/superadmin/remove-admin', {
        method: 'POST',
        body: { userId },
      }),
    users: () => request<{ users: ApiUser[]; total: number }>('/superadmin/users'),
    activityLogs: () => request<{ logs: ActivityLog[]; total: number }>('/superadmin/activity-logs'),
    deleteUser: (id: number | string) =>
      request<{ message: string }>(`/superadmin/users/${id}`, { method: 'DELETE' }),
  },
};
