// library/category/[category]/page.js
import componentList from "@/data/components.json";

import * as Components from "@/components/UI";

export default async function CategoryPage({ params }) {
  const { category } = await params;

  const filteredComponents = componentList.filter((item) => item.category === category);

  return (
    <div>
      <h1>{category}</h1>

      {filteredComponents.map((item) => {
        const Component = Components[item.component];

        if (!Component) return null;

        return (
          <section
            key={item.slug}
            style={{
              marginBottom: "80px",
            }}
          >
            <h2>{item.name}</h2>

            <p>{item.description}</p>

            <Component />
          </section>
        );
      })}
    </div>
  );
}
