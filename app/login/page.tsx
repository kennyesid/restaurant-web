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
import ButtonGeneric from "@/components/common/button/ButtonGeneric";
import { ToastType } from "@/types";
import { CustomNotification } from "@/components/common/toast/CustomNotification";
import { configService } from "@/services/configService";
import { Eye, EyeOff } from "lucide-react";

// const loginSchema = z.object({
//   email: z.string().min(1, "Email requerido"),
//   password: z.string().min(1, "Contraseña requerida"),
// });

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .email("Formato de correo electrónico inválido (ej: usuario@gmail.com)"),
  password: z.string().min(4, "La contraseña debe tener al menos 4 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const dispatch = useAppDispatch();

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    let messageLogin = "";
    try {
      const user = await authenticateUser(data.email, data.password);
      if (user) {
        sessionStorage.setItem("isAuthenticated", "true");
        sessionStorage.setItem("username", user.fullName || user.username);
        sessionStorage.setItem("userId", user.id.toString());

        if (user?.groupId) {
          configService.setGroupId(user.groupId);
        } else {
          configService.setGroupId(1); // valor por defecto
        }

        dispatch(login(user));
        // toast.success(`¡Bienvenido, ${user.fullName}!`);
        messageLogin = `¡Bienvenido, ${user.fullName}!`;

        router.push("/dashboard");
      } else {
        messageLogin = "Usuario o contraseña incorrectos.";
        setIsLoading(false);
      }

      const currentToastBody = {
        type: user ? ToastType.Successfully : ToastType.Fail,
        message: user ? "Exito" : "Error",
        description: messageLogin,
        image: null,
      };

      toast.custom((t) => <CustomNotification t={t} body={currentToastBody} />, { position: "top-center" });

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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      </div>
      <Card className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 overflow-hidden border-none shadow-2xl bg-white">
        <div className="p-8 md:p-10 flex flex-col justify-center bg-gradient-to-br from-[#facc15] via-[#fbbf24] to-[#f59e0b]">
          <div className="mb-2 w-full">
            <div className="grid grid-cols-12 items-center gap-4">
              <div className="col-span-12 text-left">
                <h2 className="text-center text-2xl font-black text-rest-primary leading-tight drop-shadow-sm">
                  Bienvenido al Panel Administrativo para Restaurantes
                </h2>
                <div className="flex items-center gap-2 text-center justify-center">
                  {/* <span className="h-[2px] w-4 bg-rest-primary rounded-full shrink-0"></span> */}
                  <p className=" text-xs font-medium text-rest-primary/80 italic">
                    Gestión Inteligente de Restaurantes
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* FORM CARD INTERNO */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* EMAIL */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-rest-primary tracking-wider">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  {...register("email")}
                  // {...register("email", {
                  //   required: "El email es obligatorio",
                  //   pattern: {
                  //     value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  //     message: "Email inválido",
                  //   },
                  // })}
                  className={`bg-gray-50 border-gray-200 h-11 focus:ring-2 focus:ring-yellow-400 ${errors.email ? "border-red-400" : ""
                    }`}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-rest-primary tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className={`bg-gray-50 border-gray-200 h-11 focus:ring-2 focus:ring-yellow-400 pr-10 ${errors.password ? "border-red-400" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 transition"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              {/* <div className="space-y-2">
                <label className="text-xs font-semibold text-rest-primary tracking-wider">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className={`bg-gray-50 border-gray-200 h-11 focus:ring-2 focus:ring-yellow-400 ${errors.password ? "border-red-400" : ""
                    }`}
                />
                {errors.password && (
                  <p className="text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div> */}
              <ButtonGeneric
                type="submit"
                variant="primaryRed"
                className=" text-white "
                disabled={isLoading}
              >
                {isLoading ? "Ingresando..." : "Iniciar Sesión"}
              </ButtonGeneric>
            </form>
          </div>
          <div className="flex justify-center mt-2">
            <div className="inline-block  text-[10px] font-bold tracking-[0.2em] text-rest-primary uppercase bg-yellow-400/40 rounded-full backdrop-blur-sm border border-yellow-500/20 shadow-sm">
              Administrative Page v1.0
            </div>
          </div>
        </div>

        <div className="hidden md:block relative bg-gray-100">
          <Image
            src="./images/login/image-login-01.webp"
            alt="Food presentation"
            fill
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/5"></div>
          {/* IMAGEN SALTANDO (Esquina inferior derecha) */}
          <div className="absolute bottom-6 right-6 z-20">
            <div className="animate-bounce">
              <Image
                src="./images/login/login-modal-01.webp"
                alt="Platillo decorativo"
                width={90}
                height={90}
                priority
                className="object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
