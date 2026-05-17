import { ClassInputPage } from "@/components/ClassInputPage";

export default async function NantaClassInputPage({ params }: { params: Promise<{ classNo: string }> }) {
  const { classNo } = await params;

  return <ClassInputPage dayKey="nanta" classNo={Number(classNo)} />;
}
