// library/category/[category]/page.js
import componentList from "@/data/components.json";
import * as Components from "@/components/UI";

export default async function CategoryPage({ params }) {
  const { category } = await params;

  // Filter using case-insensitive match
  const filteredComponents = componentList.filter((item) => item.category?.toLowerCase() === category?.toLowerCase());

  // LOGS OUTSIDE THE MAP (These print in your Terminal running npm run dev)
  console.log("-----------------------------------------");
  console.log("URL category param:", category);
  console.log("Total components in JSON:", componentList.length);
  console.log("Matched components found:", filteredComponents.length);
  if (filteredComponents.length > 0) {
    console.log("First matched component data key count:", filteredComponents[0]?.data?.length);
  }
  console.log("-----------------------------------------");

  if (filteredComponents.length === 0) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>Category: {category}</h1>
        <p>No components found matching this category in components.json.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ textTransform: "capitalize" }}>{category}</h1>

      {filteredComponents.map((item) => {
        const Component = Components[item.component];

        if (!Component) {
          return (
            <p
              key={item.slug}
              style={{ color: "red" }}
            >
              Component "{item.component}" is missing from src/components/UI/index.js
            </p>
          );
        }

        return (
          <section
            key={item.slug}
            style={{ marginBottom: "80px" }}
          >
            <h2>{item.name}</h2>
            <p>{item.description}</p>

            <Component
              data={item.data}
              config={item.config}
            />
          </section>
        );
      })}
    </div>
  );
}
