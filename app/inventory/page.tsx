"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus, Edit, Trash2, Search, SlidersHorizontal, X } from "lucide-react";
import { Ingredient, UnitMeasurement, Inventory, RoleType, ToastType } from "@/types";
import {
    getInventory,
    createInventory,
    updateInventory,
    deleteInventory,
} from "@/services/inventoryService";
import { getIngredients } from "@/services/ingredientsService";
import { getUnitMeasurements } from "@/services/unitMeasurementsService";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import ButtonGeneric from "@/components/common/button/ButtonGeneric";
import PageHeader from "@/components/page/header/PageHeader";
import { useAppSelector } from "@/store/store/hooks";
import { MENU_BY_ROL, MenuConfig } from "@/lib/constants/menuByRol";
import { Column, GenericDataTable, TableActions } from "@/components/common/table/GenericDataTable";
import AlertDialogComponent from "@/components/common/alert/AlertDialogComponent";
import { AlertVariant } from "@/types/enum/alertVariant";
import { ResponsiveModal } from "@/components/common/modal/ResponsiveModal";
import CustomNotification from "@/components/common/toast/CustomNotification";
import { toast } from "sonner";

export default function InventoryABM() {
    const { user } = useAppSelector((state) => state.auth);
    const [inventoryList, setInventoryList] = useState<Inventory[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [unitMeasurements, setUnitMeasurements] = useState<UnitMeasurement[]>([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIngredientFilter, setSelectedIngredientFilter] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Inventory | null>(null);

    const defaultFormState = {
        ingredientid: 0,
        ingredientname: "",
        unitmeasurementid: 0,
        unitmeasurementname: "",
        currentstock: 0,
        cost: 0,
        quantity: 0,
        minstock: null as number | null,
        maxstock: null as number | null,
        lastpurchaseprice: null as number | null,
        state: true,
        groupid: 1
    };
    const [formData, setFormData] = useState(defaultFormState);

    const [alertOpen, setAlertOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);

    const [userPermissions, setUserPermissions] = useState<MenuConfig>(
        MENU_BY_ROL[(user?.role?.toUpperCase() as RoleType) || "VISITOR"],
    );

    const loadData = async () => {
        try {
            const [fetchedInventory, fetchedIngredients, fetchedUnits] = await Promise.all([
                getInventory(),
                getIngredients(),
                getUnitMeasurements(),
            ]);
            setInventoryList(fetchedInventory);
            setIngredients(fetchedIngredients);
            setUnitMeasurements(fetchedUnits);
        } catch (error) {
            console.error("Error loading data:", error);
            const currentToastBody = {
                type: ToastType.Fail,
                message: "Error",
                description: "No se pudieron cargar los datos de inventario",
                image: null,
            };
            toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
        }
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

    const filteredInventory = useMemo(() => {
        return inventoryList
            .filter((item) => {
                const matchesSearch = item.ingredientname.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesIngredient = selectedIngredientFilter === 0 || item.ingredientid === selectedIngredientFilter;
                return matchesSearch && matchesIngredient;
            })
            .sort((a, b) => b.id - a.id);
    }, [inventoryList, searchTerm, selectedIngredientFilter]);

    const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
    const paginatedInventory = useMemo(() => {
        return filteredInventory.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
    }, [filteredInventory, currentPage]);

    const handleOpenModal = (item?: Inventory) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                ingredientid: item.ingredientid,
                ingredientname: item.ingredientname,
                unitmeasurementid: item.unitmeasurementid,
                unitmeasurementname: item.unitmeasurementname,
                currentstock: item.currentstock,
                cost: item.cost,
                quantity: item.quantity,
                minstock: item.minstock,
                maxstock: item.maxstock,
                lastpurchaseprice: item.lastpurchaseprice,
                state: item.state,
                groupid: item.groupid || 1
            });
        } else {
            setEditingItem(null);
            setFormData(defaultFormState);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData(defaultFormState);
    };

    const handleSaveItem = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Find selected names to keep DB consistent
        const selectedIng = ingredients.find(ing => ing.id === formData.ingredientid);
        const selectedUnit = unitMeasurements.find(um => um.id === formData.unitmeasurementid);
        
        const finalFormData = {
            ...formData,
            ingredientname: selectedIng ? selectedIng.name : "",
            unitmeasurementname: selectedUnit ? selectedUnit.name : ""
        };

        try {
            if (editingItem) {
                await updateInventory(editingItem.id, finalFormData);
            } else {
                await createInventory(finalFormData);
            }

            const currentToastBody = {
                type: ToastType.Successfully,
                message: "Éxito",
                description: editingItem ? "El item de inventario se modificó correctamente" : "El item de inventario se creó correctamente",
                image: null,
            };
            toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);

            await loadData();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving inventory item:", error);
            const currentToastBody = {
                type: ToastType.Fail,
                message: "Error",
                description: "Ocurrió un error al guardar el item de inventario",
                image: null,
            };
            toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
        }
    };

    const handleDeleteItem = (id: number) => {
        setItemToDelete(id);
        setAlertOpen(true);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete !== null) {
            deleteInventory(itemToDelete).then((success) => {
                if (success) {
                    const currentToastBody = {
                        type: ToastType.Successfully,
                        message: "Éxito",
                        description: "Item de inventario eliminado correctamente",
                        image: null,
                    };
                    toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
                    loadData();
                } else {
                    const currentToastBody = {
                        type: ToastType.Fail,
                        message: "Error",
                        description: "No se pudo eliminar el item de inventario",
                        image: null,
                    };
                    toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
                }
                setItemToDelete(null);
                setAlertOpen(false);
            });
        }
    };

    const actions: TableActions<Inventory> = {
        onEdit: (item) => handleOpenModal(item),
        onDelete: (item) => handleDeleteItem(item.id),
    };

    const columns: Column<Inventory>[] = [
        {
            header: "Ingrediente",
            accessor: (item) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-[#052A3D]">{item.ingredientname}</span>
                </div>
            ),
        },
        {
            header: "U. Medida",
            accessor: (item) => (
                <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-medium">
                    {item.unitmeasurementname}
                </span>
            ),
        },
        {
            header: "Stock Actual",
            accessor: (item) => (
                <span className={`font-semibold ${item.currentstock <= (item.minstock || 0) ? 'text-red-600' : 'text-slate-800'}`}>
                    {item.currentstock}
                </span>
            ),
        },
        {
            header: "Costo (Bs)",
            accessor: (item) => (
                <span className="font-semibold text-[#052A3D]">
                    {item.cost.toFixed(2)}
                </span>
            ),
        },
        {
            header: "Cantidad",
            accessor: (item) => (
                <span className="text-slate-800">{item.quantity}</span>
            ),
        },
        {
            header: "Límites (Mín/Máx)",
            accessor: (item) => (
                <span className="text-xs text-gray-500">
                    Min: {item.minstock !== null ? item.minstock : "-"} / Max: {item.maxstock !== null ? item.maxstock : "-"}
                </span>
            ),
        },
        {
            header: "Últ. Compra",
            accessor: (item) => (
                <span className="text-[#052A3D]">
                    {item.lastpurchaseprice !== null ? `${item.lastpurchaseprice.toFixed(2)} Bs` : "-"}
                </span>
            ),
        },
        {
            header: "Estado",
            accessor: (item) => (
                <span className={`px-2 py-1 rounded text-xs font-medium ${item.state ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {item.state ? "Activo" : "Inactivo"}
                </span>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Gestión de Inventario"
                subtitle="Control de existencias, costos y stock mínimo/máximo."
                action={
                    <div className="w-50">
                        <ButtonGeneric onClick={() => handleOpenModal()}>
                            Nuevo Registro
                        </ButtonGeneric>
                    </div>
                }
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Búsqueda por ingrediente */}
                <div className="relative sm:col-span-2">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por ingrediente..."
                        className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#D12B2B] focus:bg-white transition"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                {/* Filtro por ingrediente select */}
                <div className="sm:col-span-1">
                    <Select
                        value={String(selectedIngredientFilter)}
                        onValueChange={(val) => {
                            setSelectedIngredientFilter(parseInt(val));
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full shadow-sm hover:shadow-md">
                            <SelectValue placeholder="Filtrar por ingrediente" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">Todos los ingredientes</SelectItem>
                            {ingredients.map((ing) => (
                                <SelectItem key={ing.id} value={String(ing.id)}>
                                    {ing.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-4">
                <GenericDataTable
                    columns={columns}
                    data={paginatedInventory}
                    actions={actions}
                    showActions={true}
                    rowKey="id"
                    pagination={{
                        currentPage,
                        totalPages,
                        totalItems: filteredInventory.length,
                        itemsPerPage,
                        onPageChange: (page) => setCurrentPage(page),
                    }}
                />

                <AlertDialogComponent
                    isOpen={alertOpen}
                    onClose={() => {
                        setAlertOpen(false);
                        setItemToDelete(null);
                    }}
                    onConfirm={handleConfirmDelete}
                    variant={AlertVariant.DANGER}
                    title="Eliminar ítem de inventario"
                    message="¿Estás seguro de que deseas eliminar este ítem del inventario? Esta acción no se puede deshacer."
                    confirmText="Eliminar"
                    cancelText="Cancelar"
                />
            </div>

            <ResponsiveModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={() => {
                    if (!formData.ingredientid) {
                        const currentToastBody = {
                            type: ToastType.Fail,
                            message: "Error",
                            description: "Debes seleccionar un ingrediente",
                            image: null,
                        };
                        toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
                        return;
                    }
                    if (!formData.unitmeasurementid) {
                        const currentToastBody = {
                            type: ToastType.Fail,
                            message: "Error",
                            description: "Debes seleccionar una unidad de medida",
                            image: null,
                        };
                        toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
                        return;
                    }
                    if (formData.currentstock < 0) {
                        const currentToastBody = {
                            type: ToastType.Fail,
                            message: "Error",
                            description: "El stock actual no puede ser negativo",
                            image: null,
                        };
                        toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
                        return;
                    }
                    if (formData.cost < 0) {
                        const currentToastBody = {
                            type: ToastType.Fail,
                            message: "Error",
                            description: "El costo no puede ser negativo",
                            image: null,
                        };
                        toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
                        return;
                    }
                    if (formData.quantity < 0) {
                        const currentToastBody = {
                            type: ToastType.Fail,
                            message: "Error",
                            description: "La cantidad no puede ser negativa",
                            image: null,
                        };
                        toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
                        return;
                    }

                    const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
                    handleSaveItem(fakeEvent);
                }}
                title={editingItem ? "Editar Item de Inventario" : "Registrar en Inventario"}
                subtitle={editingItem ? "Modifica los datos del registro en inventario" : "Completa los datos para registrar en inventario"}
                size="lg"
                confirmText={editingItem ? "Guardar Cambios" : "Guardar Registro"}
                cancelText="Cancelar"
                isProcessing={false}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Ingrediente */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Ingrediente <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            className={`w-full px-3 py-2 border text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B] bg-white ${!formData.ingredientid && isModalOpen ? 'border-red-500' : 'border-gray-300'}`}
                            value={formData.ingredientid}
                            onChange={(e) => setFormData({ ...formData, ingredientid: parseInt(e.target.value) })}
                        >
                            <option value="0">Seleccionar ingrediente</option>
                            {ingredients.map((ing) => (
                                <option key={ing.id} value={ing.id}>
                                    {ing.name}
                                </option>
                            ))}
                        </select>
                        {!formData.ingredientid && isModalOpen && (
                            <p className="text-xs text-red-500 mt-1">El ingrediente es obligatorio</p>
                        )}
                    </div>

                    {/* Unidad de Medida */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Unidad de Medida <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            className={`w-full px-3 py-2 border text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B] bg-white ${!formData.unitmeasurementid && isModalOpen ? 'border-red-500' : 'border-gray-300'}`}
                            value={formData.unitmeasurementid}
                            onChange={(e) => setFormData({ ...formData, unitmeasurementid: parseInt(e.target.value) })}
                        >
                            <option value="0">Seleccionar unidad</option>
                            {unitMeasurements.map((um) => (
                                <option key={um.id} value={um.id}>
                                    {um.name} ({um.symbol})
                                </option>
                            ))}
                        </select>
                        {!formData.unitmeasurementid && isModalOpen && (
                            <p className="text-xs text-red-500 mt-1">La unidad de medida es obligatoria</p>
                        )}
                    </div>

                    {/* Stock Actual */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Stock Actual <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            type="number"
                            step="any"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B]"
                            value={formData.currentstock}
                            onChange={(e) => setFormData({ ...formData, currentstock: parseFloat(e.target.value) || 0 })}
                        />
                    </div>

                    {/* Costo */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Costo (Bs) <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            type="number"
                            step="any"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B]"
                            value={formData.cost}
                            onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                        />
                    </div>

                    {/* Cantidad */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Cantidad por empaque / lote <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            type="number"
                            step="any"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B]"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                        />
                    </div>

                    {/* Último Precio de Compra */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Último Precio Compra (Bs)
                        </label>
                        <input
                            type="number"
                            step="any"
                            min="0"
                            placeholder="Opcional"
                            className="w-full px-3 py-2 border border-gray-300 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B]"
                            value={formData.lastpurchaseprice !== null ? formData.lastpurchaseprice : ""}
                            onChange={(e) => {
                                const val = e.target.value;
                                setFormData({ ...formData, lastpurchaseprice: val === "" ? null : parseFloat(val) });
                            }}
                        />
                    </div>

                    {/* Stock Mínimo */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Stock Mínimo
                        </label>
                        <input
                            type="number"
                            step="any"
                            min="0"
                            placeholder="Opcional"
                            className="w-full px-3 py-2 border border-gray-300 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B]"
                            value={formData.minstock !== null ? formData.minstock : ""}
                            onChange={(e) => {
                                const val = e.target.value;
                                setFormData({ ...formData, minstock: val === "" ? null : parseFloat(val) });
                            }}
                        />
                    </div>

                    {/* Stock Máximo */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Stock Máximo
                        </label>
                        <input
                            type="number"
                            step="any"
                            min="0"
                            placeholder="Opcional"
                            className="w-full px-3 py-2 border border-gray-300 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B]"
                            value={formData.maxstock !== null ? formData.maxstock : ""}
                            onChange={(e) => {
                                const val = e.target.value;
                                setFormData({ ...formData, maxstock: val === "" ? null : parseFloat(val) });
                            }}
                        />
                    </div>

                    {/* Estado - Activo */}
                    <div className="flex items-center gap-2 pt-6 sm:col-span-2">
                        <input
                            type="checkbox"
                            id="inventory-state"
                            className="h-4 w-4 rounded border-gray-300 text-[#D12B2B] focus:ring-[#D12B2B]"
                            checked={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.checked })}
                        />
                        <label htmlFor="inventory-state" className="text-sm font-bold text-gray-700 uppercase cursor-pointer">
                            Activo / Disponible
                        </label>
                    </div>
                </div>
            </ResponsiveModal>
        </div>
    );
}
