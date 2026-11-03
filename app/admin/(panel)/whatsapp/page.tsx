import dynamic from "next/dynamic";
import ListSkeleton from "@/components/admin/ListSkeleton";

const WhatsAppScreen = dynamic(() => import("@/components/admin/WhatsAppScreen"), { loading: () => <ListSkeleton /> });

export default function WhatsAppPage() {
  return <WhatsAppScreen />;
}
