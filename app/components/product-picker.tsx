import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { X, Search } from "lucide-react";
import { useEffect, useState } from "react";
import useDebounce from "~/hooks/use-debounce";
import { getProducts } from "~/api/http-requests";
import type { Product } from "wle-core";

interface Props {
    value: number[]; // product IDs
    onChange: (ids: number[]) => void;
    multiple?: boolean;
}

export function ProductPicker({ value, onChange, multiple = true }: Props) {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const debouncedSearch = useDebounce(searchTerm, 300);

    useEffect(() => {
        if (!debouncedSearch) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        getProducts({ search: debouncedSearch })
            .then(res => setSearchResults(res.data?.data ?? []))
            .finally(() => setIsSearching(false));
    }, [debouncedSearch]);

    const addProduct = (product: Product) => {
        if (value.includes(product.id)) return;

        if (multiple) {
            onChange([...value, product.id]);
        } else {
            onChange([product.id])
        }
    };

    const removeProduct = (id: number) => {
        onChange(value.filter(pid => pid !== id));
    };

    return (
        <div className="border-t pt-3">
            <Label className="text-sm font-medium">Featured products</Label>
            <p className="text-xs text-muted-foreground mb-2">
                Search and add products to display. They will appear in the order you add them.
            </p>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search products by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                />
            </div>

            {/* Results */}
            {searchTerm && (
                <div className="mt-2 border rounded-md max-h-48 overflow-y-auto">
                    {isSearching && (
                        <p className="p-2 text-xs text-center">Loading...</p>
                    )}

                    {!isSearching && searchResults.length === 0 && (
                        <p className="p-2 text-xs text-center text-muted-foreground">
                            No products found
                        </p>
                    )}

                    {searchResults.map(product => (
                        <button
                            key={product.id}
                            type="button"
                            onClick={() => addProduct(product)}
                            className="w-full text-left px-3 py-2 hover:bg-muted flex justify-between items-center text-sm"
                            disabled={value.includes(product.id)}
                        >
                            <span>{product.title}</span>
                            {value.includes(product.id) && (
                                <span className="text-xs text-green-600">
                                    Added
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Selected */}
            {value.length > 0 && (
                <div className="mt-4 space-y-2">
                    <Label className="text-xs font-medium">
                        Selected (in display order)
                    </Label>

                    {value.map((id, idx) => (
                        <div
                            key={id}
                            className="flex items-center justify-between bg-background border rounded-md px-3 py-2 text-sm"
                        >
                            <span className="text-muted-foreground text-xs mr-2">
                                {idx + 1}.
                            </span>

                            <span className="flex-1">
                                Product #{id}
                            </span>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive"
                                onClick={() => removeProduct(id)}
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    ))}

                    <p className="text-[10px] text-muted-foreground">
                        Drag to reorder not yet supported – delete and re-add to change order.
                    </p>
                </div>
            )}
        </div>
    );
}