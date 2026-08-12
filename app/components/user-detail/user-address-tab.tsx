import { useUserDetailStore } from "~/hooks/use-user-detail-store";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { MapPin, Plus, MoreVertical, Edit2, Trash2, Star } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { Address } from "wle-core";

interface AddressesViewProps {
    addresses: Address[];
}

// Helper to format full address for display
function formatAddress(addr: Address): string {
    const parts = [addr.line1];
    if (addr.line2) parts.push(addr.line2);
    parts.push(addr.city);
    if (addr.state) parts.push(addr.state);
    parts.push(addr.postal_code);
    parts.push(addr.country);
    return parts.filter(Boolean).join(", ");
}

function AddressesView({ addresses }: AddressesViewProps) {
    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b p-4 sm:p-6 bg-muted/50">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    Saved Addresses
                </CardTitle>
                <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> Add Address
                </Button>
            </CardHeader>
            <div className="flex flex-col">
                {addresses.map((address, index) => (
                    <div
                        key={address.id}
                        className={`flex items-start gap-4 p-4 sm:p-6 transition-colors hover:bg-muted/30 ${index !== addresses.length - 1 ? "border-b" : ""
                            }`}
                    >
                        <div className="mt-1 shrink-0 p-2 bg-muted rounded-full text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-sm">{address.recipient_name}</p>
                                {address.is_default && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                        Default Delivery
                                    </Badge>
                                )}
                                {address.label && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                        {address.label}
                                    </Badge>
                                )}
                            </div>
                            <div className="text-sm text-muted-foreground space-y-0.5">
                                <p>{formatAddress(address)}</p>
                            </div>
                            <p className="text-xs font-medium text-muted-foreground/80 mt-2">
                                📞 {address.phone}
                                {address.phone_alt && ` (alt: ${address.phone_alt})`}
                            </p>
                        </div>

                        <div className="shrink-0">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem>
                                        <Edit2 className="mr-2 h-4 w-4" /> Edit Address
                                    </DropdownMenuItem>
                                    {!address.is_default && (
                                        <DropdownMenuItem>
                                            <Star className="mr-2 h-4 w-4" /> Set as Default
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Address
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

export function AddressesTab() {
    const { user } = useUserDetailStore();
    if (!user?.addresses?.length) return null;
    return <AddressesView addresses={user.addresses} />;
}