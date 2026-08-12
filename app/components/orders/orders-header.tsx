import { Button } from "~/components/ui/button";

export type OrdersHeaderViewProps = {
    onExport?: () => void;
};

export function OrdersHeaderView({ onExport }: OrdersHeaderViewProps) {
    return (
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Orders</h1>
            <Button onClick={onExport}>Export</Button>
        </div>
    );
}

// If no special logic, we can just export the view as default
export default function OrdersHeader() {
    const handleExport = () => {
        // TODO: implement export
    };
    return <OrdersHeaderView onExport={handleExport} />;
}