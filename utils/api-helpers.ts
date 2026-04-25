import { RespuestaGenericaDto } from "@/types";
import { toast } from "sonner"; // O tu librería de toast

/**
 * Procesa una respuesta genérica del backend.
 * @param response Objeto RespuestaGenericaDto<T>
 * @param setter Función de React para actualizar el estado (setX)
 * @param showSuccessToast Si quieres que muestre mensaje en caso de éxito
 */
export const handleResponse = <T>(
  response: RespuestaGenericaDto<T>,
  setter: (data: T) => void,
  showSuccessToast: boolean = false
) => {
  // Caso 1: Éxito (Rango 200)
  if (response.codigo >= 200 && response.codigo <= 299) {
    if (response.contenido !== null) {
      setter(response.contenido);
    }
    
    // if (showSuccessToast) {
    //   toast.success(response.mensaje || "Operación exitosa");
    // }
  } 
  // Caso 2: Error del Backend (400, 401, 500, etc.)
  else {
    // Aquí es donde manejas el mensaje que viene del C#
    toast.error(response.mensaje || "Ocurrió un error inesperado");
    
    // Opcional: Podrías usar tu CustomNotification aquí si lo prefieres
    /*
    toast.custom((t) => (
      <CustomNotification 
        t={t} 
        body={{ 
          type: ToastType.Fail, 
          message: "Error", 
          description: response.mensaje 
        }} 
      />
    ));
    */
  }
};