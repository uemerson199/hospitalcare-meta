import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Trash2, Search, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import { Medication, CreateMedicationData, ApiError } from '../../types';
import { apiService } from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import Card from '../ui/Card';

const Inventory: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [stockMedication, setStockMedication] = useState<Medication | null>(null);

  // ESTADO DO FORMULÁRIO ATUALIZADO
  // Renomeado currentStock -> quantity e adicionado sku
  const [formData, setFormData] = useState<CreateMedicationData>({
    name: '',
    sku: '', 
    description: '',
    manufacturer: '',
    dosage: '',
    unit: '',
    quantity: 0, 
    minimumStock: 0,
    price: 0,
  });

  const [stockAmount, setStockAmount] = useState<number>(0);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState<Medication | null>(null);

  const units = ['mg', 'ml', 'comprimido', 'cápsula', 'ampola', 'frasco', 'tubo', 'sachê'];

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getMedications();
      setMedications(data);
    } catch (error) {
      console.error('Erro ao carregar medicamentos:', error);
      alert('Erro ao carregar o inventário de medicamentos');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Nome é obrigatório';
    if (!formData.sku.trim()) errors.sku = 'SKU é obrigatório';

    // Verificação segura para campos opcionais (evita erro se for null/undefined)
    if (!formData.manufacturer?.trim()) errors.manufacturer = 'Fabricante é obrigatório';
    if (!formData.dosage?.trim()) errors.dosage = 'Dosagem é obrigatória';
    if (!formData.unit?.trim()) errors.unit = 'Unidade é obrigatória';

    // Valida quantity ao invés de currentStock
    if (formData.quantity < 0) errors.quantity = 'Estoque atual não pode ser negativo';
    
    if (formData.minimumStock < 0) errors.minimumStock = 'Estoque mínimo não pode ser negativo';
    if (formData.price <= 0) errors.price = 'Preço deve ser maior que zero';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      if (editingMedication) {
        await apiService.deleteMedication(editingMedication.id);
        await apiService.createMedication(formData);
      } else {
        await apiService.createMedication(formData);
      }
      await loadMedications();
      setIsModalOpen(false);
      setEditingMedication(null);
      
      // Reset do formulário
      setFormData({
        name: '',
        sku: '',
        description: '',
        manufacturer: '',
        dosage: '',
        unit: '',
        quantity: 0,
        minimumStock: 0,
        price: 0,
      });
      setFormErrors({});
    } catch (error) {
      const apiError = error as ApiError;
      // Tratamento seguro para mensagem de erro
      const errorMessage = apiError.message || 'Erro desconhecido';
      alert(`Erro: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStockUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockMedication) return;

    try {
      setIsSubmitting(true);
      await apiService.updateMedicationStock(stockMedication.id, stockAmount);
      await loadMedications();
      setIsStockModalOpen(false);
      setStockMedication(null);
      setStockAmount(0);
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.message || 'Erro desconhecido';
      alert(`Erro ao atualizar estoque: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    // Mapeamento correto com fallbacks (|| '') para evitar undefined
    setFormData({
      name: medication.name,
      sku: medication.sku || '',
      description: medication.description || '',
      manufacturer: medication.manufacturer || '',
      dosage: medication.dosage || '',
      unit: medication.unit || '',
      quantity: medication.quantity, // quantity aqui
      minimumStock: medication.minimumStock || 0,
      price: medication.price,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleStockModal = (medication: Medication) => {
    setStockMedication(medication);
    setStockAmount(0);
    setIsStockModalOpen(true);
  };

  const handleDelete = async (medication: Medication) => {
    try {
      await apiService.deleteMedication(medication.id);
      await loadMedications();
      setDeleteConfirmation(null);
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage = apiError.message || 'Erro desconhecido';
      alert(`Erro ao excluir medicamento: ${errorMessage}`);
    }
  };

  const getStockStatus = (medication: Medication) => {
    // Usando quantity aqui
    if (medication.quantity === 0) {
      return { status: 'out', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    } else if (medication.quantity <= (medication.minimumStock || 0)) {
      return { status: 'low', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
    } else {
      return { status: 'ok', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    }
  };

  const getStockStatusText = (status: string) => {
    switch (status) {
      case 'out': return 'Sem Estoque';
      case 'low': return 'Estoque Baixo';
      case 'ok': return 'Estoque OK';
      default: return 'Desconhecido';
    }
  };

  const filteredMedications = medications.filter(medication =>
    medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (medication.manufacturer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (medication.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventário de Medicamentos</h2>
          <p className="text-gray-600">Gerencie o estoque de medicamentos do hospital</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Medicamento
        </Button>
      </div>

      <Card>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nome, SKU ou fabricante..."
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredMedications.length === 0 ? (
          <div className="text-center py-8">
            <Package className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhum medicamento encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedications.map((medication) => {
              const stockInfo = getStockStatus(medication);
              const StatusIcon = stockInfo.icon;
              
              return (
                <div key={medication.id} className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{medication.name}</h3>
                        {medication.sku && (
                          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600 h-fit">
                            {medication.sku}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {medication.dosage} {medication.unit}
                      </p>
                      <p className="text-sm text-gray-500">
                        {medication.manufacturer}
                      </p>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(medication)} className="p-1">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setDeleteConfirmation(medication)} className="p-1">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      <div className={`flex items-center px-2 py-1 text-xs rounded-full ${stockInfo.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {getStockStatusText(stockInfo.status)}
                      </div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Estoque Atual:</span>
                      {/* Usando quantity aqui */}
                      <span className="font-medium">{medication.quantity}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Estoque Mínimo:</span>
                      <span className="font-medium">{medication.minimumStock}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Preço:</span>
                      <span className="font-medium">R$ {medication.price.toFixed(2)}</span>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <Button variant="outline" size="sm" onClick={() => handleStockModal(medication)} className="w-full">
                        <Package className="w-4 h-4 mr-2" /> Atualizar Estoque
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modal de Cadastro/Edição */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMedication(null);
          setFormData({
            name: '',
            sku: '',
            description: '',
            manufacturer: '',
            dosage: '',
            unit: '',
            quantity: 0,
            minimumStock: 0,
            price: 0,
          });
          setFormErrors({});
        }}
        title={editingMedication ? 'Editar Medicamento' : 'Novo Medicamento'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome do Medicamento"
              value={formData.name}
              onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
              error={formErrors.name}
              placeholder="Ex: Paracetamol"
            />
            <Input
              label="SKU / Código"
              value={formData.sku}
              onChange={(e: any) => setFormData({ ...formData, sku: e.target.value })}
              error={formErrors.sku}
              placeholder="Ex: MED-001"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Fabricante"
              value={formData.manufacturer}
              onChange={(e: any) => setFormData({ ...formData, manufacturer: e.target.value })}
              error={formErrors.manufacturer}
              placeholder="Ex: EMS"
            />
            <Input
              label="Descrição (Opcional)"
              value={formData.description}
              onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição do medicamento"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Dosagem"
              value={formData.dosage}
              onChange={(e: any) => setFormData({ ...formData, dosage: e.target.value })}
              error={formErrors.dosage}
              placeholder="Ex: 500"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.unit ? 'border-red-300' : 'border-gray-300'}`}
              >
                <option value="">Selecione uma unidade</option>
                {units.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
              {formErrors.unit && <p className="mt-1 text-sm text-red-600">{formErrors.unit}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Estoque Atual"
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(e: any) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              error={formErrors.quantity}
            />
            <Input
              label="Estoque Mínimo"
              type="number"
              min="0"
              value={formData.minimumStock}
              onChange={(e: any) => setFormData({ ...formData, minimumStock: parseInt(e.target.value) || 0 })}
              error={formErrors.minimumStock}
            />
            <Input
              label="Preço (R$)"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e: any) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              error={formErrors.price}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={isSubmitting}>{editingMedication ? 'Atualizar' : 'Cadastrar'}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Atualização de Estoque */}
      <Modal
        isOpen={isStockModalOpen}
        onClose={() => {
          setIsStockModalOpen(false);
          setStockMedication(null);
          setStockAmount(0);
        }}
        title="Atualizar Estoque"
        size="sm"
      >
        <form onSubmit={handleStockUpdate} className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900">{stockMedication?.name}</h4>
            <p className="text-sm text-gray-600">{stockMedication?.dosage} {stockMedication?.unit}</p>
            <p className="text-sm text-gray-500 mt-1">
              Estoque atual: <span className="font-medium">{stockMedication?.quantity}</span>
            </p>
          </div>

          <Input
            label="Quantidade a adicionar/remover"
            type="number"
            value={stockAmount}
            onChange={(e: any) => setStockAmount(parseInt(e.target.value) || 0)}
            placeholder="Use números negativos para remover"
            helperText="Exemplo: 50 para adicionar, -10 para remover"
          />

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setIsStockModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={isSubmitting}>Atualizar Estoque</Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={!!deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Tem certeza que deseja excluir o medicamento <strong>{deleteConfirmation?.name}</strong>?
          </p>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm"><strong>Dosagem:</strong> {deleteConfirmation?.dosage} {deleteConfirmation?.unit}</p>
            <p className="text-sm"><strong>Fabricante:</strong> {deleteConfirmation?.manufacturer}</p>
            <p className="text-sm"><strong>Estoque:</strong> {deleteConfirmation?.quantity}</p>
          </div>
          <p className="text-sm text-red-600">
            Esta ação não pode ser desfeita.
          </p>
          
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setDeleteConfirmation(null)}>Cancelar</Button>
            <Button variant="danger" onClick={() => deleteConfirmation && handleDelete(deleteConfirmation)}>Excluir</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;