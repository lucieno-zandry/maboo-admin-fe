import { toast } from 'sonner';
import type { ShippingMethod, ShippingRate } from 'wle-core';
import { create } from 'zustand';
import { HttpException, ValidationException } from '~/api/app-fetch';
import {
    fetchShippingMethods,
    showShippingMethod,
    createShippingMethod,
    updateShippingMethod,
    deleteShippingMethod,
    fetchShippingRates,
    createShippingRate,
    updateShippingRate,
    deleteShippingRate,
} from '~/api/http-requests';
import type { StoreShippingMethodData, StoreShippingRateData, UpdateShippingMethodData, UpdateShippingRateData } from '~/types/shipping-methods';

// ── Types ─────────────────────────────────────────────────────────────────────

export type MethodDialogMode = 'create' | 'edit' | null;
export type RateDialogMode = 'create' | 'edit' | null;

interface ShippingMethodsState {
    // Data
    methods: ShippingMethod[];
    rates: ShippingRate[];
    selectedMethod: ShippingMethod | null;
    selectedRate: ShippingRate | null;

    // Loading states
    loadingMethods: boolean;
    loadingRates: boolean;
    submitting: boolean;

    // Dialog state
    methodDialog: MethodDialogMode;
    rateDialog: RateDialogMode;

    // Actions — Methods
    loadMethods: () => Promise<void>;
    selectMethod: (method: ShippingMethod | null) => void;
    openCreateMethod: () => void;
    openEditMethod: (method: ShippingMethod) => void;
    closeMethodDialog: () => void;
    submitMethod: (data: StoreShippingMethodData | UpdateShippingMethodData) => Promise<boolean>;
    removeMethod: (id: number) => Promise<boolean>;
    toggleMethodActive: (method: ShippingMethod) => Promise<void>;

    // Actions — Rates
    loadRates: (methodId: number) => Promise<void>;
    openCreateRate: () => void;
    openEditRate: (rate: ShippingRate) => void;
    closeRateDialog: () => void;
    submitRate: (data: StoreShippingRateData | UpdateShippingRateData) => Promise<boolean>;
    removeRate: (rateId: number) => Promise<boolean>;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useShippingMethodsStore = create<ShippingMethodsState>((set, get) => ({
    methods: [],
    rates: [],
    selectedMethod: null,
    selectedRate: null,
    loadingMethods: false,
    loadingRates: false,
    submitting: false,
    methodDialog: null,
    rateDialog: null,

    // ── Methods ───────────────────────────────────────────────────────────────

    loadMethods: async () => {
        set({ loadingMethods: true });
        const res = await fetchShippingMethods();
        if (res.data) {
            set({ methods: res.data.data ?? [] });
        }
        set({ loadingMethods: false });
    },

    selectMethod: (method) => {
        set({ selectedMethod: method, rates: [], selectedRate: null });
        if (method) {
            get().loadRates(method.id);
        }
    },

    openCreateMethod: () => set({ methodDialog: 'create', selectedMethod: null }),

    openEditMethod: (method) => set({ methodDialog: 'edit', selectedMethod: method }),

    closeMethodDialog: () => set({ methodDialog: null }),

    submitMethod: async (data) => {
        set({ submitting: true });
        const { methodDialog, selectedMethod, loadMethods, closeMethodDialog, selectMethod } = get();

        try {
            let res;
            if (methodDialog === 'edit' && selectedMethod) {
                res = await updateShippingMethod(selectedMethod.id, data as UpdateShippingMethodData);
            } else {
                res = await createShippingMethod(data as StoreShippingMethodData);
            }

            selectMethod(res.data!);
            toast.success("Shipping method set successfuly!");
            closeMethodDialog();

            loadMethods();
        } catch (e) {
            if (e instanceof ValidationException)
                toast.error("Some fields are not valid!", { description: e.message });
            else if (e instanceof HttpException)
                toast.error("Oups, something went wrong!", { description: e.data?.message || `status: ${e.status}` })
        } finally {
            set({ submitting: false });
        }

        return false;
    },

    removeMethod: async (id) => {
        const { loadMethods, selectedMethod, selectMethod } = get();
        const loading = toast.loading('Removing Method...');
        set({ submitting: true });

        try {
            await deleteShippingMethod(id);
            loadMethods();

            toast.success("Method removed successfully");

            if (selectedMethod?.id === id)
                selectMethod(null);

            return true;
        } catch (e) {
            if (e instanceof HttpException)
                toast.error(e.data.message || "Failed to remove method!");
        } finally {
            toast.dismiss(loading);
            set({ submitting: false });
        }

        return false;
    },

    toggleMethodActive: async (method) => {
        const res = await updateShippingMethod(method.id, { is_active: !method.is_active });
        if (res.data) {
            const updated = res.data;
            set((state) => ({
                methods: state.methods.map((m) => (m.id === updated.id ? updated : m)),
                selectedMethod: state.selectedMethod?.id === updated.id ? updated : state.selectedMethod,
            }));
        }
    },

    // ── Rates ─────────────────────────────────────────────────────────────────

    loadRates: async (methodId) => {
        set({ loadingRates: true });
        const res = await fetchShippingRates(methodId);
        if (res.data) {
            set({ rates: res.data.data ?? [] });
        }
        set({ loadingRates: false });
    },

    openCreateRate: () => set({ rateDialog: 'create', selectedRate: null }),

    openEditRate: (rate) => set({ rateDialog: 'edit', selectedRate: rate }),

    closeRateDialog: () => set({ rateDialog: null, selectedRate: null }),

    submitRate: async (data) => {
        const { rateDialog, selectedRate, selectedMethod, loadRates, closeRateDialog } = get();

        if (!selectedMethod) return false

        set({ submitting: true });

        try {
            let res;
            if (rateDialog === 'edit' && selectedRate) {
                res = await updateShippingRate(selectedMethod.id, selectedRate.id, data as UpdateShippingRateData);
            } else {
                res = await createShippingRate(selectedMethod.id, data as StoreShippingRateData);
            }

            loadRates(selectedMethod.id);
            closeRateDialog();
            toast.success("Rate set successfully");
        } catch (e) {
            if (e instanceof ValidationException)
                toast.error("Some fields are not valid!", { description: e.message });
            else if (e instanceof HttpException)
                toast.error("Oups, something went wrong!", { description: e.data?.message || `status: ${e.status}` })
        } finally {
            set({ submitting: false });
        }

        return false;
    },

    removeRate: async (rateId) => {
        const { selectedMethod } = get();
        if (!selectedMethod) return false;

        const loading = toast.loading('Removing rate ...');
        set({ submitting: true });

        try {
            const res = await deleteShippingRate(selectedMethod.id, rateId);
            set({ submitting: false });
            if (res.status === 200 || res.status === 204) {
                set((state) => ({
                    rates: state.rates.filter((r) => r.id !== rateId),
                }));
                return true;
            }
        } catch (e) {
            if (e instanceof HttpException)
                toast.error(e.data.message || "Failed to remove method!");
        } finally {
            toast.dismiss(loading);
            set({ submitting: false });
        }
        return false;
    },
}));