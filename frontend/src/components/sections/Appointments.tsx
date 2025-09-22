import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Appointment, Patient, Doctor, CreateAppointmentData, ApiError } from '../../types';
import { apiService } from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import Card from '../ui/Card';

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateAppointmentData>({
    patientId: '',
    doctorId: '',
    appointmentTime: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<CreateAppointmentData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [appointmentsData, patientsData, doctorsData] = await Promise.all([
        apiService.getAppointments(),
        apiService.getPatients(),
        apiService.getDoctors(),
      ]);
      
      setAppointments(appointmentsData);
      setPatients(patientsData);
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar os dados do sistema');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<CreateAppointmentData> = {};

    if (!formData.patientId) {
      errors.patientId = 'Paciente é obrigatório';
    }

    if (!formData.doctorId) {
      errors.doctorId = 'Médico é obrigatório';
    }

    if (!formData.appointmentTime) {
      errors.appointmentTime = 'Data e hora são obrigatórias';
    } else {
      const appointmentDate = new Date(formData.appointmentTime);
      const now = new Date();
      if (appointmentDate <= now) {
        errors.appointmentTime = 'Data e hora devem ser futuras';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await apiService.createAppointment(formData);
      await loadData();
      setIsModalOpen(false);
      setFormData({ patientId: '', doctorId: '', appointmentTime: '' });
      setFormErrors({});
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.status === 409) {
        setFormErrors({ appointmentTime: 'Este horário já está ocupado ou há conflito de agendamento' });
      } else if (apiError.status === 404) {
        alert('Paciente ou médico não encontrado');
      } else {
        alert(`Erro ao agendar consulta: ${apiError.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPatientName = (patientId: string): string => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'Paciente não encontrado';
  };

  const formatDateTime = (dateTime: string): string => {
    return new Date(dateTime).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'SCHEDULED':
        return 'Agendado';
      case 'COMPLETED':
        return 'Concluído';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const patientName = getPatientName(appointment.patientId).toLowerCase();
    const doctorName = appointment.doctorName.toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return patientName.includes(search) || doctorName.includes(search);
  });

  const groupAppointmentsByDate = () => {
    return filteredAppointments.reduce((acc, appointment) => {
      const date = appointment.appointmentTime.split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(appointment);
      return acc;
    }, {} as Record<string, Appointment[]>);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const appointmentsByDate = groupAppointmentsByDate();
  const sortedDates = Object.keys(appointmentsByDate).sort();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Agendamentos</h2>
          <p className="text-gray-600">Gerencie as consultas médicas agendadas</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Consulta
        </Button>
      </div>

      <Card>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por paciente ou médico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {sortedDates.length === 0 ? (
          <div className="text-center py-8">
            <CalendarIcon className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhum agendamento encontrado</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <div key={date}>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200 flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-blue-600" />
                  {new Date(date).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </h3>
                
                <div className="space-y-3">
                  {appointmentsByDate[date]
                    .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-900">
                                {new Date(appointment.appointmentTime).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                                {getStatusText(appointment.status)}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Paciente: {getPatientName(appointment.patientId)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Médico: Dr(a). {appointment.doctorName}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal de Agendamento */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({ patientId: '', doctorId: '', appointmentTime: '' });
          setFormErrors({});
        }}
        title="Nova Consulta"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paciente
            </label>
            <select
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.patientId ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Selecione um paciente</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} - {patient.cpf}
                </option>
              ))}
            </select>
            {formErrors.patientId && (
              <p className="mt-1 text-sm text-red-600">{formErrors.patientId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Médico
            </label>
            <select
              value={formData.doctorId}
              onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.doctorId ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Selecione um médico</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  Dr(a). {doctor.name} - {doctor.specialty}
                </option>
              ))}
            </select>
            {formErrors.doctorId && (
              <p className="mt-1 text-sm text-red-600">{formErrors.doctorId}</p>
            )}
          </div>

          <Input
            label="Data e Hora"
            type="datetime-local"
            value={formData.appointmentTime}
            onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
            error={formErrors.appointmentTime}
          />

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Agendar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Appointments;