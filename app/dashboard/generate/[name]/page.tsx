import GeneratedDataClient from "@/app/components/dashboard/GeneratedData";
import { Metadata } from "next";

interface PageProps {
  params: { name: string };
  searchParams: { userId?: string };
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  // Await the params before destructuring.
  const params = await Promise.resolve(props.params);
  const { name } = params;
  const title = name ? `StorySnatcher - Generated Data - ${name}` : "Generated Data Detail";
  return { title };
}

export default async function GeneratedDataPage(props: PageProps) {
  // Await the params here as well.
  const params = await Promise.resolve(props.params);
  const { name } = params;
  return <GeneratedDataClient data={name} />;
}
