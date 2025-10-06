export interface Patient {
  id: string;
  name: string;
  dob: string;
  cpf: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  appointmentTime: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
}

export interface CreatePatientData {
  name: string;
  dob: string;
  cpf: string;
}

export interface CreateDoctorData {
  name: string;
  specialty: string;
}

export interface UpdateDoctorData {
  name: string;
  specialty: string;
}

export interface CreateAppointmentData {
  patientId: string;
  doctorId: string;
  appointmentTime: string;
}

export interface UpdateAppointmentData {
  patientId: string;
  doctorId: string;
  appointmentTime: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user?: {
    id: string;
    username: string;
    name: string;
  };
}

export interface ApiError {
  message: string;
  status: number;
}