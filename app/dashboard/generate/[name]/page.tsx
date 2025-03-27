import GeneratedDataClient from "@/app/components/dashboard/GeneratedData";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  return {
    title: name
      ? `StorySnatcher - Generated Data - ${name}`
      : "Generated Data Detail",
  };
}

export default async function GeneratedDataPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  return <GeneratedDataClient data={name} />;
}
