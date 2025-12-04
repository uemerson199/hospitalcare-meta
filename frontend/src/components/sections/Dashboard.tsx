import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Calendar, Activity, Package, AlertTriangle } from 'lucide-react';
import Card from '../ui/Card';
import { apiService } from '../../services/api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
    todayAppointments: 0,
    medications: 0,
    lowStockMedications: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [patients, doctors, appointments, medications] = await Promise.all([
        apiService.getPatients(),
        apiService.getDoctors(),
        apiService.getAppointments(),
        apiService.getMedications(),
      ]);

      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = appointments.filter(
        (apt) => apt.appointmentTime.split('T')[0] === today
      );

      // CORREÇÃO AQUI: med.currentStock -> med.quantity
      const lowStockMedications = medications.filter(
        (med) => med.quantity <= med.minimumStock
      );
      
      setStats({
        patients: patients.length,
        doctors: doctors.length,
        appointments: appointments.length,
        todayAppointments: todayAppointments.length,
        medications: medications.length,
        lowStockMedications: lowStockMedications.length,
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total de Pacientes',
      value: stats.patients,
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Médicos Cadastrados',
      value: stats.doctors,
      icon: UserPlus,
      color: 'green',
    },
    {
      title: 'Agendamentos Totais',
      value: stats.appointments,
      icon: Calendar,
      color: 'purple',
    },
    {
      title: 'Consultas Hoje',
      value: stats.todayAppointments,
      icon: Activity,
      color: 'orange',
    },
    {
      title: 'Medicamentos',
      value: stats.medications,
      icon: Package,
      color: 'indigo',
    },
    {
      title: 'Estoque Baixo',
      value: stats.lowStockMedications,
      icon: AlertTriangle,
      color: 'red',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Visão geral do sistema HospitalCare</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-500 text-white',
            green: 'bg-green-500 text-white',
            purple: 'bg-purple-500 text-white',
            orange: 'bg-orange-500 text-white',
            indigo: 'bg-indigo-500 text-white',
            red: 'bg-red-500 text-white',
          };

          return (
            <Card key={index} className="hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividades Recentes</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Sistema iniciado</p>
                <p className="text-xs text-gray-500">Dashboard carregado com sucesso</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Dados sincronizados</p>
                <p className="text-xs text-gray-500">Informações atualizadas da API</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximas Ações</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 border-l-4 border-blue-500 bg-blue-50">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Gerenciar Pacientes</p>
                <p className="text-xs text-gray-500">Cadastrar novos pacientes no sistema</p>
              </div>
            </div>
            <div className="flex items-center p-3 border-l-4 border-green-500 bg-green-50">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Agendar Consultas</p>
                <p className="text-xs text-gray-500">Criar novos agendamentos médicos</p>
              </div>
            </div>
            <div className="flex items-center p-3 border-l-4 border-indigo-500 bg-indigo-50">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Gerenciar Inventário</p>
                <p className="text-xs text-gray-500">Controlar estoque de medicamentos</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;