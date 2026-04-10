'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Hardcoded credentials for demo
    if (data.username === 'admin' && data.password === 'admin') {
      // Store auth state in sessionStorage
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('username', data.username);
      
      toast.success('Bienvenido al sistema!');
      router.push('/dashboard');
    } else {
      toast.error('Credenciales inválidas. Use admin/admin');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-secondary flex-col justify-center items-center p-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-primary-foreground mb-4">YesiD</h1>
          <p className="text-xl text-primary-foreground/90 mb-8">Sistema de Administración de Restaurante</p>
          <div className="space-y-4 text-lg text-primary-foreground/80">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">✓</div>
              <span>Gestión de Inventario</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">✓</div>
              <span>Sistema POS Completo</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">✓</div>
              <span>Análisis de Ventas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12">
        <Card className="w-full max-w-md">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-center mb-2">Bienvenido</h2>
            <p className="text-center text-muted-foreground mb-8">Ingrese sus credenciales para continuar</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium">
                  Usuario
                </label>
                <Input
                  id="username"
                  placeholder="admin"
                  {...register('username')}
                  className={errors.username ? 'border-destructive' : ''}
                />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium">
                  Contraseña
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={errors.password ? 'border-destructive' : ''}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </form>

            <div className="mt-8 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Credenciales de Demo:</p>
              <p className="text-sm text-muted-foreground">Usuario: <span className="font-mono">admin</span></p>
              <p className="text-sm text-muted-foreground">Contraseña: <span className="font-mono">admin</span></p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
