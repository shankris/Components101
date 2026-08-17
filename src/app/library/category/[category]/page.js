import componentList from "@/data/components.json";

import dataTableData from "@/data/users.json";
import salaryTableData from "@/data/salary-table.json";

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
    <div>
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

        // --------------------------------------------------
        // DataTable demo data
        // --------------------------------------------------

        let componentData = item;

        if (item.slug === "DataTable") {
          componentData = dataTableData[0];
        }

        if (item.slug === "salary-table") {
          componentData = salaryTableData[0];
        }

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
              filters={componentData.filters}
            />
          </section>
        );
      })}
    </div>
  );
}
