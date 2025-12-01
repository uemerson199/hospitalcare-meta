import { 
  LoginCredentials, 
  RegisterCredentials, 
  AuthResponse, 
  Patient, 
  Doctor, 
  Appointment, 
  CreatePatientData, 
  CreateDoctorData, 
  UpdateDoctorData,
  CreateAppointmentData,
  UpdateAppointmentData
} from '../types';

const API_BASE_URL = 'http://localhost:8080';

class ApiService {
  
  // Recupera o token salvo e monta o cabeçalho
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Tratamento genérico de resposta
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      // Tenta ler o erro do JSON, se falhar, usa mensagem genérica
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      
      // Se for 401 (Token expirado ou inválido), pode ser útil limpar o storage
      if (response.status === 401) {
        localStorage.removeItem('token');
      }

      throw { message: error.message || 'Request failed', status: response.status };
    }
    
    // Retorna nulo para status 204 (No Content)
    if (response.status === 204) {
      return null as T;
    }
    
    return response.json();
  }

  // --- AUTHENTICATION ---

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    const result = await this.handleResponse<AuthResponse>(response);

    // [CORREÇÃO] Salva o token no localStorage para ser usado nas próximas requisições
    if (result && result.token) {
      localStorage.setItem('token', result.token);
    }

    return result;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    const result = await this.handleResponse<AuthResponse>(response);

    // Se o registro já retornar o token, salvamos também
    if (result && result.token) {
      localStorage.setItem('token', result.token);
    }

    return result;
  }

  // Método novo para deslogar
  logout(): void {
    localStorage.removeItem('token');
  }

  // --- PATIENTS (CRUD Completo) ---

  async getPatients(): Promise<Patient[]> {
    const response = await fetch(`${API_BASE_URL}/patients`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<Patient[]>(response);
  }

  async getPatient(id: string): Promise<Patient> {
    const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<Patient>(response);
  }

  async createPatient(data: CreatePatientData): Promise<Patient> {
    const response = await fetch(`${API_BASE_URL}/patients`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Patient>(response);
  }

  async updatePatient(id: string, data: CreatePatientData): Promise<Patient> {
    const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Patient>(response);
  }

  async deletePatient(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<void>(response);
  }

  // --- DOCTORS (CRUD Completo) ---

  async getDoctors(): Promise<Doctor[]> {
    const response = await fetch(`${API_BASE_URL}/doctors`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<Doctor[]>(response);
  }

  async getDoctor(id: string): Promise<Doctor> {
    const response = await fetch(`${API_BASE_URL}/doctors/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<Doctor>(response);
  }

  async createDoctor(data: CreateDoctorData): Promise<Doctor> {
    const response = await fetch(`${API_BASE_URL}/doctors`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Doctor>(response);
  }

  async updateDoctor(id: string, data: UpdateDoctorData): Promise<Doctor> {
    const response = await fetch(`${API_BASE_URL}/doctors/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Doctor>(response);
  }

  async deleteDoctor(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/doctors/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<void>(response);
  }

  // --- APPOINTMENTS (CRUD Completo) ---

  async getAppointments(): Promise<Appointment[]> {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<Appointment[]>(response);
  }

  async getAppointment(id: string): Promise<Appointment> {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<Appointment>(response);
  }

  async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Appointment>(response);
  }

  async updateAppointment(id: string, data: UpdateAppointmentData): Promise<Appointment> {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Appointment>(response);
  }

  async deleteAppointment(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<void>(response);
  }
}

export const apiService = new ApiService();