import dynamic from "next/dynamic";
import ListSkeleton from "@/components/admin/ListSkeleton";

const OrdersScreen = dynamic(() => import("@/components/admin/OrdersScreen"), { loading: () => <ListSkeleton /> });

export default function ActiveOrdersPage() {
  return <OrdersScreen status="active" />;
}
