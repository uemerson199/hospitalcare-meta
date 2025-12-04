// types.ts atualizado para casar com o Backend Java

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

// CORREÇÃO AQUI: Alinhado com a Entity Java
export interface Medication {
  id: string;
  name: string;
  sku: string; // Adicionado (Obrigatório no Backend)
  description?: string;
  manufacturer?: string; // Opcional (não existe na Entity Java enviada)
  dosage?: string;       // Opcional (não existe na Entity Java enviada)
  unit?: string;         // Opcional (não existe na Entity Java enviada)
  quantity: number;      // Renomeado de currentStock para quantity
  minimumStock: number;  // Nota: Isso não existe na Entity Java, será ignorado
  price: number;
}

// CORREÇÃO AQUI: Alinhado com a Entity Java
export interface CreateMedicationData {
  name: string;
  sku: string; // Adicionado
  description?: string;
  manufacturer?: string;
  dosage?: string;
  unit?: string;
  quantity: number; // Renomeado de currentStock para quantity
  minimumStock: number;
  price: number;
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