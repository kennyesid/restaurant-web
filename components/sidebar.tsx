'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  ShoppingCart,
  Package,
  Beef,
  LogOut,
  ChevronLeft,
  Menu,
  Settings,
  Users,
  Tag,
  Gift,
  DollarSign,
  Clock,
  Calendar,
  ChevronDown,
} from 'lucide-react';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);
  const pathname = usePathname();

  const mainMenuItems = [
    { label: 'Dashboard', icon: BarChart3, href: '/dashboard' },
    { label: 'Carrito de Compras', icon: ShoppingCart, href: '/cart' },
    { label: 'Productos', icon: Package, href: '/product' },
    { label: 'Ingredientes', icon: Beef, href: '/dashboard/ingredients' },
  ];

  const adminMenuItems = [
    { label: 'Usuarios', icon: Users, href: '/dashboard/admin/users' },
    { label: 'Roles', icon: Settings, href: '/dashboard/admin/roles' },
    { label: 'Categorías', icon: Tag, href: '/dashboard/admin/categories' },
    { label: 'Promociones', icon: Gift, href: '/dashboard/admin/promotions' },
    { label: 'Turnos', icon: Clock, href: '/dashboard/admin/shifts' },
  ];

  // Función simple para manejar clases sin librerías externas
  const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 lg:hidden p-2 rounded-lg bg-[#011631] text-white border border-white/10"
      >
        <Menu size={20} />
      </button>

      {/* Sidebar Principal */}
      <aside
        className={cn(
    'fixed left-0 top-0 z-30 h-screen w-64 bg-[#011631] text-white transition-transform duration-300 flex flex-col',
    // ESTA CLASE AGREGA LA SOMBRA AL LADO DERECHO
    'shadow-[10px_0_30px_-15px_rgba(0,0,0,1)]', 
    !isOpen && '-translate-x-full lg:translate-x-0'
  )}
      >
        {/* Header / Logo Section */}
        <div className="p-8 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FACC15] rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <span className="text-xl font-black text-[#011631]">Y</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">YesiD REST</h1>
              <p className="text-[10px] text-yellow-500/80 font-bold uppercase tracking-widest">Sucursal 1</p>
            </div>
          </div>
        </div>

        {/* Navegación Principal */}
        <nav className="flex-1  space-y-2 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">
            Navegación
          </p>
          
          {mainMenuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                    'flex items-center gap-3 w-full px-6 py-4 transition-all duration-200 group relative',
                    isActive 
                      ? 'bg-[#FACC15] text-[#011631] font-bold shadow-none' // Quitamos shadow-lg si quieres algo más plano
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  )}
              >
                <Icon size={20} className={cn(isActive ? 'text-[#011631]' : 'group-hover:scale-110 transition-transform')} />
                <span className="text-sm tracking-wide">{item.label}</span>
              </Link>
            );
          })}

          {/* Sección de Administración (Dropdown) */}
          <div className="pt-4 mt-2 border-t border-white/5">
             <button
              onClick={() => setAdminOpen(!adminOpen)}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white rounded-xl transition-colors group"
            >
              <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
              <span className="flex-1 text-left text-sm font-medium">Administración</span>
              <ChevronDown size={16} className={cn('transition-transform duration-300', adminOpen && 'rotate-180')} />
            </button>

            {adminOpen && (
              <div className="mt-2 space-y-1 pl-6">
                {adminMenuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs transition-all',
                      pathname === item.href 
                        ? 'bg-white/10 text-[#FACC15] font-bold border-l-2 border-[#FACC15]' 
                        : 'text-slate-500 hover:text-slate-200'
                    )}
                  >
                    <item.icon size={14} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Footer / Botón Cerrar Sesión */}
        <div className="p-6">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 group">
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
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


// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import {
//   BarChart3,
//   ShoppingCart,
//   Package,
//   Beef,
//   LogOut,
//   ChevronLeft,
//   Menu,
//   Settings,
//   Users,
//   Tag,
//   Gift,
//   DollarSign,
//   Clock,
//   Calendar,
//   ChevronDown,
// } from 'lucide-react';
// import { logout } from '@/lib/auth';
// import { useRouter } from 'next/navigation';
// import { cn } from '@/lib/utils';

// export function Sidebar() {
//   const [isOpen, setIsOpen] = useState(true);
//   const [adminOpen, setAdminOpen] = useState(false);
//   const pathname = usePathname();
//   const router = useRouter();

//   const mainMenuItems = [
//     { label: 'Dashboard', icon: BarChart3, href: '/dashboard' },
//     { label: 'POS', icon: ShoppingCart, href: '/dashboard/pos' },
//     { label: 'Productos', icon: Package, href: '/dashboard/products' },
//     { label: 'Ingredientes', icon: Beef, href: '/dashboard/ingredients' },
//   ];

//   const adminMenuItems = [
//     { label: 'Usuarios', icon: Users, href: '/dashboard/admin/users' },
//     { label: 'Roles', icon: Settings, href: '/dashboard/admin/roles' },
//     { label: 'Categorías', icon: Tag, href: '/dashboard/admin/categories' },
//     { label: 'Promociones', icon: Gift, href: '/dashboard/admin/promotions' },
//     { label: 'Tipos de Pago', icon: DollarSign, href: '/dashboard/admin/payment-types' },
//     { label: 'Turnos', icon: Clock, href: '/dashboard/admin/shifts' },
//     { label: 'Períodos', icon: Calendar, href: '/dashboard/admin/periods' },
//   ];

//   const handleLogout = () => {
//     logout();
//     router.push('/login');
//   };

//   return (
//     <>
//       {/* Mobile Toggle */}
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="fixed top-4 left-4 z-40 lg:hidden p-2 rounded-lg bg-primary text-primary-foreground"
//       >
//         <Menu size={20} />
//       </button>

//       {/* Sidebar */}
//       <aside
//         className={cn(
//           'fixed left-0 top-0 z-30 h-screen w-64 bg-sidebar/80 backdrop-blur-xl border-r border-sidebar-border/50 text-sidebar-foreground transition-transform duration-300 flex flex-col',
//           !isOpen && '-translate-x-full lg:translate-x-0'
//         )}
//       >
//         {/* Header */}
//         <div className="p-6 border-b border-sidebar-border">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-xl font-bold">YesiD</h1>
//               <p className="text-xs text-sidebar-foreground/60">Sucursal 1</p>
//             </div>
//             <button
//               onClick={() => setIsOpen(false)}
//               className="hidden lg:block p-1 rounded-lg hover:bg-sidebar-accent/20"
//             >
//               <ChevronLeft size={20} />
//             </button>
//           </div>
//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
//           {mainMenuItems.map((item) => {
//             const isActive = pathname === item.href;
//             const Icon = item.icon;
//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 onClick={() => setIsOpen(false)}
//                 className={cn(
//                   'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
//                   isActive
//                     ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold'
//                     : 'text-sidebar-foreground hover:bg-sidebar-accent/10'
//                 )}
//               >
//                 <Icon size={20} />
//                 <span>{item.label}</span>
//               </Link>
//             );
//           })}

//           {/* Admin Section */}
//           <div className="pt-4 border-t border-sidebar-border">
//             <button
//               onClick={() => setAdminOpen(!adminOpen)}
//               className={cn(
//                 'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
//                 'text-sidebar-foreground hover:bg-sidebar-accent/10'
//               )}
//             >
//               <Settings size={20} />
//               <span className="flex-1 text-left">Administración</span>
//               <ChevronDown
//                 size={16}
//                 className={cn('transition-transform', adminOpen && 'rotate-180')}
//               />
//             </button>

//             {adminOpen && (
//               <div className="mt-2 space-y-1 pl-4">
//                 {adminMenuItems.map((item) => {
//                   const isActive = pathname === item.href;
//                   const Icon = item.icon;
//                   return (
//                     <Link
//                       key={item.href}
//                       href={item.href}
//                       onClick={() => setIsOpen(false)}
//                       className={cn(
//                         'flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors',
//                         isActive
//                           ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold'
//                           : 'text-sidebar-foreground hover:bg-sidebar-accent/10'
//                       )}
//                     >
//                       <Icon size={16} />
//                       <span>{item.label}</span>
//                     </Link>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         </nav>

//         {/* Footer */}
//         <div className="p-4 border-t border-sidebar-border">
//           <button
//             onClick={handleLogout}
//             className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
//           >
//             <LogOut size={20} />
//             <span>Cerrar Sesión</span>
//           </button>
//         </div>
//       </aside>

//       {/* Overlay */}
//       {isOpen && (
//         <div
//           className="fixed inset-0 bg-black/50 z-20 lg:hidden"
//           onClick={() => setIsOpen(false)}
//         />
//       )}
//     </>
//   );
// }
