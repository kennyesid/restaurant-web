"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut, Menu, Settings, ChevronDown } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/store/hooks";
import { MENU_BY_ROL, MenuConfig } from "@/lib/constants/menuByRol";
import { RoleType } from "@/types";
import Image from "next/image";
import { configService } from "@/services/configService";
import { logout } from "@/store/store/slices/authSlice";

export function Sidebar() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);

  const [menuPermissions, setMenuPermissions] = useState<MenuConfig>(
    MENU_BY_ROL[(user?.role?.toUpperCase() as RoleType) || "VISITOR"],
  );

  const pathname = usePathname();
  const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");
  const handleLogout = () => {
    dispatch(logout());
    configService.clearGroupId();
    toast.success("Sesión cerrada correctamente");
    router.push("/login");
  };

  useEffect(() => {
    if (user?.role) {
      const role = user.role.toUpperCase() as RoleType;
      setMenuPermissions(MENU_BY_ROL[role] || MENU_BY_ROL["VISITOR"]);
      setIsOpen(false);
    } else {
      setMenuPermissions(MENU_BY_ROL["VISITOR"]);
    }
  }, [user]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 lg:hidden p-2 rounded-lg bg-[#052A3D] text-white border border-white/10"
      >
        <Menu size={20} />
      </button>
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 h-screen w-64 bg-[#052A3D] text-white transition-transform duration-300 flex flex-col",
          "shadow-[10px_0_30px_-15px_rgba(0,0,0,1)]",
          !isOpen && "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="p-8 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center shadow-lg shadow-yellow-500/20 overflow-hidden shrink-0">
              <Image
                src="./images/restaurante/logotipo-cocina-yeshua.jpeg"
                alt="Logo YesiD REST"
                fill
                sizes="40px"
                priority
                className="object-cover p-1"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                {user?.role}
              </h1>
              <p className="text-[10px] text-yellow-500/80 font-bold uppercase tracking-widest">
                Sucursal 1
              </p>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -top-10  -left-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-2xl pointer-events-none"></div>

        {/* Navegación Principal */}
        <nav className="flex-1  space-y-2 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">
            Navegación
          </p>

          {/* {mainMenuItems.map((item) => { */}
          {menuPermissions?.first.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 w-full px-6 py-4 transition-all duration-200 group relative",
                  isActive
                    ? "bg-[#FACC15] text-[#052A3D] font-bold shadow-none" // Quitamos shadow-lg si quieres algo más plano
                    : "text-slate-400 hover:text-white hover:bg-white/5",
                )}
              >
                <Icon
                  size={20}
                  className={cn(
                    isActive
                      ? "text-[#052A3D]"
                      : "group-hover:scale-110 transition-transform",
                  )}
                />
                <span className="text-sm tracking-wide">{item.label}</span>
              </Link>
            );
          })}

          {/* Sección de Administración (Dropdown) */}
          {user?.role === "ADMIN" && (
            <div className="pt-4 mt-2 border-t border-white/5">
              <button
                onClick={() => setAdminOpen(!adminOpen)}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white rounded-xl transition-colors group"
              >
                <Settings
                  size={20}
                  className="group-hover:rotate-90 transition-transform duration-500"
                />
                <span className="flex-1 text-left text-sm font-medium">
                  Administración
                </span>
                <ChevronDown
                  size={16}
                  className={cn(
                    "transition-transform duration-300",
                    adminOpen && "rotate-180",
                  )}
                />
              </button>

              {adminOpen && (
                <div className="mt-2 space-y-1 pl-6">
                  {menuPermissions.second.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs transition-all",
                        pathname === item.href
                          ? "bg-white/10 text-[#FACC15] font-bold border-l-2 border-[#FACC15]"
                          : "text-slate-500 hover:text-slate-200",
                      )}
                    >
                      <item.icon size={14} />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Footer / Botón Cerrar Sesión */}
        <div className="p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 group"
          >
            <LogOut
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="text-sm font-bold">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Overlay para móviles */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

// const [menuPermissions, setMenuPermissions] = useState<MenuConfig>(() => {
//   const role = (user?.role?.toUpperCase() as RoleType) || "SALES_MANAGER";
//   return MENU_BY_ROL[role] || MENU_BY_ROL["SALES_MANAGER"];
// });

// const [menuPermissions, setMenuPermissions] = useState<MenuConfig>(
//   MENU_BY_ROL["ADMIN"],
// );

// useEffect(() => {
//   const role = user?.role?.toUpperCase() as RoleType;
//   const getPermissions = MENU_BY_ROL[role];
//   setMenuPermissions(getPermissions);
// }, [user?.role]);
