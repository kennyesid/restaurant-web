// 1. Definición del Enum de cortes de billetes (Moneda Nacional de Bolivia)
export enum BolivianCashCuts {
  DIEZ = 10,
  VEINTE = 20,
  CINCUENTA = 50,
  CIEN = 100,
  DOSCIENTOS = 200,
}

// --- DENTRO DE TU COMPONENTE PRINCIPAL (Donde tienes tus useState de total, editableItems, etc.) ---
// 2. Estados para controlar el flujo de caja del vuelto
// const [amountPaid, setAmountPaid] = React.useState<number>(0);

// // 3. Cálculo automático del cambio (vuelto) en tiempo real
// const changeReturned = amountPaid > total ? amountPaid - total : 0;