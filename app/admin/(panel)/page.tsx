import dynamic from "next/dynamic";
import ListSkeleton from "@/components/admin/ListSkeleton";

const OverviewScreen = dynamic(() => import("@/components/admin/OverviewScreen"), { loading: () => <ListSkeleton /> });

export default function AdminHomePage() {
  return <OverviewScreen />;
}
