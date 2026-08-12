import { Outlet } from 'react-router';
import { ScrollArea } from '~/components/ui/scroll-area';
import { ProductFilters } from './components/list/product-filters';
import { ProductList } from './components/list/product-list';
import { ProductFormDrawer } from './components/form/product-form-drawer';
import appNavigate from '~/lib/app-navigate';
import ProductDetailHeader from './components/detail/product-detail-header';
import ProductDeleteDialog from './components/form/product-delete-dialog';
import type { Product } from 'wle-core';

export default () => {
    const handleFormSuccess = (product: Product) => {
        appNavigate(`/products/${product.slug}`);
    }

    const handleDeleteSuccess = () => {
        appNavigate("/products");
    }

    return (
        <div className="h-full flex flex-col bg-background/80 backdrop-blur-md rounded-2xl">
            <ProductDetailHeader />

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Master: Sidebar */}
                <div className="w-96 border-r flex flex-col overflow-y-auto">
                    <div className="p-4 border-b">
                        <ProductFilters />
                    </div>
                    <div className="flex-1 p-4">
                        <ProductList />
                    </div>
                </div>

                {/* Detail: Main Content */}
                <div className="flex-1 overflow-auto">
                    <ScrollArea className="h-full">
                        <div className="p-6">
                            <Outlet />
                        </div>
                    </ScrollArea>
                </div>
            </div>

            <ProductFormDrawer onSuccess={handleFormSuccess} />
            <ProductDeleteDialog onSuccess={handleDeleteSuccess}/>
        </div>
    );
};