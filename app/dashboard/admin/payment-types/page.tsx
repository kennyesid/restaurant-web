'use client';

import { useEffect, useState } from 'react';
import { PaymentType } from '@/lib/types';
import { getPaymentTypes, createPaymentType, updatePaymentType, deletePaymentType } from '@/services/admin';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export default function PaymentTypesPage() {
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPaymentType, setEditingPaymentType] = useState<PaymentType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getPaymentTypes();
      setPaymentTypes(data);
    } catch (error) {
      console.error('Error loading payment types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (paymentType?: PaymentType) => {
    if (paymentType) {
      setEditingPaymentType(paymentType);
      setFormData({
        name: paymentType.name,
        description: paymentType.description,
      });
    } else {
      setEditingPaymentType(null);
      setFormData({
        name: '',
        description: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingPaymentType) {
        await updatePaymentType(editingPaymentType.id_payment_type, {
          ...formData,
          id_tenant: editingPaymentType.id_tenant,
        });
      } else {
        await createPaymentType({
          ...formData,
          id_tenant: 'tenant-1',
        });
      }
      await loadData();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving payment type:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este tipo de pago?')) {
      try {
        await deletePaymentType(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting payment type:', error);
      }
    }
  };

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tipos de Pago</h1>
          <p className="text-muted-foreground">Gestiona los métodos de pago disponibles</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Tipo de Pago
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Descripción</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paymentTypes.map((paymentType) => (
                <tr key={paymentType.id_payment_type} className="hover:bg-muted/50">
                  <td className="px-6 py-4 text-sm font-medium">{paymentType.name}</td>
                  <td className="px-6 py-4 text-sm">{paymentType.description}</td>
                  <td className="px-6 py-4 text-sm text-right space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenDialog(paymentType)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(paymentType.id_payment_type)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPaymentType ? 'Editar Tipo de Pago' : 'Nuevo Tipo de Pago'}</DialogTitle>
            <DialogDescription>
              {editingPaymentType ? 'Modifica los datos del tipo de pago' : 'Crea un nuevo tipo de pago'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre del tipo de pago"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descripción</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingPaymentType ? 'Guardar cambios' : 'Crear tipo de pago'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
