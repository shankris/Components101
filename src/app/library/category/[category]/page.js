import componentList from "@/data/components.json";
import dataTableData from "@/data/users.json";
import * as Components from "@/components/UI";

export default async function CategoryPage({ params }) {
  const { category } = await params;

  const filteredComponents = componentList.filter((item) => item.category?.toLowerCase() === category?.toLowerCase());

  console.log("-----------------------------------------");
  console.log("URL category param:", category);
  console.log("Total components in JSON:", componentList.length);
  console.log("Matched components found:", filteredComponents.length);
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

        // Temporary demo data for DataTable
        const componentData = item.component === "DataTable" ? dataTableData[0] : item;

        return (
          <section
            key={item.slug}
            style={{ marginBottom: "80px" }}
          >
            <h2>{item.name}</h2>

            <p>{item.description}</p>

            <Component
              data={componentData.data}
              config={componentData.config}
            />
          </section>
        );
      })}
    </div>
  );
}
