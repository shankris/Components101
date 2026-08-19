import componentList from "@/data/components.json";
import usersData from "@/data/users.json";
import marketData from "@/data/market.json";
import * as Components from "@/components/UI";

import { userTableConfig, userTableFilters } from "@/components/UI/Tables/DataTableConfig";

export default async function CategoryPage({ params }) {
  const { category } = await params;

  const dataSources = {
    users: usersData,
    market: marketData.stocks,
  };

  // console.log("usersData:", usersData);
  // console.log("usersData length:", usersData.length);
  console.log("DataTable config:", userTableConfig);

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

        // ----------------------------------------------
        // Get data from the configured data source
        // ----------------------------------------------

        const componentData = {
          ...item,
          data: dataSources[item.dataSource] || [],
        };

        let config = item.config;
        let filters = item.filters;

        if (item.component === "DataTable") {
          config = userTableConfig.columns;
          filters = item.filters ? userTableFilters : [];
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
              config={config}
              filters={filters}
            />
          </section>
        );
      })}
    </div>
  );
}
