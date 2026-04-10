import { storage } from '@/lib/storage';
import { Promotion, PaymentType, Shift, Period, Tenant } from '@/lib/types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const DEFAULT_TENANT_ID = 'tenant-1';

// ==================== PROMOTIONS ====================
const PROMOTIONS_KEY = 'promotions';

export async function getPromotions(): Promise<Promotion[]> {
  return storage.getCollection<Promotion>(PROMOTIONS_KEY);
}

export async function getPromotionById(id: string): Promise<Promotion | null> {
  return storage.getFromCollection<Promotion>(PROMOTIONS_KEY, id, 'id_promotion');
}

export async function createPromotion(promotion: Omit<Promotion, 'id_promotion'>): Promise<Promotion> {
  const newPromotion: Promotion = {
    ...promotion,
    id_promotion: generateId(),
  };
  storage.addToCollection(PROMOTIONS_KEY, newPromotion, 'id_promotion');
  return newPromotion;
}

export async function updatePromotion(id: string, updates: Partial<Promotion>): Promise<Promotion | null> {
  const success = storage.updateInCollection(PROMOTIONS_KEY, id, updates, 'id_promotion');
  return success ? storage.getFromCollection<Promotion>(PROMOTIONS_KEY, id, 'id_promotion') : null;
}

export async function deletePromotion(id: string): Promise<boolean> {
  return storage.removeFromCollection(PROMOTIONS_KEY, id, 'id_promotion');
}

// ==================== PAYMENT TYPES ====================
const PAYMENT_TYPES_KEY = 'payment_types';

function initializePaymentTypes() {
  const existing = storage.getCollection<PaymentType>(PAYMENT_TYPES_KEY);
  if (existing.length === 0) {
    const defaultPaymentTypes: PaymentType[] = [
      {
        id_payment_type: 'pt-1',
        name: 'Efectivo',
        description: 'Pago en efectivo',
        id_tenant: DEFAULT_TENANT_ID,
      },
      {
        id_payment_type: 'pt-2',
        name: 'Tarjeta de Crédito',
        description: 'Tarjeta de crédito',
        id_tenant: DEFAULT_TENANT_ID,
      },
      {
        id_payment_type: 'pt-3',
        name: 'Tarjeta de Débito',
        description: 'Tarjeta de débito',
        id_tenant: DEFAULT_TENANT_ID,
      },
      {
        id_payment_type: 'pt-4',
        name: 'Transferencia',
        description: 'Transferencia bancaria',
        id_tenant: DEFAULT_TENANT_ID,
      },
    ];
    storage.setCollection(PAYMENT_TYPES_KEY, defaultPaymentTypes);
  }
}

if (typeof window !== 'undefined') {
  initializePaymentTypes();
}

export async function getPaymentTypes(): Promise<PaymentType[]> {
  return storage.getCollection<PaymentType>(PAYMENT_TYPES_KEY);
}

export async function getPaymentTypeById(id: string): Promise<PaymentType | null> {
  return storage.getFromCollection<PaymentType>(PAYMENT_TYPES_KEY, id, 'id_payment_type');
}

export async function createPaymentType(paymentType: Omit<PaymentType, 'id_payment_type'>): Promise<PaymentType> {
  const newPaymentType: PaymentType = {
    ...paymentType,
    id_payment_type: generateId(),
  };
  storage.addToCollection(PAYMENT_TYPES_KEY, newPaymentType, 'id_payment_type');
  return newPaymentType;
}

export async function updatePaymentType(id: string, updates: Partial<PaymentType>): Promise<PaymentType | null> {
  const success = storage.updateInCollection(PAYMENT_TYPES_KEY, id, updates, 'id_payment_type');
  return success ? storage.getFromCollection<PaymentType>(PAYMENT_TYPES_KEY, id, 'id_payment_type') : null;
}

export async function deletePaymentType(id: string): Promise<boolean> {
  return storage.removeFromCollection(PAYMENT_TYPES_KEY, id, 'id_payment_type');
}

// ==================== SHIFTS ====================
const SHIFTS_KEY = 'shifts';

function initializeShifts() {
  const existing = storage.getCollection<Shift>(SHIFTS_KEY);
  if (existing.length === 0) {
    const defaultShifts: Shift[] = [
      {
        id_shift: 'shift-1',
        name: 'Mañana',
        start_time: '06:00',
        end_time: '14:00',
        id_tenant: DEFAULT_TENANT_ID,
      },
      {
        id_shift: 'shift-2',
        name: 'Tarde',
        start_time: '14:00',
        end_time: '22:00',
        id_tenant: DEFAULT_TENANT_ID,
      },
      {
        id_shift: 'shift-3',
        name: 'Noche',
        start_time: '22:00',
        end_time: '06:00',
        id_tenant: DEFAULT_TENANT_ID,
      },
    ];
    storage.setCollection(SHIFTS_KEY, defaultShifts);
  }
}

if (typeof window !== 'undefined') {
  initializeShifts();
}

export async function getShifts(): Promise<Shift[]> {
  return storage.getCollection<Shift>(SHIFTS_KEY);
}

export async function getShiftById(id: string): Promise<Shift | null> {
  return storage.getFromCollection<Shift>(SHIFTS_KEY, id, 'id_shift');
}

export async function createShift(shift: Omit<Shift, 'id_shift'>): Promise<Shift> {
  const newShift: Shift = {
    ...shift,
    id_shift: generateId(),
  };
  storage.addToCollection(SHIFTS_KEY, newShift, 'id_shift');
  return newShift;
}

export async function updateShift(id: string, updates: Partial<Shift>): Promise<Shift | null> {
  const success = storage.updateInCollection(SHIFTS_KEY, id, updates, 'id_shift');
  return success ? storage.getFromCollection<Shift>(SHIFTS_KEY, id, 'id_shift') : null;
}

export async function deleteShift(id: string): Promise<boolean> {
  return storage.removeFromCollection(SHIFTS_KEY, id, 'id_shift');
}

// ==================== PERIODS ====================
const PERIODS_KEY = 'periods';

export async function getPeriods(): Promise<Period[]> {
  return storage.getCollection<Period>(PERIODS_KEY);
}

export async function getPeriodById(id: string): Promise<Period | null> {
  return storage.getFromCollection<Period>(PERIODS_KEY, id, 'id_period');
}

export async function createPeriod(period: Omit<Period, 'id_period'>): Promise<Period> {
  const newPeriod: Period = {
    ...period,
    id_period: generateId(),
  };
  storage.addToCollection(PERIODS_KEY, newPeriod, 'id_period');
  return newPeriod;
}

export async function updatePeriod(id: string, updates: Partial<Period>): Promise<Period | null> {
  const success = storage.updateInCollection(PERIODS_KEY, id, updates, 'id_period');
  return success ? storage.getFromCollection<Period>(PERIODS_KEY, id, 'id_period') : null;
}

export async function deletePeriod(id: string): Promise<boolean> {
  return storage.removeFromCollection(PERIODS_KEY, id, 'id_period');
}

// ==================== TENANTS ====================
const TENANTS_KEY = 'tenants';

function initializeTenants() {
  const existing = storage.getCollection<Tenant>(TENANTS_KEY);
  if (existing.length === 0) {
    const defaultTenants: Tenant[] = [
      {
        id_tenant: DEFAULT_TENANT_ID,
        name: 'Sucursal 1 - Yesid',
        description: 'Sucursal principal',
        is_active: true,
      },
    ];
    storage.setCollection(TENANTS_KEY, defaultTenants);
  }
}

if (typeof window !== 'undefined') {
  initializeTenants();
}

export async function getTenants(): Promise<Tenant[]> {
  return storage.getCollection<Tenant>(TENANTS_KEY);
}

export async function getTenantById(id: string): Promise<Tenant | null> {
  return storage.getFromCollection<Tenant>(TENANTS_KEY, id, 'id_tenant');
}

export async function createTenant(tenant: Omit<Tenant, 'id_tenant'>): Promise<Tenant> {
  const newTenant: Tenant = {
    ...tenant,
    id_tenant: generateId(),
  };
  storage.addToCollection(TENANTS_KEY, newTenant, 'id_tenant');
  return newTenant;
}

export async function updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant | null> {
  const success = storage.updateInCollection(TENANTS_KEY, id, updates, 'id_tenant');
  return success ? storage.getFromCollection<Tenant>(TENANTS_KEY, id, 'id_tenant') : null;
}

export async function deleteTenant(id: string): Promise<boolean> {
  return storage.removeFromCollection(TENANTS_KEY, id, 'id_tenant');
}
