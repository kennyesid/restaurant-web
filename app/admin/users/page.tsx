"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus, Edit, Trash2, Search, X } from "lucide-react";
import { User, Role, RoleType, ToastType } from "@/types";
import {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    getRoles,
} from "@/services/usersService";
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

export default function UsersABM() {
    const { user } = useAppSelector((state) => state.auth);
    const [usersList, setUsersList] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRoleFilter, setSelectedRoleFilter] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const defaultFormState = {
        username: "",
        fullName: "",
        lastname: "",
        password: "",
        document: "",
        nit: "",
        phone: "",
        address: "",
        email: "",
        roleId: 0,
        state: true,
    };
    const [formData, setFormData] = useState(defaultFormState);

    const [alertOpen, setAlertOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);

    const [userPermissions, setUserPermissions] = useState<MenuConfig>(
        MENU_BY_ROL[(user?.role?.toUpperCase() as RoleType) || "VISITOR"],
    );

    const loadData = async () => {
        try {
            setLoading(true);
            const [fetchedUsers, fetchedRoles] = await Promise.all([
                getUsers(),
                getRoles(),
            ]);
            setUsersList(fetchedUsers);
            setRoles(fetchedRoles);
        } catch (error) {
            console.error("Error loading data:", error);
            const currentToastBody = {
                type: ToastType.Fail,
                message: "Error",
                description: "No se pudieron cargar los datos de usuarios",
                image: null,
            };
            toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
        } finally {
            setLoading(false);
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

    const filteredUsers = useMemo(() => {
        return usersList
            .filter((item) => {
                const matchesSearch =
                    item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.email.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesRole = selectedRoleFilter === 0 || item.roleId === selectedRoleFilter;
                return matchesSearch && matchesRole;
            })
            .sort((a, b) => b.id - a.id);
    }, [usersList, searchTerm, selectedRoleFilter]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = useMemo(() => {
        return filteredUsers.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
    }, [filteredUsers, currentPage]);

    const handleOpenModal = (item?: User) => {
        if (item) {
            setEditingUser(item);
            setFormData({
                username: item.username,
                fullName: item.fullName,
                lastname: item.lastname || "",
                password: item.password,
                document: item.document,
                nit: item.nit || "",
                phone: item.phone,
                address: item.address,
                email: item.email,
                roleId: item.roleId || 0,
                state: item.state !== undefined ? item.state : true,
            });
        } else {
            setEditingUser(null);
            setFormData(defaultFormState);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setFormData(defaultFormState);
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic fields validations
        if (!formData.username.trim() || !formData.fullName.trim() || !formData.email.trim() || !formData.password.trim() || !formData.roleId) {
            return;
        }

        const selectedRoleName = roles.find(r => r.id === formData.roleId)?.name || "";

        try {
            if (editingUser) {
                await updateUser(editingUser.id, {
                    ...formData,
                    role: selectedRoleName,
                });
            } else {
                await createUser({
                    ...formData,
                    tenantId: 1,
                    branchId: 0,
                    avatarUrl: "",
                    groupId: 1,
                    groupCode: "default",
                    role: selectedRoleName,
                });
            }

            const currentToastBody = {
                type: ToastType.Successfully,
                message: "Éxito",
                description: editingUser ? "El usuario se modificó correctamente" : "El usuario se creó correctamente",
                image: null,
            };
            toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);

            await loadData();
            handleCloseModal();
        } catch (error) {
            console.error("Error saving user:", error);
            const currentToastBody = {
                type: ToastType.Fail,
                message: "Error",
                description: "Ocurrió un error al guardar el usuario",
                image: null,
            };
            toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
        }
    };

    const handleDeleteUser = (id: number) => {
        setUserToDelete(id);
        setAlertOpen(true);
    };

    const handleConfirmDelete = () => {
        if (userToDelete !== null) {
            deleteUser(userToDelete).then((success) => {
                if (success) {
                    const currentToastBody = {
                        type: ToastType.Successfully,
                        message: "Éxito",
                        description: "Usuario inhabilitado correctamente",
                        image: null,
                    };
                    toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
                    loadData();
                } else {
                    const currentToastBody = {
                        type: ToastType.Fail,
                        message: "Error",
                        description: "No se pudo inhabilitar al usuario",
                        image: null,
                    };
                    toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
                }
                setUserToDelete(null);
                setAlertOpen(false);
            });
        }
    };

    const actions: TableActions<User> = {
        onEdit: (item) => handleOpenModal(item),
        // onDelete: (item) => handleDeleteUser(item.id),
    };

    const columns: Column<User>[] = [
        {
            header: "Usuario / Nombre Completo",
            accessor: (item) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-[#052A3D]">{item.fullName} {item.lastname || ""}</span>
                    <span className="text-xs text-gray-500">@{item.username}</span>
                </div>
            ),
        },
        {
            header: "Email / Contacto",
            accessor: (item) => (
                <div className="flex flex-col text-xs text-slate-700">
                    <span>📧 {item.email}</span>
                    <span>📞 {item.phone || "-"}</span>
                </div>
            ),
        },
        {
            header: "Documento / NIT",
            accessor: (item) => (
                <div className="flex flex-col text-xs text-slate-700">
                    <span>CI: {item.document}</span>
                    {item.nit && <span>NIT: {item.nit}</span>}
                </div>
            ),
        },
        {
            header: "Rol",
            accessor: (item) => {
                const roleName = roles.find((r) => r.id === item.roleId)?.name || item.role || "Sin rol";
                return (
                    <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-medium">
                        {roleName}
                    </span>
                );
            },
        },
        // {
        //     header: "Estado",
        //     accessor: (item) => (
        //         <span className={`px-2 py-1 rounded text-xs font-medium ${item.state ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
        //             {item.state ? "Activo" : "Inactivo"}
        //         </span>
        //     ),
        // },
    ];

    if (loading) {
        return <div className="p-6 text-center text-slate-500 font-medium">Cargando usuarios...</div>;
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Gestión de Usuarios"
                subtitle="Administración de cuentas, credenciales, contactos y roles de acceso."
                action={
                    <div className="w-50">
                        <ButtonGeneric onClick={() => handleOpenModal()}>
                            Nuevo Usuario
                        </ButtonGeneric>
                    </div>
                }
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Búsqueda por nombre o usuario */}
                <div className="relative sm:col-span-2">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, usuario o correo..."
                        className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#D12B2B] focus:bg-white transition"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                {/* Filtro por Rol select */}
                <div className="sm:col-span-1">
                    <Select
                        value={String(selectedRoleFilter)}
                        onValueChange={(val) => {
                            setSelectedRoleFilter(parseInt(val));
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full shadow-sm hover:shadow-md">
                            <SelectValue placeholder="Filtrar por rol" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">Todos los roles</SelectItem>
                            {roles.map((role) => (
                                <SelectItem key={role.id} value={String(role.id)}>
                                    {role.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-4">
                <GenericDataTable
                    columns={columns}
                    data={paginatedUsers}
                    actions={actions}
                    showActions={true}
                    rowKey="id"
                    pagination={{
                        currentPage,
                        totalPages,
                        totalItems: filteredUsers.length,
                        itemsPerPage,
                        onPageChange: (page) => setCurrentPage(page),
                    }}
                />

                <AlertDialogComponent
                    isOpen={alertOpen}
                    onClose={() => {
                        setAlertOpen(false);
                        setUserToDelete(null);
                    }}
                    onConfirm={handleConfirmDelete}
                    variant={AlertVariant.DANGER}
                    title="Inhabilitar usuario"
                    message="¿Estás seguro de que deseas inhabilitar este usuario? No podrá iniciar sesión en la aplicación."
                    confirmText="Inhabilitar"
                    cancelText="Cancelar"
                />
            </div>

            <ResponsiveModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={() => {
                    if (!formData.username.trim()) {
                        const currentToastBody = { type: ToastType.Fail, message: "Error", description: "El nombre de usuario es obligatorio", image: null };
                        toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
                        return;
                    }
                    if (!formData.fullName.trim()) {
                        const currentToastBody = { type: ToastType.Fail, message: "Error", description: "El nombre completo es obligatorio", image: null };
                        toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
                        return;
                    }
                    if (!formData.document.trim()) {
                        const currentToastBody = { type: ToastType.Fail, message: "Error", description: "El documento es obligatorio", image: null };
                        toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
                        return;
                    }
                    if (!formData.phone.trim()) {
                        const currentToastBody = { type: ToastType.Fail, message: "Error", description: "El teléfono es obligatorio", image: null };
                        toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
                        return;
                    }
                    if (!formData.email.trim() || !formData.email.includes("@")) {
                        const currentToastBody = { type: ToastType.Fail, message: "Error", description: "Ingresa un correo electrónico válido", image: null };
                        toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
                        return;
                    }
                    if (!formData.password.trim() || formData.password.length < 4) {
                        const currentToastBody = { type: ToastType.Fail, message: "Error", description: "La contraseña debe tener al menos 4 caracteres", image: null };
                        toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
                        return;
                    }
                    if (!formData.roleId) {
                        const currentToastBody = { type: ToastType.Fail, message: "Error", description: "Debes seleccionar un rol", image: null };
                        toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />);
                        return;
                    }

                    const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
                    handleSaveUser(fakeEvent);
                }}
                title={editingUser ? "Editar Usuario" : "Registrar Nuevo Usuario"}
                subtitle={editingUser ? "Modifica los datos del usuario" : "Completa los datos del nuevo usuario"}
                size="xl"
                confirmText={editingUser ? "Guardar Cambios" : "Guardar Usuario"}
                cancelText="Cancelar"
                isProcessing={false}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Username */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Nombre de Usuario <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="Ej. jgonzales"
                            className="w-full px-3 py-2 border border-gray-300 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B]"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value.replace(/\s+/g, '') })}
                        />
                    </div>

                    {/* Contraseña */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Contraseña <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            type="password"
                            placeholder="Mínimo 4 caracteres"
                            className="w-full px-3 py-2 border border-gray-300 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B]"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    {/* Nombre Completo */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Nombres <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="Ej. Juan Carlos"
                            className="w-full px-3 py-2 border border-gray-300 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B]"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        />
                    </div>

                    {/* Apellidos */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Apellidos
                        </label>
                        <input
                            type="text"
                            placeholder="Ej. Gonzales Pérez"
                            className="w-full px-3 py-2 border border-gray-300 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B]"
                            value={formData.lastname}
                            onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                        />
                    </div>

                    {/* Documento */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Documento de Identidad (CI) <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="Ej. 7654321 LP"
                            className="w-full px-3 py-2 border border-gray-300 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B]"
                            value={formData.document}
                            onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                        />
                    </div>

                    {/* NIT */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            NIT / Factura
                        </label>
                        <input
                            type="text"
                            placeholder="Opcional"
                            className="w-full px-3 py-2 border border-gray-300 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B]"
                            value={formData.nit}
                            onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                        />
                    </div>

                    {/* Teléfono */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Teléfono de contacto <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="Ej. 76543210"
                            className="w-full px-3 py-2 border border-gray-300 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B]"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    {/* Correo Electrónico */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Correo Electrónico <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            type="email"
                            placeholder="Ej. juan@restaurante.com"
                            className="w-full px-3 py-2 border border-gray-300 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B]"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value.replace(/\s+/g, '') })}
                        />
                    </div>

                    {/* Dirección */}
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Dirección de Domicilio
                        </label>
                        <input
                            type="text"
                            placeholder="Ej. Av. Ballivián #321, Calacoto"
                            className="w-full px-3 py-2 border border-gray-300 text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B]"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    {/* Rol */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Rol de Acceso <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            className={`w-full px-3 py-2 border text-sm rounded focus:outline-none focus:ring-1 focus:ring-[#D12B2B] bg-white ${!formData.roleId && isModalOpen ? 'border-red-500' : 'border-gray-300'}`}
                            value={formData.roleId}
                            onChange={(e) => setFormData({ ...formData, roleId: parseInt(e.target.value) })}
                        >
                            <option value="0">Seleccionar rol</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Estado - Activo */}
                    <div className="flex items-center gap-2 pt-6">
                        <input
                            type="checkbox"
                            id="user-state"
                            className="h-4 w-4 rounded border-gray-300 text-[#D12B2B] focus:ring-[#D12B2B]"
                            checked={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.checked })}
                        />
                        <label htmlFor="user-state" className="text-sm font-bold text-gray-700 uppercase cursor-pointer">
                            Activo
                        </label>
                    </div>
                </div>
            </ResponsiveModal>
        </div>
    );
}
