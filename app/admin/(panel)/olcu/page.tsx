import dynamic from "next/dynamic";
import ListSkeleton from "@/components/admin/ListSkeleton";

const MeasurementsScreen = dynamic(() => import("@/components/admin/MeasurementsScreen"), { loading: () => <ListSkeleton /> });

export default function MeasurementsPage() {
  return <MeasurementsScreen />;
}
