'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const loginSchema = z.object({
  username: z.string().min(1, 'Usuario requerido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
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
    await new Promise(resolve => setTimeout(resolve, 500));

    if (data.username === 'admin' && data.password === 'admin') {
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('username', data.username);
      toast.success('Bienvenido al sistema!');
      router.push('/dashboard');
    } else {
      toast.error('Credenciales inválidas');
      setIsLoading(false);
    }
  };

  return (
    // Contenedor principal con imagen de fondo
    <div className="relative min-h-screen w-full flex items-center justify-center p-4">
      <div className="absolute inset-0 z-0">
        {/* <img 
          // src="./images/login/background-02.webp" 
          src="./images/login/background-04.jpg" 
          alt="Background" 
          className="w-full h-full object-cover filter brightness-[0.4]"
        /> */}
<Image 
  src="./images/login/background-04.jpg" 
  alt="Platillo" 
  fill 
  priority 
  className="object-cover"
/>
      </div>

      {/* Tarjeta de Login estilo Modal de la imagen */}
      <Card className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 overflow-hidden border-none shadow-2xl bg-white">
        
        {/* LADO IZQUIERDO: Formulario */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <img src="./images/login/image-login-02.webp" alt="Urbee Logo" className="h-8 mb-6" />
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-sm text-gray-500">Sign in with your user and password.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                User Address
              </label>
              <Input
                placeholder="admin"
                {...register('username')}
                className={`bg-gray-50 border-gray-100 h-11 focus:ring-green-500 ${errors.username ? 'border-red-400' : ''}`}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className={`bg-gray-50 border-gray-100 h-11 focus:ring-green-500 ${errors.password ? 'border-red-400' : ''}`}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-gray-500">
                <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                Remember me
              </label>
              <a href="#" className="text-gray-300 hover:text-gray-500 transition-colors">Forgot Password?</a>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-[#5BB347] hover:bg-[#4a943a] text-white font-bold transition-all shadow-lg shadow-green-200"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-400">
            Don't have an account? <span className="text-[#5BB347] font-bold cursor-pointer">Sign Up</span>
          </p>
        </div>

        {/* LADO DERECHO: Imagen Decorativa (Solo visible en MD adelante) */}
        <div className="hidden md:block relative bg-gray-100">
          <img 
            src="./images/login/image-login-01.webp" 
            alt="Food presentation" 
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
