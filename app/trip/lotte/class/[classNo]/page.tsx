import { ClassInputPage } from "@/components/ClassInputPage";

export default async function LotteClassInputPage({ params }: { params: Promise<{ classNo: string }> }) {
  const { classNo } = await params;

  return <ClassInputPage dayKey="lotte" classNo={Number(classNo)} />;
}
