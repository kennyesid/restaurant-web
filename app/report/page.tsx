"use client";

import { Fragment, useEffect, useState } from "react";
import { getSales, deleteSale, getAllSalesWithDetails } from "@/services/salesService";
import { Button } from "@/components/ui/button";
import { Sale, User } from "@/types";
import { Card } from "@/components/ui/card";
import {
  Trash2,
  Eye,
  Edit,
  Key,
  Utensils,
  Package,
  Moon,
  Sun,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { handleResponse } from "@/utils/api-helpers";
import ButtonGeneric from "@/components/common/button/ButtonGeneric";
import React from "react";
import PageHeader from "@/components/page/header/PageHeader";
import { DateUtils } from "@/utils/date-utils";
import { AlertVariant } from "@/types/enum/alertVariant";
import AlertDialogComponent from "@/components/common/alert/AlertDialogComponent";
import { OrderTypeEnum } from "@/types/enum/orderTypeEnum";
import { getUsers } from "@/services/usersService";

export default function ReportsPage() {
  const today = DateUtils.obtenerTipoFechaBoliviaLocal();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [filterUser, setFilterUser] = useState("all");
  const [filterPaymentType, setFilterPaymentType] = useState("all");
  const [expandedPromos, setExpandedPromos] = useState<Record<string, boolean>>(
    {},
  );
  const [alertOpen, setAlertOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<number | null>(null);
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: today,
    endDate: today,
    filterUser: "all",
    filterPaymentType: "all",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadSales();
    loadAll();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await getAllSalesWithDetails();
      console.log('data:: ', JSON.stringify(data));
      handleResponse(data, setSales);
    } catch (error) {
      console.error("Error loading sales:", error);
    } finally {
      setLoading(false);
    }
  };
  // useEffect(() => {
  //   console.log("sales", sales.map(s => s.id));
  // }, [sales]);

  const loadAll = async () => {
    try {
      const [usersRes] =
        await Promise.all([
          getUsers(),
        ]);
      setUsers(usersRes || []);
    } catch (error) {
      console.error("Error loading sales:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales
    .filter((sale) => {
      if (!sale.createdAt) return false;

      const saleDate = DateUtils.obtenerFechaBoliviaLocal(sale.createdAt);

      const dateMatch =
        (!appliedFilters.startDate || saleDate >= appliedFilters.startDate) &&
        (!appliedFilters.endDate || saleDate <= appliedFilters.endDate);

      const userMatch =
        filterUser === "all" || sale.userId?.toString() === filterUser;

      const paymentMatch =
        filterPaymentType === "all" || sale.paymentType === filterPaymentType;

      return dateMatch && userMatch && paymentMatch;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const uniquePaymentTypes = ["cash", "qr", "mixed"];

  const qrSales = sales.filter((s) => s.paymentType === "qr");
  const cashSales = sales.filter((s) => s.paymentType === "cash");
  const mixedSales = sales.filter((s) => s.paymentType === "mixed");

  const totalSales = filteredSales.reduce((acc, sale) => acc + sale.total, 0);

  const getPaymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      cash: "Efectivo",
      qr: "QR",
      mixed: "Mixto",
    };
    return labels[type] || type;
  };

  if (loading)
    return (
      <div className="p-6 text-center font-medium text-[#052A3D]">
        Cargando historial...
      </div>
    );
  const togglePromo = (saleId: number, itemIdx: number) => {
    const key = `${saleId}-${itemIdx}`;
    setExpandedPromos((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  return (
    <div className="space-y-3">
      <PageHeader
        title="Control De Ventas"
        subtitle="Gestiona y audita las transacciones del sistema"
        action={
          <Button onClick={loadSales} variant="outline" size="sm">
            Actualizar Datos
          </Button>
        }
      />
      {/* TOOLBAR DE FILTROS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 ">
        <div className="lg:col-span-1">
          <div className="relative overflow-hidden rounded-lg p-5 text-white shadow-lg bg-gradient-to-br from-[#052A3D] via-[#0b3f5c] to-[#052A3D]">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-2xl"></div>

            <div className="relative z-10 mb-2 flex flex-col items-center">
              <p className="text-xs uppercase tracking-wider opacity-80">
                Resumen de Ventas
              </p>
              <h2 className="text-3xl font-black text-[#facc15]">
                Bs {totalSales.toLocaleString()}
              </h2>
            </div>
            <div className="relative z-10 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] uppercase opacity-70">Efectivo</p>
                <p className="text-lg font-bold text-[#facc15]">
                  {cashSales.length}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase opacity-70">QR</p>
                <p className="text-lg font-bold">{qrSales.length}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase opacity-70">Mixto</p>
                <p className="text-lg font-bold">{mixedSales.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Usuario</label>
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="w-full border rounded-md p-2"
              >
                <option value="all">Todos</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id.toString()}>
                    {user.fullName || `Usuario ${user.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Tipo de pago</label>
              <select
                value={filterPaymentType}
                onChange={(e) => setFilterPaymentType(e.target.value)}
                className="w-full border rounded-md p-2"
              >
                <option value="all">Todos</option>
                {uniquePaymentTypes.map((type) => (
                  <option key={type} value={type}>
                    {getPaymentTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-sm font-medium">Fecha inicio</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border rounded-md p-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Fecha fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border rounded-md p-2"
              />
            </div>
            <ButtonGeneric
              variant="primaryRed"
              onClick={() => {
                setFilterUser("all");
                setFilterPaymentType("all");
                setCurrentPage(1);
                setAppliedFilters({
                  startDate: startDate,
                  endDate: endDate,
                  filterUser: "all",
                  filterPaymentType: "all",
                });
              }}
            >
              Buscar
            </ButtonGeneric>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border-none rounded-md shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#052A3D] text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3"></th>
                <th className="px-6 py-3 font-semibold">Pedido</th>
                <th className="px-6 py-3 font-semibold">Fecha y Hora</th>
                <th className="px-6 py-3 font-semibold">Cliente</th>
                <th className="px-6 py-3 font-semibold">Tipo Orden</th>
                <th className="px-6 py-3 font-semibold">Operador</th>
                <th className="px-6 py-3 font-semibold">Pago</th>
                <th className="px-6 py-3 font-semibold">Monto Pagado</th>
                <th className="px-6 py-3 font-semibold">Cambio</th>
                <th className="px-6 py-3 font-semibold text-right">Total</th>
                <th className="px-6 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {paginatedSales.map((sale, index) => (

                <Fragment key={index}>
                  <tr className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-2">
                      <button
                        onClick={() =>
                          setExpandedRow(
                            expandedRow === sale.id ? null : sale.id,
                          )
                        }
                        className="p-1 rounded hover:bg-muted transition text-lg font-bold text-[#0b3f5c]"
                      >
                        {expandedRow === sale.id ? "▾" : "▸"}
                      </button>
                    </td>
                    <td className="px-6 py-2">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#052A3D]">
                          #{sale.orderNumber}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          ID Venta: {sale.id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-2">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {new Date(sale.createdAt).toLocaleDateString("es-BO")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(sale.createdAt).toLocaleTimeString(
                            "es-BO",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            },
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-2">
                      <div className="flex flex-col">
                        {sale.userCustomerName ? (
                          <span className="text-xs font-bold uppercase text-gray-800">
                            {sale.userCustomerName}
                          </span>
                        ) : (
                          <span className="text-xs italic text-gray-400">
                            Sin Nombre
                          </span>
                        )}
                        {sale.userDocument && (
                          <span className="text-[10px] font-mono text-muted-foreground">
                            CI: {sale.userDocument}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${sale.orderType === OrderTypeEnum.CONSUMO_LOCAL
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-teal-50 text-teal-800 border border-teal-200"
                          }`}
                      >
                        {sale.orderType === OrderTypeEnum.CONSUMO_LOCAL ? (
                          <Utensils size={10} />
                        ) : (
                          <Package size={10} />
                        )}
                        {sale.orderType}
                      </span>
                    </td>
                    <td className="px-6 py-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-gray-600 font-medium">
                          {sale.userName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${sale.paymentType === "cash"
                          ? "bg-green-100 text-green-700"
                          : sale.paymentType === "qr"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                          }`}
                      >
                        {getPaymentTypeLabel(sale.paymentType)}
                      </span>
                    </td>
                    <td className="px-6 py-2 text-center">
                      <span className="font-bold text-base text-[#052A3D]">
                        Bs {sale.amountPaid?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-2 text-center">
                      <span className="font-bold text-base text-[#052A3D]">
                        Bs {sale.changeReturned?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-2 text-right">
                      <span className="font-bold text-base text-[#052A3D]">
                        Bs {sale.total.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-2">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setSaleToDelete(sale.id);
                            setAlertOpen(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRow === sale.id && (
                    <tr className="bg-slate-50/70">
                      <td colSpan={9} className="px-6 py-4">
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-1">
                          <div className="flex flex-wrap justify-between items-center  gap-2">
                            <div>
                              <h3 className="font-black text-sm text-[#052A3D] uppercase tracking-wide">
                                Detalle — Pedido #{sale.orderNumber}
                              </h3>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-400 font-medium">
                                Total
                              </p>
                              <span className="font-black text-xl text-[#052A3D]">
                                Bs {sale.total.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
                              <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50/70">
                                  <tr>
                                    <th
                                      scope="col"
                                      className="w-10 px-2 py-3 text-center"
                                    ></th>
                                    <th
                                      scope="col"
                                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-16"
                                    >
                                      Cant.
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                                    >
                                      Producto / Descripción
                                    </th>

                                    <th
                                      scope="col"
                                      className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-32"
                                    >
                                      Precio Unit.
                                    </th>
                                  </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100 bg-white">
                                  {sale.detail
                                    .filter(
                                      (item: any) => item.isCountable !== false,
                                    )
                                    .map((item: any, itemIdx: number) => {
                                      const isModificado =
                                        item.quantity === 0 && item.price === 0;
                                      const tieneDesglose =
                                        item.isPromocion ||
                                        (item.productDetailProduct &&
                                          item.productDetailProduct.length > 0);
                                      const isPromoExpanded =
                                        !!expandedPromos[
                                        `${sale.id}-${itemIdx}`
                                        ];

                                      return (
                                        <Fragment key={itemIdx}>
                                          <tr
                                            className={`transition-colors ${isModificado ? "bg-slate-50/60 italic" : "hover:bg-slate-50/40"}`}
                                          >
                                            <td className="px-2 py-3.5 text-center whitespace-nowrap">
                                              {tieneDesglose &&
                                                !isModificado ? (
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    togglePromo(
                                                      sale.id,
                                                      itemIdx,
                                                    )
                                                  }
                                                  className="p-1 rounded-md hover:bg-slate-200 text-slate-500 transition-colors focus:outline-none"
                                                >
                                                  {isPromoExpanded ? (
                                                    <ChevronDown className="w-4 h-4" />
                                                  ) : (
                                                    <ChevronRight className="w-4 h-4" />
                                                  )}
                                                </button>
                                              ) : (
                                                <div className="w-4 h-4" />
                                              )}
                                            </td>

                                            <td className="px-4 py-3.5 font-medium text-slate-600 font-mono">
                                              {isModificado
                                                ? "-"
                                                : `${item.quantity}x`}
                                            </td>
                                            <td className="px-4 py-3.5">
                                              <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                  <span
                                                    className={`font-medium text-slate-800 ${isModificado ? "line-through text-slate-400" : ""}`}
                                                  >
                                                    {item.name}
                                                  </span>
                                                  {item.isPromocion && (
                                                    <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md font-medium uppercase tracking-wider">
                                                      Promoción
                                                    </span>
                                                  )}
                                                  {!item.isCountable && (
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded font-medium">
                                                      Modificador
                                                    </span>
                                                  )}
                                                </div>

                                                {item.productFittings &&
                                                  item.productFittings.length >
                                                  0 && (
                                                    <p className="text-xs text-slate-400">
                                                      <span className="font-medium text-slate-500">
                                                        Acompañamientos:
                                                      </span>{" "}
                                                      {item.productFittings.join(
                                                        ", ",
                                                      )}
                                                    </p>
                                                  )}

                                                {item.reasonModification && (
                                                  <p className="text-xs text-slate-500">
                                                    <span className="font-medium text-slate-600">
                                                      Nota:
                                                    </span>{" "}
                                                    {item.reasonModification}
                                                  </p>
                                                )}
                                              </div>
                                            </td>

                                            <td className="px-4 py-3.5 text-right font-mono text-slate-600 whitespace-nowrap">
                                              {isModificado
                                                ? "-"
                                                : `Bs ${item.price}`}
                                            </td>
                                          </tr>
                                          {tieneDesglose &&
                                            !isModificado &&
                                            isPromoExpanded && (
                                              <>
                                                {item.productDetailProduct.map(
                                                  (sub: any) => (
                                                    <tr
                                                      key={sub.id}
                                                      className="bg-slate-50/30 border-b border-slate-100/60 last:border-b-2 hover:bg-slate-50 transition-colors"
                                                    >
                                                      <td className="px-2 py-2 text-center text-slate-400 text-xs">
                                                        •
                                                      </td>
                                                      <td className="px-4 py-2 font-mono text-xs font-semibold text-slate-500">
                                                        {sub.quantity}x
                                                      </td>
                                                      <td
                                                        className="px-4 py-2 text-xs"
                                                        colSpan={2}
                                                      >
                                                        <div className="space-y-0.5">
                                                          <div className="flex flex-wrap items-center gap-2">
                                                            <span className="font-medium text-slate-700">
                                                              {sub.name}
                                                            </span>
                                                            {sub.reasonModification && (
                                                              <span
                                                                className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-medium leading-none max-w-[180px] truncate"
                                                                title={
                                                                  sub.reasonModification
                                                                }
                                                              >
                                                                {
                                                                  sub.reasonModification
                                                                }
                                                              </span>
                                                            )}
                                                          </div>
                                                          {sub.ProductFittings &&
                                                            sub.ProductFittings
                                                              .length > 0 && (
                                                              <span className="text-[11px] text-slate-400 block">
                                                                <span className="font-medium text-slate-500">
                                                                  Acompañamientos:
                                                                </span>{" "}
                                                                {sub.ProductFittings.join(
                                                                  ", ",
                                                                )}
                                                              </span>
                                                            )}
                                                        </div>
                                                      </td>
                                                      <td className="px-4 py-2 text-right font-mono text-xs text-slate-600">
                                                        Bs {sub.price}
                                                      </td>
                                                    </tr>
                                                  ),
                                                )}
                                              </>
                                            )}
                                        </Fragment>
                                      );
                                    })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          {filteredSales.length === 0 && (
            <div className="p-10 text-center text-gray-400">
              No se encontraron registros con los filtros aplicados.
            </div>
          )}
        </div>
        {filteredSales.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 text-xs font-medium text-gray-700">
            <div>
              Mostrando{" "}
              <span className="font-bold">{paginatedSales.length}</span> de{" "}
              <span className="font-bold">{filteredSales.length}</span> ventas
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="h-8 px-3"
              >
                Anterior
              </Button>
              <div className="flex items-center px-2 text-sm font-semibold text-[#052A3D]">
                Página {currentPage} de {totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className="h-8 px-3"
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </Card>
      <AlertDialogComponent
        isOpen={alertOpen}
        onClose={() => {
          setAlertOpen(false);
          setSaleToDelete(null);
        }}
        onConfirm={() => {
          if (saleToDelete !== null) {
            deleteSale(saleToDelete).then(loadSales);
            setSaleToDelete(null);
            setAlertOpen(false);
          }
        }}
        variant={AlertVariant.DANGER}
        title="Eliminar venta"
        message="¿Estás seguro de que deseas eliminar esta venta? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
}
