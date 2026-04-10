'use client';

import { useEffect, useState } from 'react';
import { Period } from '@/lib/types';
import { getPeriods, createPeriod, updatePeriod, deletePeriod } from '@/services/admin';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export default function PeriodsPage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getPeriods();
      setPeriods(data);
    } catch (error) {
      console.error('Error loading periods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (period?: Period) => {
    if (period) {
      setEditingPeriod(period);
      setFormData({
        name: period.name,
        start_date: period.start_date,
        end_date: period.end_date,
      });
    } else {
      setEditingPeriod(null);
      setFormData({
        name: '',
        start_date: '',
        end_date: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingPeriod) {
        await updatePeriod(editingPeriod.id_period, {
          ...formData,
          id_tenant: editingPeriod.id_tenant,
        });
      } else {
        await createPeriod({
          ...formData,
          id_tenant: 'tenant-1',
        });
      }
      await loadData();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving period:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este período?')) {
      try {
        await deletePeriod(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting period:', error);
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
          <h1 className="text-3xl font-bold">Períodos</h1>
          <p className="text-muted-foreground">Gestiona los períodos contables</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Período
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Inicio</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Fin</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {periods.map((period) => (
                <tr key={period.id_period} className="hover:bg-muted/50">
                  <td className="px-6 py-4 text-sm font-medium">{period.name}</td>
                  <td className="px-6 py-4 text-sm">{new Date(period.start_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm">{new Date(period.end_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-right space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenDialog(period)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(period.id_period)}
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
            <DialogTitle>{editingPeriod ? 'Editar Período' : 'Nuevo Período'}</DialogTitle>
            <DialogDescription>
              {editingPeriod ? 'Modifica los datos del período' : 'Crea un nuevo período'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre del período"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Fecha de Inicio</label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Fecha de Fin</label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingPeriod ? 'Guardar cambios' : 'Crear período'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
