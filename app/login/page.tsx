"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "@/store/store/hooks";
import { login } from "@/store/store/slices/authSlice";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { authenticateUser } from "@/services/usersService";

const loginSchema = z.object({
  email: z.string().min(1, "Email requerido"),
  password: z.string().min(1, "Contraseña requerida"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const dispatch = useAppDispatch();

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const user = await authenticateUser(data.email, data.password);

      if (user) {
        sessionStorage.setItem("isAuthenticated", "true");
        sessionStorage.setItem("username", user.fullName || user.username);
        sessionStorage.setItem("userId", user.id.toString());
        dispatch(login(user));
        toast.success(`¡Bienvenido, ${user.fullName}!`);
        router.push("/dashboard");
      } else {
        toast.error("Usuario o contraseña incorrectos");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Ocurrió un error al intentar iniciar sesión");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4">
      <div className="absolute inset-0 z-0">
        <Image
          src="./images/login/background-04.jpg"
          alt="Platillo"
          fill
          priority
          className="object-cover"
        />
      </div>
      <Card className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 overflow-hidden border-none shadow-2xl bg-white">
        <div className="p-8 md:p-12 flex flex-col justify-center bg-[#facc15]">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
              Bienvenido 👋
            </h2>
            <p className="text-sm text-gray-700">
              Sistema de Administración de Restaurante
            </p>
          </div>

          {/* FORM CARD INTERNO */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* EMAIL */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  {...register("email", {
                    required: "El email es obligatorio",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Email inválido",
                    },
                  })}
                  className={`bg-gray-50 border-gray-200 h-11 focus:ring-2 focus:ring-yellow-400 ${
                    errors.email ? "border-red-400" : ""
                  }`}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* PASSWORD */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...register("password", {
                    required: "La contraseña es obligatoria",
                    minLength: {
                      value: 4,
                      message: "Mínimo 4 caracteres",
                    },
                  })}
                  className={`bg-gray-50 border-gray-200 h-11 focus:ring-2 focus:ring-yellow-400 ${
                    errors.password ? "border-red-400" : ""
                  }`}
                />
                {errors.password && (
                  <p className="text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* OPTIONS */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-400"
                  />
                  Recordarme
                </label>

                <a className="text-gray-500 hover:text-gray-800 transition-colors cursor-pointer">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {/* BUTTON */}
              <Button
                type="submit"
                className="w-full h-11 bg-gray-900 hover:bg-black text-white font-bold transition-all shadow-md"
                disabled={isLoading}
              >
                {isLoading ? "Ingresando..." : "Iniciar Sesión"}
              </Button>
            </form>
          </div>
          {/* 
          <p className="mt-6 text-center text-xs text-gray-700">
            ¿No tienes cuenta?{" "}
            <span className="font-bold cursor-pointer text-gray-900">
              Crear cuenta
            </span>
          </p> */}
        </div>

        {/* LADO DERECHO: Imagen Decorativa (Solo visible en MD adelante) */}
        <div className="hidden md:block relative bg-gray-100">
          <Image
            src="./images/login/image-login-01.webp"
            alt="Food presentation"
            fill
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Overlay suave sobre la imagen si fuera necesario */}
          <div className="absolute inset-0 bg-black/5"></div>
        </div>
      </Card>
    </div>
  );
}

// 'use client';

// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';
// import { useRouter } from 'next/navigation';
// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card } from '@/components/ui/card';
// import { toast } from 'sonner';

// const loginSchema = z.object({
//   username: z.string().min(1, 'Usuario requerido'),
//   password: z.string().min(1, 'Contraseña requerida'),
// });

// type LoginFormData = z.infer<typeof loginSchema>;

// export default function LoginPage() {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<LoginFormData>({
//     resolver: zodResolver(loginSchema),
//   });

//   const onSubmit = async (data: LoginFormData) => {
//     setIsLoading(true);

//     // Simulate API call
//     await new Promise(resolve => setTimeout(resolve, 500));

//     // Hardcoded credentials for demo
//     if (data.username === 'admin' && data.password === 'admin') {
//       // Store auth state in sessionStorage
//       sessionStorage.setItem('isAuthenticated', 'true');
//       sessionStorage.setItem('username', data.username);

//       toast.success('Bienvenido al sistema!');
//       router.push('/dashboard');
//     } else {
//       toast.error('Credenciales inválidas. Use admin/admin');
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen">
//       {/* Left side - Branding */}
//       <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-secondary flex-col justify-center items-center p-12">
//         <div className="text-center">
//           <h1 className="text-5xl font-bold text-primary-foreground mb-4">YesiD</h1>
//           <p className="text-xl text-primary-foreground/90 mb-8">Sistema de Administración de Restaurante</p>
//           <div className="space-y-4 text-lg text-primary-foreground/80">
//             <div className="flex items-center gap-3">
//               <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">✓</div>
//               <span>Gestión de Inventario</span>
//             </div>
//             <div className="flex items-center gap-3">
//               <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">✓</div>
//               <span>Sistema POS Completo</span>
//             </div>
//             <div className="flex items-center gap-3">
//               <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">✓</div>
//               <span>Análisis de Ventas</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Right side - Login Form */}
//       <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12">
//         <Card className="w-full max-w-md">
//           <div className="p-8">
//             <h2 className="text-2xl font-bold text-center mb-2">Bienvenido</h2>
//             <p className="text-center text-muted-foreground mb-8">Ingrese sus credenciales para continuar</p>

//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//               <div className="space-y-2">
//                 <label htmlFor="username" className="block text-sm font-medium">
//                   Usuario
//                 </label>
//                 <Input
//                   id="username"
//                   placeholder="admin"
//                   {...register('username')}
//                   className={errors.username ? 'border-destructive' : ''}
//                 />
//                 {errors.username && (
//                   <p className="text-sm text-destructive">{errors.username.message}</p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="password" className="block text-sm font-medium">
//                   Contraseña
//                 </label>
//                 <Input
//                   id="password"
//                   type="password"
//                   placeholder="••••••••"
//                   {...register('password')}
//                   className={errors.password ? 'border-destructive' : ''}
//                 />
//                 {errors.password && (
//                   <p className="text-sm text-destructive">{errors.password.message}</p>
//                 )}
//               </div>

//               <Button
//                 type="submit"
//                 className="w-full"
//                 disabled={isLoading}
//               >
//                 {isLoading ? 'Ingresando...' : 'Ingresar'}
//               </Button>
//             </form>

//             <div className="mt-8 p-4 bg-muted rounded-lg">
//               <p className="text-sm font-medium mb-2">Credenciales de Demo:</p>
//               <p className="text-sm text-muted-foreground">Usuario: <span className="font-mono">admin</span></p>
//               <p className="text-sm text-muted-foreground">Contraseña: <span className="font-mono">admin</span></p>
//             </div>
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// }
