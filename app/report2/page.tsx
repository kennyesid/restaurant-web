"use client";

import { Fragment, useEffect, useState } from "react";
import { getSales, deleteSale, getAllSalesWithDetails, getAllSalesWithDetailsCombo } from "@/services/salesService";
import { Button } from "@/components/ui/button";
import { Sale, User, Product, CartItem } from "@/types";
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
  Pencil,
  X,
  FileSpreadsheet,
  FileText,
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
import { getProducts } from "@/services/productsSservice";
import { useAppDispatch, useAppSelector } from "@/store/store/hooks";
import { startEditSale, toggleCartSide, setToggleCartFalse } from "@/store/store/slices/cartSlice";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "@/components/cart/Shopping-cart";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";

export default function SalesPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isCartSideOpen = useAppSelector((state) => state.cart.isCartOpen);
  const today = DateUtils.obtenerTipoFechaBoliviaLocal();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [filterUser, setFilterUser] = useState("all");
  const [filterPaymentType, setFilterPaymentType] = useState("all");
  const [filterProduct, setFilterProduct] = useState("all");
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
    filterProduct: "all",
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
      const data = await getAllSalesWithDetailsCombo();
      console.log("Ventas cargadas:", JSON.stringify(data));
      handleResponse(data, setSales);
    } catch (error) {
      console.error("Error loading sales:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAll = async () => {
    try {
      const [usersRes, productsRes] =
        await Promise.all([
          getUsers(),
          getProducts(),
        ]);
      setUsers(usersRes || []);
      setProducts(productsRes || []);
    } catch (error) {
      console.error("Error loading sales:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSale = (sale: Sale) => {
    if (!sale.detail) return;

    const cartItems: CartItem[] = sale.detail.map((detailItem: any) => ({
      id: detailItem.productId,
      productId: detailItem.productId,
      name: detailItem.name,
      price: detailItem.price,
      quantity: detailItem.quantity,
      categoryId: detailItem.categoryId,
      imageUrl: detailItem.imageUrl,
      productFittings: detailItem.productFittings || [],
      productDetailProduct: detailItem.productDetailProduct || [],
      cartItemDetail: detailItem.cartItemDetail || [],
      subTotal: detailItem.subTotal,
      modifiedSubtotal: detailItem.modifiedSubtotal,
      reasonModification: detailItem.reasonModification,
      orderTypeSend: detailItem.orderTypeSend,
    }));

    dispatch(
      startEditSale({
        saleId: sale.id,
        items: cartItems,
        paymentType: sale.paymentType as any,
        table: sale.table,
        orderType: sale.orderType,
        userCustomerName: sale.userCustomerName,
        userDocument: sale.userDocument,
        orderNumber: sale.orderNumber,
        amountPaid: sale.amountPaid,
      })
    );

    if (!isCartSideOpen) {
      dispatch(toggleCartSide());
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

      const productMatch =
        filterProduct === "all" ||
        (sale.detail &&
          sale.detail.some((item) => {
            if (item.productId?.toString() === filterProduct) return true;
            if (item.cartItemDetail && item.cartItemDetail.length > 0) {
              return item.cartItemDetail.some((detail: any) => {
                if (detail.productId?.toString() === filterProduct) return true;
                if (detail.productDetailProduct && detail.productDetailProduct.length > 0) {
                  return detail.productDetailProduct.some(
                    (sub: any) => sub.productId?.toString() === filterProduct && sub.selected === true
                  );
                }
                return false;
              });
            }
            if (item.productDetailProduct && item.productDetailProduct.length > 0) {
              return item.productDetailProduct.some(
                (sub: any) => sub.productId?.toString() === filterProduct
              );
            }
            return false;
          }));

      return dateMatch && userMatch && paymentMatch && productMatch;
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
  const qrSales = filteredSales.filter((s) => s.paymentType === "qr");
  const cashSales = filteredSales.filter((s) => s.paymentType === "cash");
  const mixedSales = filteredSales.filter((s) => s.paymentType === "mixed");

  const totalSales = filteredSales.reduce((acc, sale) => acc + sale.total, 0);

  useEffect(() => {
    dispatch(setToggleCartFalse());
  }, []);

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

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();

    // Estilos reutilizables
    const headerFill: ExcelJS.Fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF052A3D" }, // Color #052A3D
    };

    const headerFont: Partial<ExcelJS.Font> = {
      name: "Calibri",
      bold: true,
      color: { argb: "FFFFFFFF" }, // Texto blanco
      size: 11,
    };

    // ----------------------------------------------------
    // HOJA 1: RESUMEN DE VENTAS
    // ----------------------------------------------------
    const wsSales = workbook.addWorksheet("Resumen Ventas");

    wsSales.columns = [
      { header: "Nro. Pedido", key: "orderNumber", width: 15 },
      { header: "Fecha", key: "date", width: 15 },
      { header: "Hora", key: "time", width: 15 },
      { header: "Cliente", key: "client", width: 25 },
      { header: "CI / NIT", key: "document", width: 18 },
      { header: "Tipo de Orden", key: "orderType", width: 18 },
      { header: "Operador", key: "operator", width: 20 },
      { header: "Método de Pago", key: "paymentType", width: 18 },
      { header: "Monto Recibido (Bs)", key: "amountPaid", width: 20 },
      { header: "Cambio (Bs)", key: "changeReturned", width: 15 },
      { header: "Total Venta (Bs)", key: "total", width: 18 },
    ];

    filteredSales.forEach((sale) => {
      wsSales.addRow([
        `#${sale.orderNumber}`,
        new Date(sale.createdAt).toLocaleDateString("es-BO"),
        new Date(sale.createdAt).toLocaleTimeString("es-BO"),
        sale.userCustomerName || "Sin Nombre",
        sale.userDocument || "-",
        sale.orderType,
        sale.userName || "-",
        getPaymentTypeLabel(sale.paymentType),
        sale.amountPaid || 0,
        sale.changeReturned || 0,
        sale.total || 0
      ]);
    });

    // Estilar la fila de cabecera de la Hoja 1
    const headerRowSales = wsSales.getRow(1);
    headerRowSales.eachCell((cell) => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    // ----------------------------------------------------
    // HOJA 2: DETALLE DE PRODUCTOS
    // ----------------------------------------------------
    const itemsDataForExcel: any[] = [];
    filteredSales.forEach((sale) => {
      sale.detail?.forEach((item: any) => {
        if (item.cartItemDetail && item.cartItemDetail.length > 0) {
          item.cartItemDetail.forEach((detail: any) => {
            // Se usa Boolean() para asegurar compatibilidad si 'selected' viene como true/1/"true"
            const selectedSubProducts =
              detail.productDetailProduct?.filter((p: any) => Boolean(p.selected)) || [];

            selectedSubProducts.forEach((sub: any) => {
              itemsDataForExcel.push([
                `#${sale.orderNumber}`,
                new Date(sale.createdAt).toLocaleDateString("es-BO"),
                item.name || "-",
                detail.name || "-",
                sub.name || "-",
                1,
                0,
                0,
              ]);
            });
          });
        } else {
          const qty = item.quantity || 0;
          const price = item.price || 0;

          itemsDataForExcel.push([
            `#${sale.orderNumber}`,
            new Date(sale.createdAt).toLocaleDateString("es-BO"),
            "-",
            "-",
            item.name || "-",
            qty,
            price,
            qty * price,
          ]);
        }
      });
    });

    if (itemsDataForExcel.length > 0) {
      const wsItems = workbook.addWorksheet("Detalle Productos");

      wsItems.columns = [
        { header: "Nro. Pedido", key: "orderNumber", width: 15 },
        { header: "Fecha", key: "date", width: 15 },
        { header: "Producto Combo", key: "comboProduct", width: 25 },
        { header: "Grupo/Plato", key: "groupDish", width: 20 },
        { header: "Producto Seleccionado", key: "selectedProduct", width: 25 },
        { header: "Cant.", key: "quantity", width: 10 },
        { header: "Precio Unit. (Bs)", key: "unitPrice", width: 18 },
        { header: "Subtotal (Bs)", key: "subTotal", width: 18 },
      ];

      itemsDataForExcel.forEach((item) => {
        wsItems.addRow(item);
      });

      // Estilar la fila de cabecera de la Hoja 2
      const headerRowItems = wsItems.getRow(1);
      headerRowItems.eachCell((cell) => {
        cell.fill = headerFill;
        cell.font = headerFont;
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });
    }

    // ----------------------------------------------------
    // GENERAR Y DESCARGAR ARCHIVO EXCEL
    // ----------------------------------------------------
    const buffer = await workbook.xlsx.writeBuffer();
    const dateStr = new Date().toISOString().slice(0, 10);
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `Reporte_Ventas_${dateStr}.xlsx`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  // const exportToExcel = () => {
  //   const salesDataForExcel = filteredSales.map((sale) => {
  //     return {
  //       "Nro. Pedido": `#${sale.orderNumber}`,
  //       "Fecha": new Date(sale.createdAt).toLocaleDateString("es-BO"),
  //       "Hora": new Date(sale.createdAt).toLocaleTimeString("es-BO"),
  //       "Cliente": sale.userCustomerName || "Sin Nombre",
  //       "CI / NIT": sale.userDocument || "-",
  //       "Tipo de Orden": sale.orderType,
  //       "Operador": sale.userName || "-",
  //       "Método de Pago": getPaymentTypeLabel(sale.paymentType),
  //       "Monto Recibido (Bs)": sale.amountPaid || 0,
  //       "Cambio (Bs)": sale.changeReturned || 0,
  //       "Total Venta (Bs)": sale.total,
  //     };
  //   });

  //   const itemsDataForExcel: any[] = [];
  //   filteredSales.forEach((sale) => {
  //     sale.detail?.forEach((item) => {
  //       if (item.cartItemDetail && item.cartItemDetail.length > 0) {
  //         item.cartItemDetail.forEach((detail: any) => {
  //           const selectedSubProducts = detail.productDetailProduct?.filter((p: any) => p.selected === true) || [];
  //           selectedSubProducts.forEach((sub: any) => {
  //             itemsDataForExcel.push({
  //               "Nro. Pedido": `#${sale.orderNumber}`,
  //               "Fecha": new Date(sale.createdAt).toLocaleDateString("es-BO"),
  //               "Producto Combo": item.name,
  //               "Grupo/Plato": detail.name,
  //               "Producto Seleccionado": sub.name,
  //               "Cant.": 1,
  //               "Precio Unit. (Bs)": 0,
  //               "Subtotal (Bs)": 0,
  //             });
  //           });
  //         });
  //       } else {
  //         itemsDataForExcel.push({
  //           "Nro. Pedido": `#${sale.orderNumber}`,
  //           "Fecha": new Date(sale.createdAt).toLocaleDateString("es-BO"),
  //           "Producto Combo": "-",
  //           "Grupo/Plato": "-",
  //           "Producto Seleccionado": item.name,
  //           "Cant.": item.quantity,
  //           "Precio Unit. (Bs)": item.price,
  //           "Subtotal (Bs)": item.quantity * item.price,
  //         });
  //       }
  //     });
  //   });

  //   const wb = XLSX.utils.book_new();
  //   const wsSales = XLSX.utils.json_to_sheet(salesDataForExcel);
  //   XLSX.utils.book_append_sheet(wb, wsSales, "Resumen Ventas");

  //   if (itemsDataForExcel.length > 0) {
  //     const wsItems = XLSX.utils.json_to_sheet(itemsDataForExcel);
  //     XLSX.utils.book_append_sheet(wb, wsItems, "Detalle Productos");
  //   }

  //   const dateStr = new Date().toISOString().slice(0, 10);
  //   XLSX.writeFile(wb, `Reporte_Ventas_${dateStr}.xlsx`);
  // };

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Paleta de Colores
    const primaryColor: [number, number, number] = [5, 42, 61];     // #052A3D
    const accentRed: [number, number, number] = [217, 83, 79];       // #D9534F
    const textColor: [number, number, number] = [51, 65, 85];        // #334155
    const lightBg: [number, number, number] = [248, 250, 252];       // #F8FAFC
    const borderGray: [number, number, number] = [226, 232, 240];    // #E2E8F0

    // ----------------------------------------------------
    // 1. ENCABEZADO Y BANNER
    // ----------------------------------------------------
    // Fondo superior
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 42, "F");

    // Nombre del Restaurante
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("RESTAURANTE YESHUA", 15, 17);

    // Subtítulo
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(114, 178, 208); // Azul claro
    doc.text("Reporte de Control de Ventas", 15, 24);

    // Fecha de Emisión
    doc.setFontSize(8.5);
    doc.setTextColor(209, 226, 235);
    doc.text(`Fecha de Emisión: ${new Date().toLocaleString("es-BO")}`, 15, 30);

    // Badge para el Rango de Fechas
    const startDate = appliedFilters.startDate ? new Date(appliedFilters.startDate).toLocaleDateString("es-BO") : "-";
    const endDate = appliedFilters.endDate ? new Date(appliedFilters.endDate).toLocaleDateString("es-BO") : "-";
    const filterText = `Filtros: Rango del ${startDate} al ${endDate}`;

    doc.setFillColor(255, 255, 255);
    doc.setFillColor(255, 255, 255, 0.15); // Transparencia sutil
    doc.roundedRect(15, 33, doc.getTextWidth(filterText) + 6, 6, 1, 1, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(filterText, 18, 37.2);

    // ----------------------------------------------------
    // 2. TARJETAS DE MÉTRICAS (KPIs)
    // ----------------------------------------------------
    // Card 1: Total Ingresos
    doc.setFillColor(...lightBg);
    doc.setDrawColor(...borderGray);
    doc.roundedRect(15, 48, 87, 24, 2, 2, "FD");

    // Borde acentuado izquierdo rojo para el total
    doc.setFillColor(...accentRed);
    doc.rect(15, 48, 2, 24, "F");

    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("TOTAL INGRESOS", 22, 54);

    doc.setFontSize(16);
    doc.setTextColor(...accentRed);
    doc.text(`Bs. ${(totalSales || 0).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 22, 64);

    // Card 2: Cantidad Transacciones
    doc.setFillColor(...lightBg);
    doc.setDrawColor(...borderGray);
    doc.roundedRect(108, 48, 87, 24, 2, 2, "FD");

    // Borde acentuado izquierdo azul para las ventas
    doc.setFillColor(...primaryColor);
    doc.rect(108, 48, 2, 24, "F");

    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("CANTIDAD TRANSACCIONES", 115, 54);

    doc.setFontSize(16);
    doc.setTextColor(...primaryColor);
    doc.text(`${filteredSales.length} Ventas`, 115, 64);

    // ----------------------------------------------------
    // 3. PREPARACIÓN Y GENERACIÓN DE LA TABLA
    // ----------------------------------------------------
    const headers = [
      ["Pedido", "Fecha / Hora", "Cliente", "Tipo Orden", "Pago", "Total"]
    ];

    const rows = filteredSales.map((sale) => [
      `#${sale.orderNumber}`,
      `${new Date(sale.createdAt).toLocaleDateString("es-BO")} ${new Date(sale.createdAt).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" })}`,
      sale.userCustomerName || "Sin Nombre",
      sale.orderType || "-",
      getPaymentTypeLabel ? getPaymentTypeLabel(sale.paymentType) : sale.paymentType,
      `Bs. ${(sale.total || 0).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ]);

    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 78,
      theme: "striped",
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 8.5,
        fontStyle: "bold",
        halign: "left",
        cellPadding: 3,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: textColor,
        cellPadding: 2.5,
      },
      alternateRowStyles: {
        fillColor: lightBg,
      },
      columnStyles: {
        0: { cellWidth: 20, fontStyle: "bold", textColor: primaryColor },
        1: { cellWidth: 38 },
        2: { cellWidth: 46 },
        3: { cellWidth: 28 },
        4: { cellWidth: 24 },
        5: { cellWidth: 24, halign: "right", fontStyle: "bold" },
      },
      margin: { left: 15, right: 15, bottom: 20 },

      // Pie de página dinámico (Paginación)
      didDrawPage: (data: any) => {
        const totalPages = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Página ${data.pageNumber} de ${totalPages}`,
          195,
          287,
          { align: "right" }
        );
      }
    });

    // ----------------------------------------------------
    // 4. RESUMEN AL FINAL DE LA TABLA
    // ----------------------------------------------------
    const finalY = (doc as any).lastAutoTable.finalY + 6;

    // Si la tabla termina muy abajo, agrega una página para el total
    if (finalY < 270) {
      doc.setFillColor(...lightBg);
      doc.setDrawColor(...borderGray);
      doc.roundedRect(130, finalY, 65, 11, 2, 2, "FD");

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryColor);
      doc.text("TOTAL GENERAL:", 134, finalY + 7);

      doc.setTextColor(...accentRed);
      doc.text(
        `Bs. ${(totalSales || 0).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        191,
        finalY + 7,
        { align: "right" }
      );
    }

    // Descarga del documento
    const dateStr = new Date().toISOString().slice(0, 10);
    doc.save(`Reporte_Ventas_${dateStr}.pdf`);
  };

  // const exportToPDF = () => {
  //   const doc = new jsPDF({
  //     orientation: "portrait",
  //     unit: "mm",
  //     format: "a4",
  //   });

  //   const primaryColor = [5, 42, 61];
  //   const textColor = [51, 51, 51];
  //   const lightGray = [245, 247, 250];

  //   doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  //   doc.rect(0, 0, 210, 40, "F");

  //   doc.setTextColor(255, 255, 255);
  //   doc.setFont("helvetica", "bold");
  //   doc.setFontSize(22);
  //   doc.text("RESTAURANTE YESHUA", 15, 18);

  //   doc.setFont("helvetica", "normal");
  //   doc.setFontSize(12);
  //   doc.text("Reporte de Control de Ventas", 15, 25);
  //   doc.text(`Fecha de Emisión: ${new Date().toLocaleString("es-BO")}`, 15, 31);

  //   doc.setTextColor(220, 220, 220);
  //   doc.setFontSize(9);
  //   doc.text(
  //     `Filtros: Rango del ${new Date(appliedFilters.startDate).toLocaleDateString("es-BO")} al ${new Date(appliedFilters.endDate).toLocaleDateString("es-BO")}`,
  //     15,
  //     37
  //   );

  //   doc.setFillColor(255, 255, 255);
  //   doc.setDrawColor(220, 220, 220);
  //   doc.rect(15, 48, 85, 24);
  //   doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  //   doc.setFont("helvetica", "bold");
  //   doc.setFontSize(10);
  //   doc.text("TOTAL INGRESOS", 20, 54);
  //   doc.setFontSize(18);
  //   doc.setTextColor(217, 83, 79);
  //   doc.text(`Bs. ${totalSales.toLocaleString()}`, 20, 64);

  //   doc.setFillColor(255, 255, 255);
  //   doc.rect(110, 48, 85, 24);
  //   doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  //   doc.setFont("helvetica", "bold");
  //   doc.setFontSize(10);
  //   doc.text("CANTIDAD TRANSACCIONES", 115, 54);
  //   doc.setFontSize(18);
  //   doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  //   doc.text(`${filteredSales.length} Ventas`, 115, 64);

  //   const headers = [
  //     ["Pedido", "Fecha/Hora", "Cliente", "Tipo Orden", "Pago", "Total"]
  //   ];

  //   const rows = filteredSales.map((sale) => [
  //     `#${sale.orderNumber}`,
  //     `${new Date(sale.createdAt).toLocaleDateString("es-BO")} ${new Date(sale.createdAt).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" })}`,
  //     sale.userCustomerName || "Sin Nombre",
  //     sale.orderType || "-",
  //     getPaymentTypeLabel(sale.paymentType),
  //     `Bs. ${sale.total.toLocaleString()}`
  //   ]);

  //   autoTable(doc, {
  //     head: headers,
  //     body: rows,
  //     startY: 80,
  //     theme: "grid",
  //     headStyles: {
  //       fillColor: primaryColor as [number, number, number], // 👈 AÑADIR "as [number, number, number]"
  //       textColor: [255, 255, 255],
  //       fontSize: 9,
  //       fontStyle: "bold",
  //       halign: "left",
  //     },
  //     bodyStyles: {
  //       fontSize: 8,
  //       textColor: textColor as [number, number, number],

  //     },
  //     alternateRowStyles: {
  //       fillColor: lightGray as [number, number, number],

  //     },
  //     columnStyles: {
  //       5: { halign: "right", fontStyle: "bold" },
  //     },
  //     margin: { left: 15, right: 15 },
  //     didDrawPage: (data: any) => {
  //       doc.setFontSize(8);
  //       doc.setTextColor(150, 150, 150);
  //       doc.text(
  //         `Página ${data.pageNumber} de ${doc.getNumberOfPages()}`,
  //         180,
  //         287
  //       );
  //     }
  //   });

  //   const dateStr = new Date().toISOString().slice(0, 10);
  //   doc.save(`Reporte_Ventas_${dateStr}.pdf`);
  // };

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
        title="Reportes"
        subtitle="Reportes de las ventas del sistema"
        action={
          <div className="flex gap-2">
            <div className="w-50">
              <ButtonGeneric
                variant="cancelGray"
                onClick={exportToExcel}
              >
                <div className="flex align-items-center justify-content-center gap-2">
                  <FileSpreadsheet size={18} className="text-success" />
                  <span>Exportar Excel</span>
                </div>
              </ButtonGeneric>
            </div>

            <div className="w-50">
              <ButtonGeneric
                variant="confirmModalPrimary"
                onClick={exportToPDF}
              >
                <div className="flex align-items-center justify-content-center gap-2">
                  <FileText size={18} />
                  <span>Exportar PDF</span>
                </div>
              </ButtonGeneric>
            </div>
          </div>
        }
      />
      <div
        className={cn(
          "grid grid-cols-1 gap-6 transition-all duration-300",
          isCartSideOpen ? "lg:grid-cols-4" : "lg:grid-cols-1",
        )}
      >
        <div
          className={cn(
            "space-y-4 transition-all duration-300",
            isCartSideOpen ? "lg:col-span-3" : "lg:col-span-1",
          )}
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 ">

            <div className="lg:col-span-1">
              <div className="relative overflow-hidden rounded-xl p-4 text-white shadow-xl bg-gradient-to-br from-[#052A3D] via-[#0b3f5c] to-[#052A3D]">
                {/* Efectos decorativos */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-2xl"></div>

                {/* Layout de dos columnas */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2">

                  {/* COLUMNA IZQUIERDA - Desglose por tipo de pago con burbujas */}
                  <div className="space-y-2.5">
                    {/* Total General - solo para mobile */}
                    <div className="md:hidden flex flex-col items-center border-b border-white/10 pb-3 mb-1">
                      <p className="text-xs uppercase tracking-wider opacity-70 flex items-center gap-1">

                        Total Ventas
                      </p>
                      <h2 className="text-2xl font-black text-[#facc15] tracking-tight">
                        Bs {totalSales.toLocaleString()}
                      </h2>
                    </div>

                    {/* Efectivo - Versión simplificada con burbuja */}
                    <div className="bg-white/5 rounded-lg overflow-hidden">
                      <table className="w-full text-center">
                        <tbody>
                          {/* Fila Efectivo */}
                          {/* Fila Efectivo */}
                          <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-1.5 px-2 flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-lg shadow-green-400/50"></div>
                                <span className="text-xs font-medium">Efectivo</span>
                              </div>
                              <span className="bg-green-400/20 text-green-300 font-bold text-xs px-2.5 py-0.5 rounded-full border border-green-400/30 inline-block">
                                {cashSales.length}
                              </span>
                            </td>
                            <td className="py-1.5 px-2 text-xs font-bold text-green-300 whitespace-nowrap text-right">
                              Bs {cashSales.reduce((acc, sale) => acc + sale.total, 0).toLocaleString()}
                            </td>
                          </tr>

                          {/* Fila QR */}
                          <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-1.5 px-2 flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50"></div>
                                <span className="text-xs font-medium">QR</span>
                              </div>
                              <span className="bg-blue-400/20 text-blue-300 font-bold text-xs px-2.5 py-0.5 rounded-full border border-blue-400/30 inline-block">
                                {qrSales.length}
                              </span>
                            </td>
                            <td className="py-1.5 px-2 text-xs font-bold text-blue-300 whitespace-nowrap text-right">
                              Bs {qrSales.reduce((acc, sale) => acc + sale.total, 0).toLocaleString()}
                            </td>
                          </tr>

                          {/* Fila Mixto */}
                          <tr className="hover:bg-white/5 transition-colors">
                            <td className="py-1.5 px-2 flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50"></div>
                                <span className="text-xs font-medium">Mixto</span>
                              </div>
                              <span className="bg-purple-400/20 text-purple-300 font-bold text-xs px-2.5 py-0.5 rounded-full border border-purple-400/30 inline-block">
                                {mixedSales.length}
                              </span>
                            </td>
                            <td className="py-1.5 px-2 text-xs font-bold text-purple-300 whitespace-nowrap text-right">
                              Bs {mixedSales.reduce((acc, sale) => acc + sale.total, 0).toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* COLUMNA DERECHA - Métricas resumen simplificadas */}
                  <div className="flex flex-col justify-between">
                    {/* Total General - Desktop */}
                    <div className="hidden md:flex flex-col items-center ">
                      <p className="text-xs uppercase tracking-wider opacity-70 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block"></span>
                        Total Ventas
                      </p>
                      <h2 className="text-3xl font-black text-[#facc15] tracking-tight">
                        Bs {totalSales.toLocaleString()}
                      </h2>
                    </div>

                    {/* Solo Cantidad - Quitamos Venta Máxima */}
                    <div className="space-y-2">

                      <p className="text-[9px] uppercase opacity-60 tracking-wider flex items-center justify-center gap-1.5">
                        Cantidad de Ventas
                      </p>
                      <p className="text-2xl font-bold text-white flex items-center justify-center ">
                        {filteredSales.length}
                      </p>

                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-3 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Usuario</label>
                  <select
                    value={filterUser}
                    onChange={(e) => setFilterUser(e.target.value)}
                    className="w-full border rounded-md p-2 text-sm"
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
                    className="w-full border rounded-md p-2 text-sm"
                  >
                    <option value="all">Todos</option>
                    {uniquePaymentTypes.map((type) => (
                      <option key={type} value={type}>
                        {getPaymentTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Filtrar por Producto</label>
                  <select
                    value={filterProduct}
                    onChange={(e) => setFilterProduct(e.target.value)}
                    className="w-full border rounded-md p-2 text-sm"
                  >
                    <option value="all">Todos los productos</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id.toString()}>
                        {p.name}
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
                    className="w-full border rounded-md p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Fecha fin</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border rounded-md p-2 text-sm"
                  />
                </div>
                <ButtonGeneric
                  variant="primaryRed"
                  onClick={() => {
                    setFilterUser("all");
                    setFilterPaymentType("all");
                    setFilterProduct("all");
                    setCurrentPage(1);
                    setAppliedFilters({
                      startDate: startDate,
                      endDate: endDate,
                      filterUser: "all",
                      filterPaymentType: "all",
                      filterProduct: "all",
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
                    <th className="px-6 py-3 font-semibold text-center">Total</th>
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
                            {/* <span className="text-[10px] text-muted-foreground font-mono">
                          ID Venta: {sale.id}
                        </span> */}
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
                        <td className="px-6 py-2">
                          {(sale.amountPaid ?? 0) > 0 ? (
                            <div className="flex flex-col items-center">
                              <span className="text-base font-black text-[#052A3D]">
                                Bs {sale.total.toLocaleString()}
                              </span>
                              <div className="text-[11px] font-medium text-[#052A3D] mt-0.5">
                                {(sale.amountPaid ?? 0).toLocaleString()} - {(sale.total.toLocaleString() ?? 0).toLocaleString()} = {(sale.changeReturned ?? 0).toLocaleString()}
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <span className="text-base font-black text-[#052A3D]">
                                Bs {sale.total.toLocaleString()}
                              </span>
                            </div>
                          )}
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
                            {/* <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleEditSale(sale)}
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button> */}
                          </div>
                        </td>
                      </tr>
                      {expandedRow === sale.id && (
                        <tr className="bg-slate-50/70">
                          <td colSpan={11} className="px-6 py-4">
                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
                              <div className="flex flex-wrap justify-between items-center gap-4">
                                <div>
                                  <h3 className="font-black text-sm text-[#052A3D] uppercase tracking-wide">
                                    Detalle — Pedido #{sale.orderNumber}
                                  </h3>
                                </div>
                                <div className="flex flex-wrap items-center gap-6 text-right">
                                  <div>
                                    <p className="text-xs text-gray-400 font-medium">Total</p>
                                    <span className="font-black text-xl text-[#052A3D]">Bs {sale.total.toLocaleString()}</span>
                                  </div>
                                  {(sale.amountPaid ?? 0) > 0 && (
                                    <div>
                                      <p className="text-xs text-gray-400 font-medium">Monto Recibido</p>
                                      <span className="font-bold text-sm text-slate-600 font-mono">Bs {(sale.amountPaid ?? 0).toLocaleString()}</span>
                                    </div>
                                  )}
                                  {(sale.changeReturned ?? 0) > 0 && (
                                    <div>
                                      <p className="text-xs text-gray-400 font-medium">Cambio Entregado</p>
                                      <span className="font-bold text-sm text-slate-600 font-mono">Bs {(sale.changeReturned ?? 0).toLocaleString()}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
                                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                                    <thead className="bg-slate-50/70">
                                      <tr>
                                        <th scope="col" className="w-10 px-2 py-3 text-center"></th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">Cant.</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Producto / Descripción</th>
                                        <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Precio Unit.</th>
                                      </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100 bg-white">
                                      {sale.detail
                                        .filter((item: any) => true)
                                        .map((item: any, itemIdx: number) => {
                                          const isModificado = item.quantity === 0 && item.price === 0;
                                          const tieneDesglose =
                                            item.isPromocion ||
                                            (item.productDetailProduct && item.productDetailProduct.length > 0) ||
                                            (item.cartItemDetail && item.cartItemDetail.length > 0);
                                          const isPromoExpanded = !!expandedPromos[`${sale.id}-${itemIdx}`];

                                          return (
                                            <Fragment key={itemIdx}>
                                              <tr className={`transition-colors ${isModificado ? "bg-slate-50/60 italic" : "hover:bg-slate-50/40"}`}>
                                                <td className="px-2 py-3.5 text-center whitespace-nowrap">
                                                  {tieneDesglose && !isModificado ? (
                                                    <button
                                                      type="button"
                                                      onClick={() => togglePromo(sale.id, itemIdx)}
                                                      className="p-1 rounded-md hover:bg-slate-200 text-slate-500 transition-colors focus:outline-none"
                                                    >
                                                      {isPromoExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                    </button>
                                                  ) : (
                                                    <div className="w-4 h-4" />
                                                  )}
                                                </td>
                                                <td className="px-4 py-3.5 font-medium text-slate-600 font-mono">
                                                  {isModificado ? "-" : `${item.quantity}x`}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                  <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                      <span className={`font-medium text-slate-800 ${isModificado ? "line-through text-slate-400" : ""}`}>
                                                        {item.name}
                                                      </span>
                                                    </div>
                                                    {item.productFittings && item.productFittings.length > 0 && (
                                                      <p className="text-xs text-slate-400">
                                                        <span className="font-medium text-slate-500 font-sans">Acompañamientos:</span> {item.productFittings.join(", ")}
                                                      </p>
                                                    )}
                                                    {item.reasonModification && (
                                                      <p className="text-xs text-slate-500">
                                                        <span className="font-medium text-slate-600">Nota:</span> {item.reasonModification}
                                                      </p>
                                                    )}
                                                  </div>
                                                </td>
                                                <td className="px-4 py-3.5 text-right font-mono text-slate-600 whitespace-nowrap">
                                                  {isModificado ? "-" : `Bs ${item.price}`}
                                                </td>
                                              </tr>
                                              {tieneDesglose && !isModificado && isPromoExpanded && (
                                                <>
                                                  {/* 1. Mapeo de combos / menús estructurados por platos (cartItemDetail) */}
                                                  {item.cartItemDetail && item.cartItemDetail.length > 0 && (
                                                    <>
                                                      {item.cartItemDetail.map((detail: any, dIdx: number) => {
                                                        const selectedSubProducts = detail.productDetailProduct?.filter((p: any) => p.selected === true) || [];
                                                        return (
                                                          <tr key={`cid-${detail.id}-${dIdx}`} className="bg-slate-50/20 border-b border-slate-100 last:border-b-2 hover:bg-slate-50 transition-colors">
                                                            <td className="px-2 py-2 text-center text-slate-400 text-xs">↳</td>
                                                            <td className="px-4 py-2 font-mono text-xs font-semibold text-slate-500">
                                                              {detail.quantity}x
                                                            </td>
                                                            <td className="px-4 py-2 text-xs" colSpan={2}>
                                                              <div className="space-y-1">
                                                                <span className="font-semibold text-slate-700 block">{detail.name}</span>
                                                                {selectedSubProducts.length > 0 && (
                                                                  <div className="pl-3 border-l-2 border-slate-200 space-y-0.5 mt-1">
                                                                    {selectedSubProducts.map((p: any) => (
                                                                      <div key={p.id} className="flex items-center gap-2 text-[11px] text-slate-600">
                                                                        <span>• {p.name}</span>
                                                                        {detail?.orderTypeSend && (
                                                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-orange-100 text-orange-700 border border-orange-200 leading-none">
                                                                            {detail.orderTypeSend}
                                                                          </span>
                                                                        )}
                                                                      </div>
                                                                    ))}
                                                                  </div>
                                                                )}
                                                                {detail.reasonModification && (
                                                                  <p className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100/50 inline-block mt-1">
                                                                    Nota: {detail.reasonModification}
                                                                  </p>
                                                                )}
                                                              </div>
                                                            </td>
                                                          </tr>
                                                        );
                                                      })}
                                                    </>
                                                  )}

                                                  {/* 2. Mapeo de promociones directas / desgloses sin cartItemDetail */}
                                                  {(!item.cartItemDetail || item.cartItemDetail.length === 0) && item.productDetailProduct && item.productDetailProduct.length > 0 && (
                                                    <>
                                                      {item.productDetailProduct.map((sub: any) => (
                                                        <tr key={sub.id} className="bg-slate-50/30 border-b border-slate-100/60 last:border-b-2 hover:bg-slate-50 transition-colors">
                                                          <td className="px-2 py-2 text-center text-slate-400 text-xs">•</td>
                                                          <td className="px-4 py-2 font-mono text-xs font-semibold text-slate-500">
                                                            {sub.quantity || 1}x
                                                          </td>
                                                          <td className="px-4 py-2 text-xs" colSpan={2}>
                                                            <div className="space-y-0.5">
                                                              <div className="flex flex-wrap items-center gap-2">
                                                                <span className="font-medium text-slate-700">{sub.name}</span>
                                                                {sub.reasonModification && (
                                                                  <span
                                                                    className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-medium leading-none max-w-[180px] truncate"
                                                                    title={sub.reasonModification}
                                                                  >
                                                                    {sub.reasonModification}
                                                                  </span>
                                                                )}
                                                              </div>
                                                              {sub.ProductFittings && sub.ProductFittings.length > 0 && (
                                                                <span className="text-[11px] text-slate-400 block font-sans">
                                                                  <span className="font-medium text-slate-500">Acompañamientos:</span> {sub.ProductFittings.join(", ")}
                                                                </span>
                                                              )}
                                                            </div>
                                                          </td>
                                                        </tr>
                                                      ))}
                                                    </>
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
            {
              filteredSales.length > 0 && (
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
              )
            }
          </Card >
        </div>

        {isCartSideOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
              onClick={() => dispatch(toggleCartSide())}
            />
            <div
              className={cn(
                "fixed top-0 right-0 h-full w-full max-w-md bg-card z-50 p-4 shadow-2xl flex flex-col justify-between",
                "animate-in slide-in-from-right duration-300",
                "lg:static lg:h-auto lg:w-auto lg:max-w-none lg:z-0 lg:p-0 lg:shadow-none lg:bg-transparent lg:col-span-1",
              )}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b lg:hidden">
                <span className="font-bold text-lg text-rest-primary">
                  Pedido Actual
                </span>
                <button
                  onClick={() => dispatch(toggleCartSide())}
                  className="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="h-[calc(100vh-120px)] lg:h-[calc(100vh-170px)] overflow-y-auto border rounded-xl shadow-sm bg-card">
                <ShoppingCart />
              </div>
            </div>
          </>
        )}
      </div>

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
