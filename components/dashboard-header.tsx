"use client";

import { useAppDispatch, useAppSelector } from "@/store/store/hooks";
import { useEffect, useState } from "react";
import { getUsername } from "@/lib/auth";
import { ShoppingCart } from "lucide-react";
import { shallowEqual } from "react-redux";
import { toggleCartSide } from "@/store/store/slices/cartSlice";

export function DashboardHeader() {
  // const isDark = useAppSelector((state) => state.theme.isDark);
  // const { items } = useAppSelector((state) => state.cart);

  const { isDark, items } = useAppSelector(
    (state) => ({
      isDark: state.theme.isDark,
      items: state.cart.items,
    }),
    shallowEqual,
  );
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState<string | null>(null);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const userInitial = username ? username.charAt(0).toUpperCase() : "U";

  useEffect(() => {
    setUsername(getUsername() || "User");
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <header className="fixed top-0 left-0 right-0 z-20 bg-card border-b border-border h-16 flex items-center justify-between px-6 lg:pl-72">
      <div className="pl-12 lg:pl-0 flex flex-col items-start justify-center">
        <h2 className="text-base sm:text-lg font-black tracking-tight text-foreground leading-none sm:leading-tight">
          Yeshua{" "}
          <span className="text-yellow-500 font-medium hidden sm:inline">
            RESTAURANTE
          </span>
        </h2>
        <p className="text-[10px] text-muted-foreground font-medium mt-0.5 sm:mt-0">
          Sucursal 1
        </p>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        {/* NOMBRE DE BIENVENIDA (Oculto en móviles extra pequeños, visible desde sm:) */}
        <span className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
          Bienvenido,{" "}
          <span className="font-bold text-foreground">{username}</span>
        </span>

        {/* AVATAR COMPACTO (Visible SOLO en móviles extra pequeños en lugar del texto largo) */}
        <div className="sm:hidden w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shadow-sm">
          <span className="text-xs font-black text-yellow-600">
            {userInitial}
          </span>
        </div>

        {/* SEPARADOR VISUAL */}
        <div className="h-5 w-px bg-border mx-1" />

        {/* BOTÓN DEL CARRITO MINIMALISTA Y DINÁMICO */}
        <button
          onClick={() => dispatch(toggleCartSide())}
          className="relative p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 cursor-pointer transition-all duration-200"
          aria-label="Carrito de compras"
        >
          <ShoppingCart size={20} className="sm:w-[22px] sm:h-[22px]" />

          {totalQuantity > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center shadow-md shadow-red-600/20 animate-in fade-in zoom-in duration-300">
              {totalQuantity}
            </span>
          )}
        </button>
      </div>
      {/* <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Bienvenido, <span className="font-semibold">{username}</span>
        </span>
        <div
          className="relative p-2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          onClick={() => dispatch(toggleCartSide())}
        >
          <ShoppingCart size={22} />
          {totalQuantity > 0 && (
            <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 bg-rest-primary text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center animate-in fade-in zoom-in duration-200">
              {totalQuantity}
            </span>
          )}
        </div>
      </div> */}
    </header>
  );
}

{
  /* <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(toggleTheme())}
          title={isDark ? "Modo claro" : "Modo oscuro"}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </Button> */
}
