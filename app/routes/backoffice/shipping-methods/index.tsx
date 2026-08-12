import { useEffect } from 'react';
import { useShippingMethodsStore } from '~/hooks/use-shipping-methods-store';
import { ShippingMethodFormContainer } from '~/components/shipping-methods/shipping-method-form';
import { ShippingRateFormContainer } from '~/components/shipping-methods/shipping-rate-form';
import {
    CARRIER_LABELS,
    CALCULATION_TYPE_LABELS,
    formatDeliveryDays,
    formatCountries,
    formatWeightRange,
    getMethodCalculationSummary,
} from '~/lib/shipping-methods-helpers';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Skeleton } from '~/components/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '~/components/ui/table';
import {
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Package,
    Truck,
    Globe,
    ChevronRight,
    Loader2,
    Map,
} from 'lucide-react';
import formatPrice from '~/lib/format-price';
import type { ShippingMethod, ShippingRate } from 'wle-core';

// ── Carrier badge helper ──────────────────────────────────────────────────────

function CarrierBadge({ carrier }: { carrier: ShippingMethod['carrier'] }) {
    const variants: Record<ShippingMethod['carrier'], string> = {
        custom: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        fedex: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
        colissimo: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${variants[carrier]}`}>
            {CARRIER_LABELS[carrier]}
        </span>
    );
}

// ── Methods list (left panel) ─────────────────────────────────────────────────

interface MethodsListProps {
    methods: ShippingMethod[];
    selectedMethod: ShippingMethod | null;
    loading: boolean;
    onSelect: (method: ShippingMethod) => void;
    onEdit: (method: ShippingMethod) => void;
    onDelete: (id: number) => void;
    onToggleActive: (method: ShippingMethod) => void;
    onCreateNew: () => void;
}

function MethodsList({
    methods,
    selectedMethod,
    loading,
    onSelect,
    onEdit,
    onDelete,
    onToggleActive,
    onCreateNew,
}: MethodsListProps) {
    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
                <div>
                    <h2 className="font-semibold text-sm">Shipping Methods</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{methods.length} configured</p>
                </div>
                <Button size="sm" onClick={onCreateNew} className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" />
                    New
                </Button>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1">
                {loading ? (
                    <div className="space-y-px p-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="p-3 rounded-lg">
                                <Skeleton className="h-4 w-3/4 mb-2" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : methods.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center px-6">
                        <Truck className="h-8 w-8 text-muted-foreground/40 mb-3" />
                        <p className="text-sm text-muted-foreground">No shipping methods yet.</p>
                        <Button variant="link" size="sm" onClick={onCreateNew} className="mt-1">
                            Create your first method
                        </Button>
                    </div>
                ) : (
                    <div className="p-2 space-y-px">
                        {methods.map((method) => {
                            const isSelected = selectedMethod?.id === method.id;
                            return (
                                <button
                                    key={method.id}
                                    onClick={() => onSelect(method)}
                                    className={`w-full text-left rounded-lg px-3 py-3 transition-colors group flex items-start gap-3 ${isSelected
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted'
                                        }`}
                                >
                                    <div className={`mt-0.5 rounded-md p-1.5 shrink-0 ${isSelected ? 'bg-primary-foreground/20' : 'bg-muted'
                                        }`}>
                                        <Package className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 justify-between">
                                            <span className="text-sm font-medium truncate">{method.name}</span>
                                            <div className="flex items-center gap-1 shrink-0">
                                                {/* Status dot */}
                                                <span className={`h-1.5 w-1.5 rounded-full ${method.is_active
                                                        ? isSelected ? 'bg-green-300' : 'bg-green-500'
                                                        : isSelected ? 'bg-red-300' : 'bg-red-400'
                                                    }`} />
                                                {/* Action menu */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className={`h-6 w-6 opacity-0 group-hover:opacity-100 ${isSelected ? 'text-primary-foreground hover:bg-primary-foreground/20' : ''
                                                                }`}
                                                        >
                                                            <MoreHorizontal className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-44">
                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(method); }}>
                                                            <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggleActive(method); }}>
                                                            {method.is_active ? 'Deactivate' : 'Activate'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={(e) => { e.stopPropagation(); onDelete(method.id); }}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                        <div className={`text-xs mt-1 ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                            {CARRIER_LABELS[method.carrier]} · {CALCULATION_TYPE_LABELS[method.calculation_type]}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Method detail (right panel) ───────────────────────────────────────────────

interface MethodDetailProps {
    method: ShippingMethod;
    rates: ShippingRate[];
    loadingRates: boolean;
    onEditMethod: (method: ShippingMethod) => void;
    onAddRate: () => void;
    onEditRate: (rate: ShippingRate) => void;
    onDeleteRate: (rateId: number) => void;
}

function MethodDetail({
    method,
    rates,
    loadingRates,
    onEditMethod,
    onAddRate,
    onEditRate,
    onDeleteRate,
}: MethodDetailProps) {
    return (
        <div className="flex flex-col h-full overflow-y-auto">
            {/* Method header */}
            <div className="px-6 py-5 border-b">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-lg font-semibold">{method.name}</h1>
                            <Badge variant={method.is_active ? 'default' : 'secondary'} className="text-xs">
                                {method.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CarrierBadge carrier={method.carrier} />
                            <span>·</span>
                            <span>{CALCULATION_TYPE_LABELS[method.calculation_type]}</span>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onEditMethod(method)} className="gap-1.5 shrink-0">
                        <Pencil className="h-3.5 w-3.5" />
                        Edit Method
                    </Button>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4 mt-5">
                    <div className="rounded-lg bg-muted/50 px-4 py-3">
                        <div className="text-xs text-muted-foreground mb-1">Rate</div>
                        <div className="text-sm font-semibold">{getMethodCalculationSummary(method)}</div>
                    </div>
                    <div className="rounded-lg bg-muted/50 px-4 py-3">
                        <div className="text-xs text-muted-foreground mb-1">Delivery</div>
                        <div className="text-sm font-semibold">
                            {formatDeliveryDays(method.min_delivery_days, method.max_delivery_days)}
                        </div>
                    </div>
                    <div className="rounded-lg bg-muted/50 px-4 py-3">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <Globe className="h-3 w-3" /> Countries
                        </div>
                        <div className="text-sm font-semibold">
                            {formatCountries(method.allowed_countries)}
                        </div>
                    </div>
                </div>

                {method.free_shipping_threshold != null && (
                    <div className="mt-3 text-xs text-muted-foreground bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 rounded-md px-3 py-1.5 inline-flex">
                        Free shipping on orders above {formatPrice(method.free_shipping_threshold)}
                    </div>
                )}
            </div>

            {/* Rates table */}
            <div className="flex-1 px-6 py-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="font-semibold text-sm">Rate Rules</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Country and weight-based overrides
                        </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={onAddRate} className="gap-1.5">
                        <Plus className="h-3.5 w-3.5" />
                        Add Rate
                    </Button>
                </div>

                {loadingRates ? (
                    <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full" />
                        ))}
                    </div>
                ) : rates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center border border-dashed rounded-xl py-12 text-center">
                        <Map className="h-7 w-7 text-muted-foreground/40 mb-3" />
                        <p className="text-sm text-muted-foreground">No rate rules configured.</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            The method's base rate applies to all destinations.
                        </p>
                        <Button variant="link" size="sm" onClick={onAddRate} className="mt-2">
                            Add your first rate rule
                        </Button>
                    </div>
                ) : (
                    <div className="rounded-xl border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40">
                                    <TableHead className="text-xs">Country</TableHead>
                                    <TableHead className="text-xs">City Pattern</TableHead>
                                    <TableHead className="text-xs">Weight Range</TableHead>
                                    <TableHead className="text-xs">Base Rate</TableHead>
                                    <TableHead className="text-xs">Per kg</TableHead>
                                    <TableHead className="w-10" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rates.map((rate) => (
                                    <TableRow key={rate.id} className="group">
                                        <TableCell>
                                            {rate.country_code === '*' ? (
                                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Globe className="h-3 w-3" /> Worldwide
                                                </span>
                                            ) : (
                                                <Badge variant="outline" className="text-xs font-mono">
                                                    {rate.country_code}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {rate.city_pattern || '—'}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {formatWeightRange(rate.min_weight_kg, rate.max_weight_kg)}
                                        </TableCell>
                                        <TableCell className="text-sm font-medium">
                                            {formatPrice(rate.rate)}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {rate.rate_per_kg != null ? formatPrice(rate.rate_per_kg) : '—'}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 opacity-0 group-hover:opacity-100"
                                                    >
                                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-36">
                                                    <DropdownMenuItem onClick={() => onEditRate(rate)}>
                                                        <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onSelect={(e) => e.preventDefault()}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete rate rule?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This rate rule will be permanently removed. This cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    onClick={() => onDeleteRate(rate.id)}
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Empty state (no method selected) ─────────────────────────────────────────

function NoMethodSelected() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center px-8 text-muted-foreground">
            <ChevronRight className="h-8 w-8 mb-3 opacity-30" />
            <p className="text-sm font-medium">Select a shipping method</p>
            <p className="text-xs mt-1">Choose a method from the list to view and manage its rate rules.</p>
        </div>
    );
}

// ── Page layout (dumb) ────────────────────────────────────────────────────────

interface ShippingMethodsPageProps {
    methods: ShippingMethod[];
    rates: ShippingRate[];
    selectedMethod: ShippingMethod | null;
    loadingMethods: boolean;
    loadingRates: boolean;
    onSelectMethod: (method: ShippingMethod) => void;
    onCreateMethod: () => void;
    onEditMethod: (method: ShippingMethod) => void;
    onDeleteMethod: (id: number) => void;
    onToggleMethodActive: (method: ShippingMethod) => void;
    onAddRate: () => void;
    onEditRate: (rate: ShippingRate) => void;
    onDeleteRate: (rateId: number) => void;
}

function ShippingMethodsPage({
    methods,
    rates,
    selectedMethod,
    loadingMethods,
    loadingRates,
    onSelectMethod,
    onCreateMethod,
    onEditMethod,
    onDeleteMethod,
    onToggleMethodActive,
    onAddRate,
    onEditRate,
    onDeleteRate,
}: ShippingMethodsPageProps) {
    return (
        <div className="flex h-full overflow-hidden bg-background/80 backdrop-blur-md rounded-2xl">
            {/* Left panel — Methods list */}
            <aside className="w-72 shrink-0 border-r flex flex-col">
                <MethodsList
                    methods={methods}
                    selectedMethod={selectedMethod}
                    loading={loadingMethods}
                    onSelect={onSelectMethod}
                    onEdit={onEditMethod}
                    onDelete={onDeleteMethod}
                    onToggleActive={onToggleMethodActive}
                    onCreateNew={onCreateMethod}
                />
            </aside>

            {/* Right panel — Detail */}
            <main className="flex-1 overflow-hidden">
                {selectedMethod ? (
                    <MethodDetail
                        method={selectedMethod}
                        rates={rates}
                        loadingRates={loadingRates}
                        onEditMethod={onEditMethod}
                        onAddRate={onAddRate}
                        onEditRate={onEditRate}
                        onDeleteRate={onDeleteRate}
                    />
                ) : (
                    <NoMethodSelected />
                )}
            </main>

            {/* Dialogs */}
            <ShippingMethodFormContainer />
            <ShippingRateFormContainer />
        </div>
    );
}

// ── Smart container ───────────────────────────────────────────────────────────

export default function ShippingMethodsIndex() {
    const {
        methods,
        rates,
        selectedMethod,
        loadingMethods,
        loadingRates,
        loadMethods,
        selectMethod,
        openCreateMethod,
        openEditMethod,
        removeMethod,
        toggleMethodActive,
        openCreateRate,
        openEditRate,
        removeRate,
    } = useShippingMethodsStore();

    useEffect(() => {
        loadMethods();
    }, []);

    return (
        <ShippingMethodsPage
            methods={methods}
            rates={rates}
            selectedMethod={selectedMethod}
            loadingMethods={loadingMethods}
            loadingRates={loadingRates}
            onSelectMethod={selectMethod}
            onCreateMethod={openCreateMethod}
            onEditMethod={openEditMethod}
            onDeleteMethod={removeMethod}
            onToggleMethodActive={toggleMethodActive}
            onAddRate={openCreateRate}
            onEditRate={openEditRate}
            onDeleteRate={removeRate}
        />
    );
}