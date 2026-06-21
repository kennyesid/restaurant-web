"use client";

import React, { useState, useEffect, useMemo, Fragment } from "react";
import { Plus, Edit, Trash2, Search, SlidersHorizontal, X } from "lucide-react";
import { Ingredient, IngredientCategories, Product, RoleType, ToastType } from "@/types";
import {
    getIngredients,
    createIngredient,
    updateIngredient,
    deleteIngredient,
} from "@/services/ingredientsService";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getCategories } from "@/services/categoriesService";
import ButtonGeneric from "@/components/common/button/ButtonGeneric";
import PageHeader from "@/components/page/header/PageHeader";
import { useAppSelector } from "@/store/store/hooks";
import { MENU_BY_ROL, MenuConfig } from "@/lib/constants/menuByRol";
import { Column, GenericDataTable, TableActions } from "@/components/common/table/GenericDataTable";
import AlertDialogComponent from "@/components/common/alert/AlertDialogComponent";
import { AlertVariant } from "@/types/enum/alertVariant";
import { getProducts } from "@/services/productsSservice";
import { getIngredientCategories } from "@/services/ingredientCategoriesService";
import { ResponsiveModal } from "@/components/common/modal/ResponsiveModal";
import CustomNotification from "@/components/common/toast/CustomNotification";
import { toast } from "sonner";

interface Supplier {
    id: number;
    name: string;
}

export default function IngredientsABM() {
    const { user } = useAppSelector((state) => state.auth);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [ingredientCategories, setIngredientCategories] = useState<IngredientCategories[]>([]);
    const [selectedIngredientCategory, setSelectedIngredientCategory] = useState<number>(0);
    const [selectedProduct, setSelectedProduct] = useState<number>(0);
    const [products, setProducts] = useState<Product[]>([]);

    const [suppliers] = useState<Supplier[]>([
        { id: 1, name: "Carnes Premium" },
        { id: 2, name: "Distribuidora General" },
        { id: 3, name: "Verduras Frescas" },
        { id: 4, name: "Lácteos S.A." },
        { id: 5, name: "Panadería Local" },
    ]);

    const [searchTerm, setSearchTerm] = useState("");

    // const [selectedSupplier, setSelectedSupplier] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
    const defaultFormState = {
        name: "",
        description: "",
        ingredientCategoriesId: 1,
        supplierId: 0,
        groupId: 1,
        quantity: 0,
        price: 0,
        unitType: "kg",
        currentStock: 0,
        quantitypiecesOfChicken: undefined as number | undefined,
        state: true,
    };
    const [formData, setFormData] = useState(defaultFormState);

    const [alertOpen, setAlertOpen] = useState(false);
    const [ingredientToDelete, setIngredientToDelete] = useState<number | null>(null);

    const [userPermissions, setUserPermissions] = useState<MenuConfig>(
        MENU_BY_ROL[(user?.role?.toUpperCase() as RoleType) || "VISITOR"],
    );

    const loadData = async () => {
        const [fetchedIngredients, fetchedCategories] = await Promise.all([
            getIngredients(),
            getIngredientCategories(),
        ]);
        setIngredients(fetchedIngredients);
        setIngredientCategories(fetchedCategories);
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (user?.role) {
            const role = user.role.toUpperCase() as RoleType;
            setUserPermissions(MENU_BY_ROL[role] || MENU_BY_ROL["VISITOR"]);
        } else {
            setUserPermissions(MENU_BY_ROL["VISITOR"]);
        }
    }, [user]);

    const filteredIngredients = useMemo(() => {
        return ingredients
            .filter((item) => {
                const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());

                const matchesCategory =
                    selectedIngredientCategory === 0 || item.ingredientCategoriesId === selectedIngredientCategory;

                return matchesSearch && matchesCategory;
            })
            .sort((a, b) => b.id - a.id);
    }, [ingredients, searchTerm, selectedIngredientCategory]);

    const totalPages = Math.ceil(filteredIngredients.length / itemsPerPage);
    const paginatedIngredients = useMemo(() => {
        return filteredIngredients.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
    }, [filteredIngredients, currentPage]);

    const handleOpenModal = (ingredient?: Ingredient) => {
        if (ingredient) {
            setEditingIngredient(ingredient);
            setFormData({
                name: ingredient.name,
                description: ingredient.description,
                ingredientCategoriesId: ingredient.ingredientCategoriesId,
                supplierId: ingredient.supplierId,
                groupId: ingredient.groupId,
                quantity: ingredient.quantity,
                price: ingredient.price,
                unitType: ingredient.unitType,
                currentStock: ingredient.currentStock,
                quantitypiecesOfChicken: ingredient.quantitypiecesOfChicken,
                state: ingredient.state,
            });
        } else {
            setEditingIngredient(null);
            setFormData(defaultFormState);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingIngredient(null);
        setFormData(defaultFormState);
    };

    const handleSaveIngredient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingIngredient) {
            await updateIngredient(editingIngredient.id, formData);
        } else {
            await createIngredient(formData);
        }

        const currentToastBody = {
            type: ToastType.Successfully,
            message: "Exito",
            description: "El ingrediente se guardo correctamente",
            image: null,
        };
        toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);

        await loadData();
        handleCloseModal();
    };

    const handleDeleteIngredient = (id: number) => {
        setIngredientToDelete(id);
        setAlertOpen(true);
    };

    const handleConfirmDelete = () => {
        if (ingredientToDelete !== null) {
            deleteIngredient(ingredientToDelete).then(() => {
                loadData();
                setIngredientToDelete(null);
                setAlertOpen(false);
            });
        }
    };

    const actions: TableActions<Ingredient> = {
        onEdit: (item) => handleOpenModal(item),
        onDelete: (item) => handleDeleteIngredient(item.id),
    };

    const columns: Column<Ingredient>[] = [
        {
            header: "Nombre",
            accessor: (item) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-[#052A3D]">{item.name}</span>
                </div>
            ),
        },
        {
            header: "Descripción",
            accessor: (item) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-[#052A3D]">{item.description}</span>
                </div>
            ),
        },
        {
            header: "Categoría",
            accessor: (item) => {
                const categoryName = ingredientCategories.find((c) => c.id === item.ingredientCategoriesId)?.name || "Sin categoría";
                return (
                    <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-medium">
                        {categoryName}
                    </span>
                );
            },
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Ingredientes e Insumos"
                subtitle="Gestión completa de artículos de cocina y costos."
                action={
                    <div className="w-50">
                        <ButtonGeneric onClick={() => handleOpenModal()}>
                            Nuevo Ingrediente
                        </ButtonGeneric>
                    </div>
                }
            >

            </PageHeader>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Search - ocupa 2 columnas en pantallas sm+ */}
                <div className="relative sm:col-span-2">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#D12B2B] focus:bg-white transition"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                {/* Select de categorías - ocupa 1 columna */}
                <div className="sm:col-span-1">
                    <Select
                        value={String(selectedIngredientCategory)}
                        onValueChange={(val) => {
                            setSelectedIngredientCategory(parseInt(val));
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full shadow-sm hover:shadow-md">
                            <SelectValue placeholder="Todas las categorías" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">Todas las categorías</SelectItem>
                            {ingredientCategories.map((cat) => (
                                <SelectItem key={cat.id} value={String(cat.id)}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-4">
                <GenericDataTable
                    columns={columns}
                    data={paginatedIngredients}
                    actions={actions}
                    showActions={true}
                    rowKey="id"
                    pagination={{
                        currentPage,
                        totalPages,
                        totalItems: filteredIngredients.length,
                        itemsPerPage,
                        onPageChange: (page) => setCurrentPage(page),
                    }}
                />

                <AlertDialogComponent
                    isOpen={alertOpen}
                    onClose={() => {
                        setAlertOpen(false);
                        setIngredientToDelete(null);
                    }}
                    onConfirm={handleConfirmDelete}
                    variant={AlertVariant.DANGER}
                    title="Eliminar ingrediente"
                    message="¿Estás seguro de que deseas eliminar este ingrediente? Esta acción no se puede deshacer."
                    confirmText="Eliminar"
                    cancelText="Cancelar"
                />
            </div>

            <ResponsiveModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={() => {
                    if (!formData.name.trim()) {
                        const currentToastBody = {
                            type: ToastType.Fail,
                            message: "Error",
                            description: "El nombre es obligatorio",
                            image: null,
                        };
                        toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);

                        return;
                    }
                    if (formData.description.trim().length < 3) {
                        const currentToastBody = {
                            type: ToastType.Fail,
                            message: "Error",
                            description: "La descripción debe tener al menos 3 caracteres",
                            image: null,
                        };
                        toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
                        return;
                    }
                    if (!formData.ingredientCategoriesId) {
                        const currentToastBody = {
                            type: ToastType.Fail,
                            message: "Error",
                            description: "Debes seleccionar una categoría",
                            image: null,
                        };
                        toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
                        return;
                    }
                    if (formData.price <= 0) {
                        const currentToastBody = {
                            type: ToastType.Fail,
                            message: "Error",
                            description: "El precio no puede ser negativo",
                            image: null,
                        };
                        toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
                        return;
                    }
                    if (!formData.unitType.trim()) {
                        const currentToastBody = {
                            type: ToastType.Fail,
                            message: "Error",
                            description: "El tipo de unidad es obligatorio",
                            image: null,
                        };
                        toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
                        return;
                    }

                    const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
                    handleSaveIngredient(fakeEvent);
                }}
                title={editingIngredient ? "Editar Ingrediente" : "Crear Nuevo Ingrediente"}
                subtitle={editingIngredient ? "Modifica los datos del ingrediente" : "Completa los datos del nuevo ingrediente"}
                size="lg"
                confirmText={editingIngredient ? "Guardar Cambios" : "Guardar Ingrediente"}
                cancelText="Cancelar"
                isProcessing={false}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Nombre */}
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="Ej. Carne Molida Premium"
                            className={`w-full px-3 py-2 border text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B] ${!formData.name.trim() && isModalOpen ? 'border-red-500' : 'border-gray-300'
                                }`}
                            value={formData.name}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^a-zA-ZáéíóúñÑ0-9\s\-_.,]/g, '');
                                setFormData({ ...formData, name: value });
                            }}
                        />
                        {!formData.name.trim() && isModalOpen && (
                            <p className="text-xs text-red-500 mt-1">El nombre es obligatorio</p>
                        )}
                        {formData.name.trim().length > 0 && formData.name.trim().length < 3 && (
                            <p className="text-xs text-red-500 mt-1">El nombre debe tener al menos 3 caracteres</p>
                        )}
                    </div>

                    {/* Descripción */}
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Descripción</label>
                        <input
                            type="text"
                            placeholder="Detalles sobre el ingrediente (opcional)"
                            className="w-full px-3 py-2 border border-gray-300 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B]"
                            value={formData.description}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^a-zA-ZáéíóúñÑ0-9\s\-_.,]/g, '');
                                setFormData({ ...formData, description: value });
                            }}
                        />
                    </div>

                    {/* Categoría */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Categoría <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            className={`w-full px-3 py-2 border text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B] bg-white ${!formData.ingredientCategoriesId && isModalOpen ? 'border-red-500' : 'border-gray-300'
                                }`}
                            value={formData.ingredientCategoriesId}
                            onChange={(e) => setFormData({ ...formData, ingredientCategoriesId: parseInt(e.target.value) })}
                        >
                            <option value="">Seleccionar categoría</option>
                            {ingredientCategories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        {!formData.ingredientCategoriesId && isModalOpen && (
                            <p className="text-xs text-red-500 mt-1">Debes seleccionar una categoría</p>
                        )}
                    </div>

                    {/* Precio Unitario */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Precio Unitario (Bs) <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            type="number"
                            step="any"
                            min="0"
                            className={`w-full px-3 py-2 border text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B] ${(formData.price < 0 || isNaN(formData.price)) && isModalOpen ? 'border-red-500' : 'border-gray-300'
                                }`}
                            value={formData.price}
                            onChange={(e) => {
                                let value = parseFloat(e.target.value);
                                if (value < 0 || isNaN(value)) {
                                    value = 0;
                                }
                                setFormData({ ...formData, price: value });
                            }}
                            onBlur={(e) => {
                                const value = parseFloat(e.target.value);
                                if (isNaN(value) || value < 0) {
                                    setFormData({ ...formData, price: 0 });
                                }
                            }}
                        />
                        {(formData.price < 0 || isNaN(formData.price)) && isModalOpen && (
                            <p className="text-xs text-red-500 mt-1">El precio no puede ser negativo</p>
                        )}
                    </div>

                    {/* Tipo de Unidad */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Tipo de Unidad <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="kg, liters, units..."
                            className={`w-full px-3 py-2 border text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B] ${!formData.unitType.trim() && isModalOpen ? 'border-red-500' : 'border-gray-300'
                                }`}
                            value={formData.unitType}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                                setFormData({ ...formData, unitType: value });
                            }}
                        />
                        {!formData.unitType.trim() && isModalOpen && (
                            <p className="text-xs text-red-500 mt-1">El tipo de unidad es obligatorio</p>
                        )}
                    </div>
                </div>
            </ResponsiveModal>

            {/* {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white w-full max-w-xl rounded-md shadow-xl border border-gray-100 flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-[#052A3D]">
                                {editingIngredient ? "Editar Ingrediente" : "Crear Nuevo Ingrediente"}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="p-1 rounded hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveIngredient} className="p-6 space-y-4 overflow-y-auto">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ej. Carne Molida Premium"
                                        className="w-full px-3 py-2 border text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B]"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Descripción</label>
                                    <input
                                        type="text"
                                        placeholder="Detalles sobre el ingrediente"
                                        className="w-full px-3 py-2 border text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B]"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Categoría</label>
                                    <select
                                        required
                                        className="w-full px-3 py-2 border text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B] bg-white"
                                        value={formData.ingredientCategoriesId}
                                        onChange={(e) => setFormData({ ...formData, ingredientCategoriesId: parseInt(e.target.value) })}
                                    >
                                        {ingredientCategories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Proveedor</label>
                                    <select
                                        required
                                        className="w-full px-3 py-2 border text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B] bg-white"
                                        value={formData.supplierId}
                                        onChange={(e) => setFormData({ ...formData, supplierId: parseInt(e.target.value) })}
                                    >
                                        <option value="0">0 = Ninguno</option>
                                        {suppliers.map((sup) => (
                                            <option key={sup.id} value={sup.id}>
                                                {sup.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Stock Actual</label>
                                    <input
                                        required
                                        type="number"
                                        step="any"
                                        className="w-full px-3 py-2 border text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B]"
                                        value={formData.currentStock}
                                        onChange={(e) => setFormData({ ...formData, currentStock: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Precio Unitario (Bs)</label>
                                    <input
                                        required
                                        type="number"
                                        step="any"
                                        className="w-full px-3 py-2 border text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B]"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tipo de Unidad</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="kg, liters, units..."
                                        className="w-full px-3 py-2 border text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B]"
                                        value={formData.unitType}
                                        onChange={(e) => setFormData({ ...formData, unitType: e.target.value })}
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-6">
                                    <input
                                        type="checkbox"
                                        id="ingredient-state"
                                        className="h-4 w-4 rounded border-gray-300 text-[#D12B2B] focus:ring-[#D12B2B]"
                                        checked={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.checked })}
                                    />
                                    <label htmlFor="ingredient-state" className="text-sm font-bold text-gray-700 uppercase">
                                        Activo
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-6 border-t mt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 border text-sm rounded font-medium text-gray-600 hover:bg-gray-50 bg-white transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#D12B2B] hover:bg-[#A81F1F] text-white text-sm rounded font-medium transition shadow-sm"
                                >
                                    {editingIngredient ? "Guardar Cambios" : "Guardar Ingrediente"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )} */}
        </div>
    );
}







