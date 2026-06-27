"use client";

import { useEffect, useState, useRef } from "react";
import { getSalesInKitchen, updateSaleOrderStatus, getSaleWithDetailsById } from "@/services/salesService";
import { Sale, ToastType } from "@/types";
import { supabase } from "@/lib/dataBase/supabaseClient";
import { toast } from "sonner";
import { CustomNotification } from "@/components/common/toast/CustomNotification";
import { configService } from "@/services/configService";
import {
  ChefHat,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle2,
  User,
  UtensilsCrossed
} from "lucide-react";

export default function KitchenPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingIds, setUpdatingIds] = useState<Record<number, boolean>>({});
  const [now, setNow] = useState(new Date());

  // Realtime connection status
  const [realtimeStatus, setRealtimeStatus] = useState<"connected" | "disconnected" | "connecting">("connecting");

  // Mute preference
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("kitchen_muted") === "true";
    }
    return false;
  });

  // Ref to keep latest mute state for the realtime event handler
  const isMutedRef = useRef(isMuted);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Persist mute state
  const toggleMute = () => {
    setIsMuted((prev) => {
      const newVal = !prev;
      localStorage.setItem("kitchen_muted", String(newVal));
      return newVal;
    });
  };

  // Play notification chime using standard Web Audio API (cross-browser beep alert)
  const playNotificationSound = () => {
    if (isMutedRef.current) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      // Chime first beep (Frequency D5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain1.gain.setValueAtTime(0.08, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.12);

      // Chime second beep (higher tone, Frequency A5)
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(880, ctx.currentTime);
        gain2.gain.setValueAtTime(0.08, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.22);
      }, 120);
    } catch (e) {
      console.warn("AudioContext failed to initialize (browser autoplay restrictions may apply):", e);
    }
  };

  // Load active orders (with orderStatus = 2)
  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await getSalesInKitchen();
      if (res.codigo === 200 && res.contenido) {
        setSales(res.contenido);
      } else {
        toast.error(res.mensaje || "Error al cargar pedidos");
      }
    } catch (error) {
      console.error("Error cargando pedidos:", error);
      toast.error("Ocurrió un error al cargar la cola de cocina");
    } finally {
      setLoading(false);
    }
  };

  // Accept/Complete order (transition status to 3 = LISTO)
  const handleAcceptOrder = async (saleId: number, orderNumber: number) => {
    try {
      setUpdatingIds(prev => ({ ...prev, [saleId]: true }));
      const res = await updateSaleOrderStatus(saleId, 3);
      if (res.codigo === 200) {
        toast.success(`Pedido #${orderNumber} marcado como LISTO`);
        setSales(prev => prev.filter(s => s.id !== saleId));
      } else {
        toast.error(res.mensaje || "No se pudo actualizar el pedido");
      }
    } catch (error) {
      console.error("Error actualizando orden:", error);
      toast.error("Error al completar el pedido");
    } finally {
      setUpdatingIds(prev => ({ ...prev, [saleId]: false }));
    }
  };

  // Clock tick to refresh "elapsed time" counter on cards every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Realtime subscription setup
  useEffect(() => {
    let isMounted = true;

    loadOrders();

    const channel = supabase
      .channel("kitchen-sales-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sales",
        },
        async (payload: any) => {
          if (!isMounted) return;
          console.log("Realtime payload:", payload);
          const { eventType, new: newRow, old: oldRow } = payload;
          const currentGroupId = configService.getGroupId();

          if ((eventType === "INSERT" || eventType === "UPDATE") && newRow.orderStatus === 2 && newRow.state === true) {
            // Check if matches active groupId
            if (newRow.groupId !== currentGroupId) return;

            // Fetch details
            const detailRes = await getSaleWithDetailsById(newRow.id);
            if (detailRes.codigo === 200 && detailRes.contenido) {
              const fullSale = detailRes.contenido;
              setSales(prevSales => {
                const exists = prevSales.some(s => s.id === fullSale.id);
                if (exists) {
                  return prevSales.map(s => s.id === fullSale.id ? fullSale : s);
                } else {
                  // New order! Play chime
                  playNotificationSound();

                  // Show custom toast alert
                  toast.custom((t) => (
                    <CustomNotification
                      t={t}
                      body={{
                        type: ToastType.Successfully,
                        message: "Nueva Solicitud",
                        description: `Pedido #${fullSale.orderNumber} por ${fullSale.userName || "Cliente"}`
                      }}
                    />
                  ));

                  return [...prevSales, fullSale];
                }
              });
            }
          }
          // Remove order if status changed to something else (e.g. 3) or logically deleted
          else if (eventType === "UPDATE" || eventType === "DELETE") {
            const targetId = eventType === "DELETE" ? oldRow.id : newRow.id;
            if (eventType === "DELETE" || newRow.orderStatus !== 2 || newRow.state === false) {
              setSales(prevSales => prevSales.filter(s => s.id !== targetId));
            }
          }
        }
      )
      .subscribe((status) => {
        console.log(`Realtime channel status: ${status}`);
        if (status === "SUBSCRIBED") {
          setRealtimeStatus("connected");
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          setRealtimeStatus("disconnected");
        } else {
          setRealtimeStatus("connecting");
        }
      });

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const getElapsedTimeStr = (createdAtStr: string | Date) => {
    const diffMs = now.getTime() - new Date(createdAtStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Recién llegado";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    return `Hace ${diffHours}h ${diffMins % 60}m`;
  };

  const getElapsedBadgeClass = (createdAtStr: string | Date) => {
    const diffMs = now.getTime() - new Date(createdAtStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins >= 15) {
      return "bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/40 animate-pulse";
    }
    if (diffMins >= 8) {
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900/40";
    }
    return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/60";
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card p-6 rounded-xl border border-border shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-lg border border-primary/20">
            <ChefHat className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Panel de Cocina</h1>
            <p className="text-sm text-muted-foreground">Monitoreo y despacho de pedidos en tiempo real</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Connection Status Badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${realtimeStatus === "connected"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
              : realtimeStatus === "connecting"
                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30 animate-pulse"
                : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30"
            }`}>
            {realtimeStatus === "connected" ? (
              <>
                <Wifi className="h-3.5 w-3.5" />
                <span>Tiempo Real</span>
              </>
            ) : realtimeStatus === "connecting" ? (
              <>
                <Wifi className="h-3.5 w-3.5 animate-spin" />
                <span>Conectando...</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5" />
                <span>Desconectado</span>
              </>
            )}
          </div>

          {/* Sound Toggle Button */}
          <button
            onClick={toggleMute}
            className={`inline-flex items-center justify-center p-2 rounded-lg border transition shadow-sm cursor-pointer ${isMuted
                ? "bg-slate-50 border-border text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
                : "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
              }`}
            title={isMuted ? "Activar Sonido" : "Silenciar"}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>

          {/* Pending Orders Count Badge */}
          <div className="inline-flex items-center gap-2 bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900 px-4 py-1.5 rounded-lg text-sm font-semibold shadow-sm">
            <span>Pendientes</span>
            <span className="bg-primary text-primary-foreground dark:bg-secondary/15 dark:text-secondary px-2 py-0.5 rounded text-xs font-bold">
              {sales.length}
            </span>
          </div>
        </div>
      </div>

      {/* ORDERS GRID AREA */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="relative flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <ChefHat className="h-5 w-5 absolute text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground animate-pulse font-medium text-sm">Cargando pedidos pendientes...</p>
        </div>
      ) : sales.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-card rounded-xl border border-border border-dashed py-20">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-full text-slate-400 dark:text-slate-600 mb-4 border border-border">
            <UtensilsCrossed className="h-10 w-10 stroke-1" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Cocina al día</h3>
          <p className="text-muted-foreground text-sm max-w-sm mt-1">
            No hay solicitudes de pedidos pendientes. Los nuevos pedidos aparecerán aquí automáticamente en tiempo real.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sales.map((sale) => {
            const isTable = sale.orderType?.toUpperCase() === "PARA MESA";

            return (
              <div
                key={sale.id}
                className="flex flex-col bg-card rounded-xl border border-border shadow-sm overflow-hidden hover:shadow-md transition duration-200"
              >
                {/* CARD HEADER */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-b border-border space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-extrabold text-foreground tracking-tight">
                        #{sale.orderNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${isTable
                          ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30"
                          : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
                        }`}>
                        {sale.orderType || "SIN TIPO"}
                      </span>
                    </div>
                    {/* Time Counter Badge */}
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getElapsedBadgeClass(sale.createdAt)}`}>
                      <Clock className="h-3.5 w-3.5" />
                      <span>{getElapsedTimeStr(sale.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-semibold">{sale.userName || "Cliente"}</span>
                    {sale.userCustomerName && (
                      <span className="text-xs text-muted-foreground">
                        ({sale.userCustomerName})
                      </span>
                    )}
                  </div>
                </div>

                {/* CARD BODY: ITEMS LIST */}
                <div className="p-4 flex-1 space-y-3 divide-y divide-border/60 max-h-[350px] overflow-y-auto">
                  {sale.detail?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-2.5 pt-3 first:pt-0"
                    >
                      <span className="inline-flex items-center justify-center font-bold text-xs bg-primary/10 text-primary border border-primary/20 rounded px-1.5 py-0.5 min-w-[24px] h-6 mt-0.5">
                        {item.quantity}x
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm break-words">
                          {item.name}
                        </p>

                        {/* Main Product Fittings */}
                        {item.productFittings && item.productFittings.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.productFittings.map((fit, idx) => (
                              <span
                                key={idx}
                                className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] px-1 rounded"
                              >
                                {typeof fit === "string" ? fit : (fit as any)?.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Nested SubDetails (productDetailProduct) */}
                        {item.productDetailProduct && item.productDetailProduct.length > 0 && (
                          <div className="mt-2 pl-3 border-l-2 border-slate-200 dark:border-slate-700 space-y-1.5">
                            {item.productDetailProduct.map((subItem) => (
                              <div key={subItem.id} className="text-xs text-slate-600 dark:text-slate-400">
                                <div className="flex items-start gap-1 flex-wrap">
                                  <span className="font-bold text-[10px] text-slate-500 mt-0.5">
                                    {subItem.quantity}x
                                  </span>
                                  <span className="font-medium text-foreground dark:text-slate-200">
                                    {subItem.name}
                                  </span>
                                  {subItem.reasonModification && (
                                    <span className="inline-block bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 text-[9px] px-1 rounded border border-amber-100 dark:border-amber-900/30 uppercase font-bold">
                                      {subItem.reasonModification}
                                    </span>
                                  )}
                                </div>

                                {/* Sub Fittings */}
                                {subItem.productFittings && subItem.productFittings.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-0.5 pl-3 text-[10px] text-slate-500">
                                    {subItem.productFittings.map((fit, idx) => (
                                      <span key={idx}>+ {fit}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* CARD FOOTER */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/20 border-t border-border mt-auto">
                  <button
                    onClick={() => handleAcceptOrder(sale.id, sale.orderNumber)}
                    disabled={updatingIds[sale.id]}
                    className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed text-sm cursor-pointer"
                  >
                    {updatingIds[sale.id] ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Despachando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Listo / Despachar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
