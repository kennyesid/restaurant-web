"use client";

import { useEffect, useState } from "react";
import { Ingredient } from "@/lib/types";
import {
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from "@/services/ingredients";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null,
  );
  const [formData, setFormData] = useState({
    name: "",
    quantity: 0,
    unit: "",
    supplier: "",
    cost: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getIngredients();
      setIngredients(data);
    } catch (error) {
      console.error("Error loading ingredients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (ingredient?: Ingredient) => {
    if (ingredient) {
      setEditingIngredient(ingredient);
      setFormData({
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        supplier: ingredient.supplier,
        cost: ingredient.cost,
      });
    } else {
      setEditingIngredient(null);
      setFormData({
        name: "",
        quantity: 0,
        unit: "",
        supplier: "",
        cost: 0,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingIngredient) {
        await updateIngredient(editingIngredient.id_ingredient, {
          ...formData,
          id_tenant: editingIngredient.id_tenant,
        });
      } else {
        await createIngredient({
          ...formData,
          id_tenant: "tenant-1",
        });
      }
      await loadData();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving ingredient:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este ingrediente?")) {
      try {
        await deleteIngredient(id);
        await loadData();
      } catch (error) {
        console.error("Error deleting ingredient:", error);
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
          <h1 className="text-3xl font-bold">Ingredientes</h1>
          <p className="text-muted-foreground">
            Administra el inventario de ingredientes
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Ingrediente
        </Button>
      </div>

      <div className="grid gap-4">
        {ingredients.map((ingredient) => (
          <Card key={ingredient.id_ingredient} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{ingredient.name}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Cantidad</p>
                    <p className="font-medium">
                      {ingredient.quantity} {ingredient.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Proveedor</p>
                    <p className="font-medium">{ingredient.supplier}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Costo Unitario</p>
                    <p className="font-medium">
                      ${ingredient.cost.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Costo Total</p>
                    <p className="font-medium">
                      $
                      {(ingredient.cost * ingredient.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenDialog(ingredient)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(ingredient.id_ingredient)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingIngredient ? "Editar Ingrediente" : "Nuevo Ingrediente"}
            </DialogTitle>
            <DialogDescription>
              {editingIngredient
                ? "Modifica los datos del ingrediente"
                : "Crea un nuevo ingrediente en el inventario"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Nombre del ingrediente"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Cantidad</label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: Number(e.target.value),
                    })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Unidad</label>
                <Input
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  placeholder="kg, L, units"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Proveedor</label>
              <Input
                value={formData.supplier}
                onChange={(e) =>
                  setFormData({ ...formData, supplier: e.target.value })
                }
                placeholder="Nombre del proveedor"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Costo Unitario</label>
              <Input
                type="number"
                value={formData.cost}
                onChange={(e) =>
                  setFormData({ ...formData, cost: Number(e.target.value) })
                }
                placeholder="0"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingIngredient ? "Guardar cambios" : "Crear ingrediente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
