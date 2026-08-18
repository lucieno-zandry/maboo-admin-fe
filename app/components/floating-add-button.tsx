import { Plus } from "lucide-react";
import { Button } from "wle-ui-package";

export function FloatingAddButton({ onClick, label }: { onClick: () => void; label: string }) {
    return (
        <Button
            onClick={onClick}
            // We use 'w-14' as the base (square) and 'hover:w-auto' for the expansion
            // 'min-w-[56px]' ensures it stays a perfect circle/square when collapsed
            className="fixed bottom-8 right-8 z-50 group flex items-center justify-center h-14 min-w-[56px] px-4  
                       hover:scale-105 active:scale-95 border border-border/50"
        >
            <div className="flex items-center justify-center relative">
                <Plus size={24} className="transition-transform duration-500 group-hover:rotate-90 flex-shrink-0" />

                <span className="max-w-0 overflow-hidden whitespace-nowrap font-bold transition-all duration-500 
                                 group-hover:max-w-[200px] group-hover:ml-3 opacity-0 group-hover:opacity-100">
                    {label}
                </span>
            </div>
        </Button>
    );
}