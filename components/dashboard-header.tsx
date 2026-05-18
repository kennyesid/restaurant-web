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
      <div>
        <h2 className="text-lg font-semibold">Sucursal 1 - Yesid</h2>
        <p className="text-xs text-muted-foreground">
          Sistema de Administración
        </p>
      </div>

      <div className="flex items-center gap-4">
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
      </div>
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
