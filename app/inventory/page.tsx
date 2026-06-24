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
import { DropdownSearchable } from "@/components/common";
import { DateUtils } from "@/utils/date-utils";

export default function InventoryABM() {
    const { user } = useAppSelector((state) => state.auth);
    const [inventoryList, setInventoryList] = useState<Inventory[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [unitMeasurements, setUnitMeasurements] = useState<UnitMeasurement[]>([]);

    const today = DateUtils.obtenerTipoFechaBoliviaLocal();
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [appliedFilters, setAppliedFilters] = useState({
        startDate: today,
        endDate: today,
    });

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
                if (!item.createdat) return false;
                const itemDate = item.createdat.split("T")[0];

                const dateMatch =
                    (!appliedFilters.startDate || itemDate >= appliedFilters.startDate) &&
                    (!appliedFilters.endDate || itemDate <= appliedFilters.endDate);

                const matchesSearch = item.ingredientname.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesIngredient = selectedIngredientFilter === 0 || item.ingredientid === selectedIngredientFilter;

                return dateMatch && matchesSearch && matchesIngredient;
            })
            .sort((a, b) => b.id - a.id);
    }, [inventoryList, searchTerm, selectedIngredientFilter, appliedFilters]);

    const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
    const paginatedInventory = useMemo(() => {
        return filteredInventory.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
    }, [filteredInventory, currentPage]);

    const totalCost = useMemo(() => {
        return filteredInventory.reduce((acc, item) => acc + (item.cost * item.currentstock), 0);
    }, [filteredInventory]);

    const lowStockCount = useMemo(() => {
        return filteredInventory.filter(item => item.currentstock <= (item.minstock || 0)).length;
    }, [filteredInventory]);

    const totalStock = useMemo(() => {
        return filteredInventory.reduce((acc, item) => acc + item.currentstock, 0);
    }, [filteredInventory]);

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
            header: "Stock",
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
            header: "Últ. Compra",
            accessor: (item) => (
                <span className="text-[#052A3D]">
                    {item.lastpurchaseprice !== null ? `${item.lastpurchaseprice.toFixed(2)} Bs` : "-"}
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

            {/* TOOLBAR DE FILTROS Y RESUMEN */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* PANEL INFORMATIVO (1 columna en lg) */}
                <div className="lg:col-span-1">
                    <div className="relative overflow-hidden rounded-lg p-5 text-white shadow-lg bg-gradient-to-br from-[#052A3D] via-[#0b3f5c] to-[#052A3D]">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-2xl"></div>

                        <div className="relative z-10 mb-2 flex flex-col items-center">
                            <p className="text-xs uppercase tracking-wider opacity-80">
                                Costo Total del Inventario
                            </p>
                            <h2 className="text-3xl font-black text-[#facc15]">
                                Bs {totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h2>
                        </div>
                        <div className="relative z-10 grid grid-cols-1 gap-2 text-center">
                            <div>
                                <p className="text-[10px] uppercase opacity-70">Items</p>
                                <p className="text-lg font-bold text-[#facc15]">
                                    {filteredInventory.length}
                                </p>
                            </div>
                            {/* <div>
                                <p className="text-[10px] uppercase opacity-70">Stock Bajo</p>
                                <p className="text-lg font-bold text-red-400">
                                    {lowStockCount}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase opacity-70">Stock Total</p>
                                <p className="text-lg font-bold">
                                    {totalStock}
                                </p>
                            </div> */}
                        </div>
                    </div>
                </div>

                {/* FILTROS (3 columnas en lg) */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Buscador de texto */}
                        <div className="relative">
                            <label className="text-sm font-medium block mb-1">Buscar Ingrediente</label>
                            <div className="relative">
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
                        </div>

                        {/* Select de filtro por ingrediente */}
                        <div>
                            <label className="text-sm font-medium block mb-1">Filtrar por Ingrediente</label>
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="text-sm font-medium">Fecha inicio</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full border rounded-md p-2 bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-[#D12B2B]"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Fecha fin</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full border rounded-md p-2 bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-[#D12B2B]"
                            />
                        </div>
                        <ButtonGeneric
                            variant="primaryRed"
                            onClick={() => {
                                setCurrentPage(1);
                                setAppliedFilters({
                                    startDate: startDate,
                                    endDate: endDate,
                                });
                            }}
                        >
                            Buscar
                        </ButtonGeneric>
                    </div>
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
                    if (formData.cost <= 0) {
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
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Ingrediente <span className="text-red-500">*</span>
                        </label>
                        <DropdownSearchable
                            placeholder="-- Seleccionar ingrediente --"
                            value={formData.ingredientid || 0}
                            onChange={(id) => {
                                setFormData({
                                    ...formData,
                                    ingredientid: typeof id === 'number' ? id : parseInt(id as string)
                                });
                            }}
                            options={ingredients.map((ing) => ({
                                id: ing.id,
                                name: ing.name,
                                price: ing.price,
                            }))}
                            required={true}
                            error={!formData.ingredientid && isModalOpen}
                        />

                        {!formData.ingredientid && isModalOpen && (
                            <p className="text-xs text-red-500 mt-1">El ingrediente es obligatorio</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Unidad de Medida <span className="text-red-500">*</span>
                        </label>
                        <DropdownSearchable
                            placeholder="-- Seleccionar unidad --"
                            value={formData.unitmeasurementid || 0}
                            onChange={(id) => {
                                setFormData({
                                    ...formData,
                                    unitmeasurementid: typeof id === 'number' ? id : parseInt(id as string)
                                });
                            }}
                            options={unitMeasurements.map((um) => ({
                                id: um.id,
                                name: `${um.name} (${um.symbol})`,
                                price: undefined, // No tiene precio
                            }))}
                            required={true}
                            error={!formData.unitmeasurementid && isModalOpen}
                        />
                        {!formData.unitmeasurementid && isModalOpen && (
                            <p className="text-xs text-red-500 mt-1">La unidad de medida es obligatoria</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Stock
                        </label>
                        <input
                            type="number"
                            step="any"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B]"
                            value={formData.currentstock || ""}
                            onChange={(e) => setFormData({ ...formData, currentstock: parseFloat(e.target.value) || 0 })}
                        />
                    </div>
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
                            value={formData.cost || ""}
                            onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Cantidad por empaque / lote
                        </label>
                        <input
                            type="number"
                            step="any"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B]"
                            value={formData.quantity || ""}
                            onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                        />
                    </div>
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
                </div>
            </ResponsiveModal>
        </div>
    );
}
