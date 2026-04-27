export enum OrderStatusEnum {
    PAGADO = 1,       // El cliente ya pagó, el pedido entra a la lista.
    EN_COCINA = 2,    // El cocinero lo vió y lo está preparando.
    LISTO = 3,        // El plato está en el mostrador esperando al mesero.
    ENTREGADO = 4,    // Fin del ciclo.
    CANCELADO = 5     // Por si hubo algún error o devolución.
}