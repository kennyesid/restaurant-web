"use client";

import React, { useState, useEffect, useMemo, Fragment } from "react";
import { Plus, Edit, Trash2, Search, SlidersHorizontal, X } from "lucide-react";
import { Ingredient, IngredientCategories } from "@/types";
import {
    getIngredients,
    getCategories,
    createIngredient,
    updateIngredient,
    deleteIngredient,
} from "@/services/ingredientsService";

// Tipado básico para proveedores en el dropdown
interface Supplier {
    id: number;
    name: string;
}

export default function IngredientsABM() {
    // Estados de datos maestros
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [categories, setCategories] = useState<IngredientCategories[]>([]);

    // Proveedores de prueba basados en los datos iniciales
    const [suppliers] = useState<Supplier[]>([
        { id: 1, name: "Carnes Premium" },
        { id: 2, name: "Distribuidora General" },
        { id: 3, name: "Verduras Frescas" },
        { id: 4, name: "Lácteos S.A." },
        { id: 5, name: "Panadería Local" },
    ]);

    // Estados de filtros y búsqueda
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedSupplier, setSelectedSupplier] = useState<string>("all");

    // Estados de paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Estados del modal de formulario
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

    // Datos del formulario inicial
    const defaultFormState = {
        name: "",
        description: "",
        ingredientCategoriesId: 1,
        supplierId: 0, // 0 = Ninguno
        quantity: 0,
        price: 0,
        unitType: "kg",
        currentStock: 0,
        quantitypiecesOfChicken: undefined as number | undefined,
        state: true,
    };

    const [formData, setFormData] = useState(defaultFormState);

    // Carga inicial de datos
    const loadData = async () => {
        const [fetchedIngredients, fetchedCategories] = await Promise.all([
            getIngredients(),
            getCategories(),
        ]);
        setIngredients(fetchedIngredients);
        setCategories(fetchedCategories);
    };

    useEffect(() => {
        loadData();
    }, []);

    // Filtrado y Ordenamiento
    const filteredIngredients = useMemo(() => {
        return ingredients
            .filter((item) => {
                const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());

                const matchesCategory =
                    selectedCategory === "all" || item.ingredientCategoriesId.toString() === selectedCategory;

                const matchesSupplier =
                    selectedSupplier === "all" || item.supplierId.toString() === selectedSupplier;

                return matchesSearch && matchesCategory && matchesSupplier;
            })
            .sort((a, b) => b.id - a.id); // Orden descendente por ID
    }, [ingredients, searchTerm, selectedCategory, selectedSupplier]);

    // Paginación de los datos filtrados
    const totalPages = Math.ceil(filteredIngredients.length / itemsPerPage);
    const paginatedIngredients = useMemo(() => {
        return filteredIngredients.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
    }, [filteredIngredients, currentPage]);

    // Manejadores del CRUD
    const handleOpenModal = (ingredient?: Ingredient) => {
        if (ingredient) {
            setEditingIngredient(ingredient);
            setFormData({
                name: ingredient.name,
                description: ingredient.description,
                ingredientCategoriesId: ingredient.ingredientCategoriesId,
                supplierId: ingredient.supplierId,
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
        await loadData();
        handleCloseModal();
    };

    const handleDeleteIngredient = async (id: number) => {
        if (confirm("¿Estás seguro de que deseas eliminar este ingrediente?")) {
            await deleteIngredient(id);
            await loadData();
        }
    };

    return (
        <div className="space-y-6">
            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#052A3D]">Ingredientes e Insumos</h2>
                    <p className="text-sm text-gray-500">Gestión completa de artículos de cocina y costos.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 bg-[#D12B2B] hover:bg-[#A81F1F] text-white px-4 py-2.5 rounded-md text-sm font-semibold transition-all shadow-sm"
                >
                    <Plus size={18} />
                    Nuevo Ingrediente
                </button>
            </div>

            {/* FILTROS SECTION */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-md border border-gray-100 shadow-sm">
                {/* Búsqueda general */}
                <div className="relative">
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

                {/* Categorías */}
                <div className="relative">
                    <select
                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#D12B2B] focus:bg-white transition appearance-none cursor-pointer"
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="all">Todas las Categorías</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Proveedores */}
                <div className="relative">
                    <select
                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#D12B2B] focus:bg-white transition appearance-none cursor-pointer"
                        value={selectedSupplier}
                        onChange={(e) => {
                            setSelectedSupplier(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="all">Todos los Proveedores</option>
                        <option value="0">0 = Ninguno</option>
                        {suppliers.map((sup) => (
                            <option key={sup.id} value={sup.id}>
                                {sup.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* DATA TABLE */}
            <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-xs font-bold text-gray-600 uppercase border-b border-gray-200">
                                <th className="px-6 py-3.5">ID</th>
                                <th className="px-6 py-3.5">Nombre</th>
                                <th className="px-6 py-3.5">Categoría</th>
                                <th className="px-6 py-3.5">Proveedor</th>
                                <th className="px-6 py-3.5">Stock actual</th>
                                <th className="px-6 py-3.5 text-right">Precio unitario</th>
                                <th className="px-6 py-3.5">Estado</th>
                                <th className="px-6 py-3.5 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {paginatedIngredients.map((item, index) => {
                                const categoryName = categories.find((c) => c.id === item.ingredientCategoriesId)?.name || "Sin categoría";
                                const supplierName = suppliers.find((s) => s.id === item.supplierId)?.name || "Ninguno";

                                return (
                                    <tr key={index} className="hover:bg-gray-50/60 transition-colors text-sm">
                                        <td className="px-6 py-4 font-bold text-gray-500">#{item.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-[#052A3D]">{item.name}</span>
                                                {item.description && (
                                                    <span className="text-xs text-gray-400 font-normal truncate max-w-[200px]">
                                                        {item.description}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-medium">
                                                {categoryName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {supplierName}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-700">
                                            {item.currentStock} {item.unitType}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                                            Bs {item.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${item.state
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {item.state ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-1">
                                                <button
                                                    onClick={() => handleOpenModal(item)}
                                                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteIngredient(item.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredIngredients.length === 0 && (
                        <div className="p-12 text-center text-gray-400">
                            No se encontraron registros de ingredientes.
                        </div>
                    )}
                </div>

                {/* CONTROLES DE PAGINACIÓN */}
                {filteredIngredients.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 text-xs font-medium text-gray-600">
                        <div>
                            Mostrando <span className="font-bold">{paginatedIngredients.length}</span> de{" "}
                            <span className="font-bold">{filteredIngredients.length}</span> registros
                        </div>
                        <div className="flex gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-white bg-gray-100 transition text-gray-700 font-semibold disabled:opacity-50"
                            >
                                Anterior
                            </button>
                            <div className="flex items-center px-2 text-sm font-semibold text-[#052A3D]">
                                Página {currentPage} de {totalPages || 1}
                            </div>
                            <button
                                disabled={currentPage === totalPages || totalPages === 0}
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                className="px-3 py-1.5 border border-gray-200 rounded-md hover:bg-white bg-gray-100 transition text-gray-700 font-semibold disabled:opacity-50"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL: ALTA Y MODIFICACIÓN */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white w-full max-w-xl rounded-md shadow-xl border border-gray-100 flex flex-col max-h-[90vh]">
                        {/* Header del modal */}
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

                        {/* Formulario */}
                        <form onSubmit={handleSaveIngredient} className="p-6 space-y-4 overflow-y-auto">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Nombre */}
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

                                {/* Descripción */}
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

                                {/* Categoría */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Categoría</label>
                                    <select
                                        required
                                        className="w-full px-3 py-2 border text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B] bg-white"
                                        value={formData.ingredientCategoriesId}
                                        onChange={(e) => setFormData({ ...formData, ingredientCategoriesId: parseInt(e.target.value) })}
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Proveedor */}
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

                                {/* Stock actual */}
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

                                {/* Precio Unitario */}
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

                                {/* Tipo de Unidad */}
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

                                {/* Estado Activo */}
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

                            {/* Botones de acción */}
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
            )}
        </div>
    );
}