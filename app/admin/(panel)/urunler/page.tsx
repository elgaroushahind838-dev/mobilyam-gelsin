import dynamic from "next/dynamic";
import ListSkeleton from "@/components/admin/ListSkeleton";

const ProductsScreen = dynamic(() => import("@/components/admin/ProductsScreen"), { loading: () => <ListSkeleton /> });

export default function ProductsPage() {
  return <ProductsScreen />;
}
