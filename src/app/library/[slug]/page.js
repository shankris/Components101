import compList from "@/data/components.json";
import * as UI from "@/components/UI";

export default async function ComponentPage({ params }) {
  const { slug } = await params;

  const metadata = compList.find((item) => item.slug === slug);

  if (!metadata) {
    return <div>Component not found</div>;
  }

  const Component = UI[metadata.component];

  if (!Component) {
    return <div>Component not implemented</div>;
  }

  return (
    <div>
      <h1>{metadata.displayName}</h1>
      <p>{metadata.description}</p>
      <Component />
    </div>
  );
}
