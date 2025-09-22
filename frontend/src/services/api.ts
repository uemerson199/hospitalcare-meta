import { 
  LoginCredentials, 
  AuthResponse, 
  Patient, 
  Doctor, 
  Appointment, 
  CreatePatientData, 
  CreateDoctorData, 
  CreateAppointmentData 
} from '../types';

const API_BASE_URL = 'http://localhost:8080';

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const errorMessage = errorBody?.message || errorBody?.detail || 'Erro desconhecido na requisição';
      
      throw { message: errorMessage, status: response.status };
    }
    
    if (response.status === 204) {
      return null as T;
    }
    
    return response.json();
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/login`, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return this.handleResponse<AuthResponse>(response);
  }

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

  async getDoctors(): Promise<Doctor[]> {
    const response = await fetch(`${API_BASE_URL}/doctors`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<Doctor[]>(response);
  }

  async createDoctor(data: CreateDoctorData): Promise<Doctor> {
    const response = await fetch(`${API_BASE_URL}/doctors`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Doctor>(response);
  }

  async getAppointments(): Promise<Appointment[]> {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<Appointment[]>(response);
  }

  async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Appointment>(response);
  }
}

export const apiService = new ApiService();