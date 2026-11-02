import dynamic from "next/dynamic";
import ListSkeleton from "@/components/admin/ListSkeleton";

const StatsScreen = dynamic(() => import("@/components/admin/StatsScreen"), { loading: () => <ListSkeleton /> });

export default function StatsPage() {
  return <StatsScreen />;
}
