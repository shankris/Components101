"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./ImageAccordion.module.css";

import image1 from "./images/6.jpg";
import image2 from "./images/2.jpg";
import image3 from "./images/3.jpg";
import image4 from "./images/4.jpg";
import image5 from "./images/5.jpg";

const coolImages = [
  {
    header: "Canada",
    image: image2,
    text: "Image description",
  },
  {
    header: "New Zealand",
    image: image1,
    text: "Image description",
  },
  {
    header: "Indonesia",
    image: image4,
    text: "Image description",
  },
  {
    header: "South Africa",
    image: image5,
    text: "Image description",
  },
  {
    header: "Spain",
    image: image3,
    text: "Image description",
  },
];

export default function ImageAccordion() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className={styles.wrapper}>
      {coolImages.map((item, index) => (
        <article
          key={index}
          className={`${styles.item} ${activeIndex === index ? styles.active : ""}`}
          onClick={() => setActiveIndex(index)}
        >
          <div className={styles.imageWrapper}>
            <Image
              src={item.image}
              alt={item.header}
              fill
              className={styles.image}
            />
          </div>

          <div className={styles.content}>
            <h2 className={styles.title}>{item.header}</h2>
            <p className={styles.text}>{item.text}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
