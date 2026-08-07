"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./Faq4.module.css";

const faqs = [
  {
    id: 1,
    header: "What is Lorem Ipsum?",
    text: `Lorem Ipsum is simply dummy text of the printing and typesetting industry.`,
  },
  {
    id: 2,
    header: "Where does it come from?",
    text: `Lorem Ipsum is simply dummy text of the printing and typesetting industry.`,
  },
  {
    id: 3,
    header: "Why do we use it?",
    text: `Lorem Ipsum is simply dummy text of the printing and typesetting industry.`,
  },
  {
    id: 4,
    header: "Where can I get some?",
    text: `Lorem Ipsum is simply dummy text of the printing and typesetting industry.`,
  },
];

function AccordionItem({ faq, active, handleToggle }) {
  const contentEl = useRef(null);

  const { header, id, text } = faq;

  return (
    <div className={styles.card}>
      <header
        className={active === id ? styles.active : ""}
        onClick={() => handleToggle(id)}
      >
        <h2>{header}</h2>

        <ChevronDown className={styles.icon} />
      </header>

      <div
        ref={contentEl}
        className={`${styles.collapse} ${active === id ? styles.show : ""}`}
        style={active === id ? { height: contentEl.current?.scrollHeight } : { height: "0px" }}
      >
        <p>{text}</p>
      </div>
    </div>
  );
}

export default function Faq4() {
  const [active, setActive] = useState(null);

  const handleToggle = (id) => {
    setActive(active === id ? null : id);
  };

  return (
    <article className={styles.wrapper}>
      {faqs.map((faq) => (
        <AccordionItem
          key={faq.id}
          faq={faq}
          active={active}
          handleToggle={handleToggle}
        />
      ))}
    </article>
  );
}
