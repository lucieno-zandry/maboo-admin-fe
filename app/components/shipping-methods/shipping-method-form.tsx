import { useEffect, useState } from 'react';
import { useShippingMethodsStore } from '~/hooks/use-shipping-methods-store';
import {
    CARRIER_OPTIONS,
    CALCULATION_TYPE_OPTIONS,
    defaultMethodValues,
} from '~/lib/shipping-methods-helpers';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Switch } from '~/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '~/components/ui/select';
import { Badge } from '~/components/ui/badge';
import { X, Plus, Loader2 } from 'lucide-react';
import getCurrency from '~/lib/get-currency';
import type { ShippingMethod } from 'wle-core';

// ── Types ─────────────────────────────────────────────────────────────────────

type MethodFormValues = typeof defaultMethodValues;

interface ShippingMethodFormProps {
    open: boolean;
    mode: 'create' | 'edit' | null;
    initialValues: MethodFormValues | null;
    submitting: boolean;
    onSubmit: (data: MethodFormValues) => void;
    onClose: () => void;
}

// ── Dumb component ────────────────────────────────────────────────────────────

export function ShippingMethodForm({
    open,
    mode,
    initialValues,
    submitting,
    onSubmit,
    onClose,
}: ShippingMethodFormProps) {
    const [values, setValues] = useState<MethodFormValues>(defaultMethodValues);
    const [countryInput, setCountryInput] = useState('');

    useEffect(() => {
        if (open) {
            setValues(initialValues ?? defaultMethodValues);
            setCountryInput('');
        }
    }, [open, initialValues]);

    const set = <K extends keyof MethodFormValues>(key: K, value: MethodFormValues[K]) =>
        setValues((prev) => ({ ...prev, [key]: value }));

    const addCountry = () => {
        const code = countryInput.trim().toUpperCase();
        if (code.length !== 2) return;
        const existing = values.allowed_countries ?? [];
        if (!existing.includes(code)) {
            set('allowed_countries', [...existing, code]);
        }
        setCountryInput('');
    };

    const removeCountry = (code: string) => {
        set('allowed_countries', (values.allowed_countries ?? []).filter((c) => c !== code));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(values);
    };

    const calcType = values.calculation_type;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'edit' ? 'Edit Shipping Method' : 'New Shipping Method'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 py-2">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="sm-name">Name <span className="text-destructive">*</span></Label>
                        <Input
                            id="sm-name"
                            value={values.name}
                            onChange={(e) => set('name', e.target.value)}
                            placeholder="e.g. Standard Delivery"
                            required
                        />
                    </div>

                    {/* Carrier + Is Active row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Carrier <span className="text-destructive">*</span></Label>
                            <Select
                                value={values.carrier}
                                onValueChange={(v) => set('carrier', v as ShippingMethod['carrier'])}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CARRIER_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Status</Label>
                            <div className="flex items-center gap-3 h-10">
                                <Switch
                                    checked={values.is_active}
                                    onCheckedChange={(v) => set('is_active', v)}
                                />
                                <span className="text-sm text-muted-foreground">
                                    {values.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Calculation type */}
                    <div className="space-y-1.5">
                        <Label>Calculation Type <span className="text-destructive">*</span></Label>
                        <div className="grid grid-cols-3 gap-2">
                            {CALCULATION_TYPE_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => set('calculation_type', opt.value)}
                                    className={`rounded-lg border p-3 text-left transition-colors ${calcType === opt.value
                                            ? 'border-primary bg-primary/5 text-primary'
                                            : 'border-border hover:border-muted-foreground'
                                        }`}
                                >
                                    <div className="text-sm font-medium">{opt.label}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">{opt.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Flat rate fields */}
                    {calcType === 'flat_rate' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="sm-flat">Flat Rate ({getCurrency.symbol()}) <span className="text-destructive">*</span></Label>
                                <Input
                                    id="sm-flat"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={values.flat_rate ?? ''}
                                    onChange={(e) => set('flat_rate', e.target.value ? parseFloat(e.target.value) : null)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="sm-threshold">Free Shipping Above ({getCurrency.symbol()})</Label>
                                <Input
                                    id="sm-threshold"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={values.free_shipping_threshold ?? ''}
                                    onChange={(e) => set('free_shipping_threshold', e.target.value ? parseFloat(e.target.value) : null)}
                                    placeholder="Optional"
                                />
                            </div>
                        </div>
                    )}

                    {/* Weight-based fields */}
                    {calcType === 'weight_based' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="sm-rate-kg">Rate per kg ({getCurrency.symbol()}) <span className="text-destructive">*</span></Label>
                                <Input
                                    id="sm-rate-kg"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={values.rate_per_kg ?? ''}
                                    onChange={(e) => set('rate_per_kg', e.target.value ? parseFloat(e.target.value) : null)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="sm-threshold-w">Free Shipping Above ({getCurrency.symbol()})</Label>
                                <Input
                                    id="sm-threshold-w"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={values.free_shipping_threshold ?? ''}
                                    onChange={(e) => set('free_shipping_threshold', e.target.value ? parseFloat(e.target.value) : null)}
                                    placeholder="Optional"
                                />
                            </div>
                        </div>
                    )}

                    {/* API config notice */}
                    {calcType === 'api' && (
                        <div className="rounded-lg border border-dashed border-muted-foreground/40 bg-muted/30 p-4 text-sm text-muted-foreground">
                            Live API rates are fetched directly from the carrier. Configure API credentials in your environment settings.
                        </div>
                    )}

                    {/* Delivery days */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="sm-min-days">Min Delivery Days</Label>
                            <Input
                                id="sm-min-days"
                                type="number"
                                min="1"
                                value={values.min_delivery_days ?? ''}
                                onChange={(e) => set('min_delivery_days', e.target.value ? parseInt(e.target.value) : null)}
                                placeholder="e.g. 2"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="sm-max-days">Max Delivery Days</Label>
                            <Input
                                id="sm-max-days"
                                type="number"
                                min="1"
                                value={values.max_delivery_days ?? ''}
                                onChange={(e) => set('max_delivery_days', e.target.value ? parseInt(e.target.value) : null)}
                                placeholder="e.g. 5"
                            />
                        </div>
                    </div>

                    {/* Allowed countries */}
                    <div className="space-y-1.5">
                        <Label>Allowed Countries <span className="text-xs text-muted-foreground">(empty = worldwide)</span></Label>
                        <div className="flex gap-2">
                            <Input
                                value={countryInput}
                                onChange={(e) => setCountryInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCountry())}
                                placeholder="ISO code, e.g. US"
                                maxLength={2}
                                className="uppercase w-28"
                            />
                            <Button type="button" variant="outline" size="icon" onClick={addCountry}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        {(values.allowed_countries ?? []).length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {(values.allowed_countries ?? []).map((code) => (
                                    <Badge key={code} variant="secondary" className="gap-1 pr-1">
                                        {code}
                                        <button
                                            type="button"
                                            onClick={() => removeCountry(code)}
                                            className="rounded hover:text-destructive"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {mode === 'edit' ? 'Save Changes' : 'Create Method'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ── Smart component ───────────────────────────────────────────────────────────

export function ShippingMethodFormContainer() {
    const {
        methodDialog,
        selectedMethod,
        submitting,
        submitMethod,
        closeMethodDialog,
    } = useShippingMethodsStore();

    const initialValues = selectedMethod
        ? {
            name: selectedMethod.name,
            carrier: selectedMethod.carrier,
            is_active: selectedMethod.is_active,
            calculation_type: selectedMethod.calculation_type,
            flat_rate: selectedMethod.flat_rate ?? null,
            free_shipping_threshold: selectedMethod.free_shipping_threshold ?? null,
            rate_per_kg: selectedMethod.rate_per_kg ?? null,
            api_config: selectedMethod.api_config ?? null,
            min_delivery_days: selectedMethod.min_delivery_days ?? null,
            max_delivery_days: selectedMethod.max_delivery_days ?? null,
            allowed_countries: selectedMethod.allowed_countries ?? null,
        }
        : null;

    return (
        <ShippingMethodForm
            open={methodDialog === 'create' || methodDialog === 'edit'}
            mode={methodDialog}
            initialValues={initialValues}
            submitting={submitting}
            onSubmit={submitMethod}
            onClose={closeMethodDialog}
        />
    );
}