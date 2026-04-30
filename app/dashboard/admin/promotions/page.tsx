'use client';

import { useEffect, useState } from 'react';
import { Promotion } from '@/lib/types';
import { getPromotions, createPromotion, updatePromotion, deletePromotion } from '@/services/admin';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discount_percentage: 0,
    start_date: '',
    end_date: '',
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getPromotions();
      setPromotions(data);
    } catch (error) {
      console.error('Error loading promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (promotion?: Promotion) => {
    if (promotion) {
      setEditingPromotion(promotion);
      setFormData({
        name: promotion.name,
        description: promotion.description,
        discount_percentage: promotion.discount_percentage,
        start_date: promotion.start_date,
        end_date: promotion.end_date,
        is_active: promotion.is_active,
      });
    } else {
      setEditingPromotion(null);
      setFormData({
        name: '',
        description: '',
        discount_percentage: 0,
        start_date: '',
        end_date: '',
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingPromotion) {
        await updatePromotion(editingPromotion.id_promotion, {
          ...formData,
          id_tenant: editingPromotion.id_tenant,
        });
      } else {
        await createPromotion({
          ...formData,
          id_tenant: 'tenant-1',
        });
      }
      await loadData();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving promotion:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta promoción?')) {
      try {
        await deletePromotion(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting promotion:', error);
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
          <h1 className="text-3xl font-bold">Promociones</h1>
          <p className="text-muted-foreground">Gestiona las promociones y descuentos</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Promoción
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Descuento</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Desde</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Hasta</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Estado</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {promotions.map((promotion) => (
                <tr key={promotion.id_promotion} className="hover:bg-muted/50">
                  <td className="px-6 py-4 text-sm font-medium">{promotion.name}</td>
                  <td className="px-6 py-4 text-sm">{promotion.discount_percentage}%</td>
                  <td className="px-6 py-4 text-sm">{new Date(promotion.start_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm">{new Date(promotion.end_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${promotion.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                      {promotion.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenDialog(promotion)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(promotion.id_promotion)}
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
            <DialogTitle>{editingPromotion ? 'Editar Promoción' : 'Nueva Promoción'}</DialogTitle>
            <DialogDescription>
              {editingPromotion ? 'Modifica los datos de la promoción' : 'Crea una nueva promoción'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre de la promoción"
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
            <div>
              <label className="text-sm font-medium">Descuento (%)</label>
              <Input
                type="number"
                value={formData.discount_percentage}
                onChange={(e) => setFormData({ ...formData, discount_percentage: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Desde</label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Hasta</label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                Activa
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingPromotion ? 'Guardar cambios' : 'Crear promoción'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
