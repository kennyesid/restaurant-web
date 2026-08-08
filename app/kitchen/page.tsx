"use client";

import { useEffect, useState, useRef } from "react";
import { getSalesInKitchen, updateSaleOrderStatus, getSaleWithDetailsById, getSalesInKitchenGrouped, getAllSalesWithDetailsComboChef, transformKitchenOrders, transformKitchenPreparation, getAllSalesWithDetailsComboChefById } from "@/services/salesService";
import { KitchenPreparationGroup, Sale, ToastType } from "@/types";
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
import PageHeader from "@/components/page/header/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import ButtonGeneric from "@/components/common/button/ButtonGeneric";

export default function KitchenPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingIds, setUpdatingIds] = useState<Record<number, boolean>>({});
  const [now, setNow] = useState(new Date());
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [preparation, setPreparation] = useState<KitchenPreparationGroup[]>([]);

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
      const response = await getAllSalesWithDetailsComboChef();
      setSales(response?.contenido ?? []);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
      toast.error("Ocurrió un error al cargar la cola de cocina");
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const pendingReloads = useRef<Map<number, NodeJS.Timeout>>(new Map());

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
          // console.log("Realtime payload:", payload);
          const { eventType, new: newRow, old: oldRow } = payload;
          const currentGroupId = configService.getGroupId();
          if ((eventType === "INSERT" || eventType === "UPDATE") && newRow.orderStatus === 2 && newRow.state === true) {
            // Check if matches active groupId
            if (newRow.groupId !== currentGroupId) return;
            const saleId = newRow.id;
            // Si ya había una espera para esta venta la cancelamos
            const existingTimeout = pendingReloads.current.get(saleId);
            if (existingTimeout) {
              clearTimeout(existingTimeout);
            }
            const timeout = setTimeout(async () => {
              const detailRes = await getAllSalesWithDetailsComboChefById(saleId);
              if (detailRes.codigo === 200 && detailRes.contenido) {
                const fullSale = detailRes.contenido;
                setSales(prevSales => {
                  const exists = prevSales.some(s => s.id === fullSale.id);
                  if (exists) {
                    return prevSales.map(s =>
                      s.id === fullSale.id
                        ? fullSale
                        : s
                    );
                  }
                  playNotificationSound();
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
                });
              }
              pendingReloads.current.delete(saleId);
            }, 6000);
            pendingReloads.current.set(saleId, timeout);
          }
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
    if (diffMins < 60) return `${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m`;
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

  const toggleItem = (idx: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel de Cocina"
        subtitle="Monitoreo y despacho de pedidos en tiempo real"
        action={
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
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
        }
      />

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sales.map((sale) => {
            const isTable = sale.orderType?.toUpperCase() === "PARA MESA";

            return (
              <div
                key={sale.id}
                className={`flex flex-col rounded-2xl border-2 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${isTable
                  ? "bg-[#052a3d] text-slate-100 border-[#031d2b]"
                  : "bg-white text-slate-900 border-slate-200"
                  }`}
              >
                {/* CARD HEADER */}
                <div
                  className={`p-4 border-b space-y-3 ${isTable
                    ? "bg-[#031d2a]/60 border-slate-700/50"
                    : "bg-slate-50 border-slate-200"
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-3xl font-black tracking-tight ${isTable ? "text-white" : "text-slate-950"
                          }`}
                      >
                        #{sale.orderNumber}
                      </span>
                      <span className="font-bold">{sale.userCustomerName || ""}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-xs ${isTable
                          ? "bg-sky-500/20 text-sky-300 border-sky-400/30"
                          : "bg-slate-900 text-white border-slate-900"
                          }`}
                      >
                        {sale.orderType || "SIN TIPO"}
                      </span>
                    </div>

                    {/* Time Counter Badge */}
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${isTable
                        ? "bg-slate-900/80 text-sky-200 border-slate-700"
                        : "bg-slate-900 text-white border-slate-950"
                        }`}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      <span>{getElapsedTimeStr(sale.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* TABS CON DISEÑO Y VIDA */}
                <Tabs defaultValue="preparacion" className="flex-1 flex flex-col">
                  <div className="px-3 pt-3">
                    <TabsList
                      className={`grid w-full grid-cols-2 p-1.5 rounded-xl shadow-inner ${isTable
                        ? "bg-slate-950/60 border border-slate-800"
                        : "bg-slate-100 border border-slate-200"
                        }`}
                    >
                      <TabsTrigger
                        value="pedido"
                        className={`rounded-lg py-2 text-sm font-extrabold transition-all duration-200 ${isTable
                          ? "text-slate-400 data-[state=active]:bg-sky-500 data-[state=active]:text-white data-[state=active]:shadow-md"
                          : "text-slate-700 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-md"
                          }`}
                      >Pedido
                      </TabsTrigger>

                      <TabsTrigger
                        value="preparacion"
                        className={`rounded-lg py-2 text-sm font-extrabold transition-all duration-200 ${isTable
                          ? "text-slate-400 data-[state=active]:bg-sky-500 data-[state=active]:text-white data-[state=active]:shadow-md"
                          : "text-slate-700 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-md"
                          }`}
                      >Preparación
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* ================= PEDIDO ================= */}
                  <TabsContent value="pedido" className="m-0 flex-1">
                    <div
                      className={`p-5 space-y-4 divide-y-2 max-h-[480px] overflow-y-auto ${isTable ? "divide-slate-800/80" : "divide-yellow-600/30"
                        }`}
                    >
                      {sale.detail?.map((item) => {
                        const isCombo =
                          item.cartItemDetail && item.cartItemDetail.length > 0;

                        if (!isCombo) {
                          return (
                            <div
                              key={item.id}
                              className="flex items-start gap-2.5 pt-3 first:pt-0"
                            >
                              <span
                                className={`inline-flex items-center justify-center font-black text-xs rounded-md px-2 py-0.5 min-w-[26px] h-6 mt-0.5 shadow-sm ${isTable
                                  ? "bg-sky-500 text-white"
                                  : "bg-slate-900 text-white"
                                  }`}
                              >
                                {item.quantity}x
                              </span>

                              <div className="flex-1">
                                <p className="font-bold text-sm tracking-tight">
                                  {item.name}
                                </p>

                                {(item.productFittings?.length ?? 0) > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {item.productFittings?.map((fit, idx) => (
                                      <span
                                        key={idx}
                                        className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border ${isTable
                                          ? "bg-slate-900/80 text-sky-300 border-slate-700"
                                          : "bg-slate-100 text-slate-800 border-slate-300"
                                          }`}
                                      >
                                        {typeof fit === "string"
                                          ? fit
                                          : (fit as any).name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={item.id} className="pt-3 first:pt-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center justify-center font-black text-lg rounded-md px-2 py-0.5 min-w-[26px] h-6 shadow-sm ${isTable
                                  ? "bg-sky-500 text-white"
                                  : "bg-slate-950 text-yellow-400"
                                  }`}
                              >
                                {item.quantity}x
                              </span>

                              <span className="font-extrabold text-lg uppercase tracking-wide">
                                {item.name}
                              </span>
                            </div>

                            <div className="ml-7 mt-2 space-y-2.5">
                              {item.cartItemDetail?.map((plate, index) => (
                                <div
                                  key={plate.id}
                                  className={`border-l-2 pl-3 ${isTable ? "border-sky-500/60" : "border-slate-950/60"
                                    }`}
                                >
                                  <div
                                    className={`font-bold text-lg uppercase ${isTable ? "text-sky-300" : "text-slate-900"
                                      }`}
                                  >
                                    {plate.name}
                                    {plate.reasonModification &&
                                      ` (${plate.reasonModification})`}
                                  </div>

                                  <div className="mt-1 space-y-1">
                                    {plate.productDetailProduct?.map((product) => (
                                      <div
                                        key={product.id}
                                        className="flex gap-2 text-lg font-medium"
                                      >
                                        <span
                                          className={
                                            isTable ? "text-sky-400" : "text-slate-950"
                                          }
                                        >
                                          •
                                        </span>
                                        <span>{product.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>

                  {/* ================= PREPARACION ================= */}
                  <TabsContent value="preparacion" className="m-0 flex-1">
                    <div className="p-5 space-y-2 max-h-[480px] overflow-y-auto">
                      {transformKitchenPreparation([sale]).map((group, index) => (
                        <div
                          key={index}
                          className={`rounded-xl border p-3 shadow-xs ${isTable
                            ? "bg-slate-900/60 border-slate-700/60 text-white"
                            : "bg-slate-50 border-slate-200 text-slate-900"
                            }`}
                        >
                          <div
                            className={`font-black text-lg uppercase tracking-wider ${isTable ? "text-sky-400" : "text-slate-950"
                              }`}
                          >
                            {group.orderTypeSend == "PARA_LLEVAR" ? "Para Llevar" : "Para Mesa"}
                            {group.reasons.map((onlyreason) => (
                              onlyreason.reasonModification && (
                                <span
                                  key={onlyreason.reasonModification ?? null}
                                  className={`text-lg font-bold italic ${isTable ? "text-slate-400" : "text-slate-800"
                                    }`}
                                >
                                  {` - ${onlyreason.reasonModification ?? null}`}
                                </span>
                              )))}
                          </div>

                          {group.reasons.map((reason) => (
                            <div
                              key={reason.reasonModification ?? null}
                              className="mt-2"
                            >
                              <div className="mt-1.5 space-y-1">
                                {reason.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex gap-2 text-lg font-semibold"
                                  >
                                    <span
                                      className={`font-black ${isTable ? "text-sky-400" : "text-slate-950"
                                        }`}
                                    >
                                      {item.quantity}x
                                    </span>
                                    <span>{item.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* FOOTER */}
                <div
                  className={`p-4 border-t mt-auto ${isTable
                    ? "bg-[#031d2a]/80 border-slate-800"
                    : "bg-slate-50 border-slate-200"
                    }`}
                >
                  {/* <button
                    onClick={() => handleAcceptOrder(sale.id, sale.orderNumber)}
                    disabled={updatingIds[sale.id]}
                    className={`w-full inline-flex items-center justify-center gap-2.5 font-black py-3.5 px-5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-sm cursor-pointer ${isTable
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                      : "bg-slate-950 hover:bg-slate-800 text-yellow-400"
                      }`}
                  >
                    {updatingIds[sale.id] ? (
                      <>
                        <div
                          className={`animate-spin rounded-full h-4 w-4 border-2 border-t-transparent ${isTable ? "border-slate-950" : "border-yellow-400"
                            }`}
                        />
                        <span>Despachando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
                        <span>Listo / Despachar</span>
                      </>
                    )}
                  </button> */}
                  <ButtonGeneric
                    onClick={() => handleAcceptOrder(sale.id, sale.orderNumber)}
                    disabled={updatingIds[sale.id]}
                    variant={isTable ? "cancelGray" : "primary"}
                  >
                    Listo / Despachar
                  </ButtonGeneric>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
