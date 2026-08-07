import componentList from "@/data/components.json";
import dataTableData from "@/data/users.json";
import * as Components from "@/components/UI";

export default async function CategoryPage({ params }) {
  const { category } = await params;

  const filteredComponents = componentList.filter((item) => item.category?.toLowerCase() === category?.toLowerCase());

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
              Component "{item.component}" is missing.
            </p>
          );
        }

        const componentData = item.component === "DataTable" ? dataTableData[0] : item;

        return (
          <section
            key={item.slug}
            style={{ marginBottom: "80px" }}
          >
            <h2>{item.name}</h2>

            <p>{item.description}</p>

            <p>Data rows: {componentData?.data?.length ?? 0}</p>

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
