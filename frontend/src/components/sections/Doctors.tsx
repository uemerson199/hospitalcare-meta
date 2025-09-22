import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { Doctor, CreateDoctorData, ApiError } from '../../types';
import { apiService } from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import Card from '../ui/Card';

const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateDoctorData>({
    name: '',
    specialty: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<CreateDoctorData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const specialties = [
    'Cardiologia',
    'Dermatologia',
    'Endocrinologia',
    'Gastroenterologia',
    'Ginecologia',
    'Neurologia',
    'Oftalmologia',
    'Ortopedia',
    'Pediatria',
    'Psiquiatria',
    'Urologia',
    'Clínico Geral',
  ];

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getDoctors();
      setDoctors(data);
    } catch (error) {
      console.error('Erro ao carregar médicos:', error);
      alert('Erro ao carregar a lista de médicos');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<CreateDoctorData> = {};

    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    }

    if (!formData.specialty.trim()) {
      errors.specialty = 'Especialidade é obrigatória';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await apiService.createDoctor(formData);
      await loadDoctors();
      setIsModalOpen(false);
      setFormData({ name: '', specialty: '' });
      setFormErrors({});
    } catch (error) {
      const apiError = error as ApiError;
      alert(`Erro ao cadastrar médico: ${apiError.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDoctorsBySpecialty = () => {
    return filteredDoctors.reduce((acc, doctor) => {
      if (!acc[doctor.specialty]) {
        acc[doctor.specialty] = [];
      }
      acc[doctor.specialty].push(doctor);
      return acc;
    }, {} as Record<string, Doctor[]>);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const doctorsBySpecialty = getDoctorsBySpecialty();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Médicos</h2>
          <p className="text-gray-600">Gerencie os médicos cadastrados no sistema</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Médico
        </Button>
      </div>

      <Card>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nome ou especialidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {Object.keys(doctorsBySpecialty).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum médico encontrado</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(doctorsBySpecialty).map(([specialty, doctors]) => (
              <div key={specialty}>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                  {specialty}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
                    >
                      <h4 className="font-medium text-gray-900 mb-1">
                        Dr(a). {doctor.name}
                      </h4>
                      <p className="text-sm text-gray-600">{doctor.specialty}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal de Cadastro */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({ name: '', specialty: '' });
          setFormErrors({});
        }}
        title="Novo Médico"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome Completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            placeholder="Digite o nome completo do médico"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Especialidade
            </label>
            <select
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.specialty ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Selecione uma especialidade</option>
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
            {formErrors.specialty && (
              <p className="mt-1 text-sm text-red-600">{formErrors.specialty}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Cadastrar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Doctors;