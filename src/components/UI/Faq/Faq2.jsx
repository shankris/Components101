"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

import data from "./faq2.json";
import styles from "./Faq2.module.css";

const Faq2 = () => {
  const [selected, setSelected] = useState(data.tabs[0]);

  return (
    <section className={styles.section}>
      <div className={styles.headingWrapper}>
        <span className={styles.subheading}>Let's answer some questions</span>
        <div className={styles.heading}>FAQs</div>
      </div>

      <div className={styles.tabs}>
        {data.tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelected(tab)}
            className={`${styles.tabButton} ${selected === tab ? styles.activeTab : ""}`}
          >
            {selected === tab && (
              <motion.span
                layoutId='tabHighlight'
                className={styles.tabHighlight}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span style={{ position: "relative", zIndex: 2 }}>{tab}</span>
          </button>
        ))}
      </div>

      <div className={styles.questionsWrapper}>
        <AnimatePresence mode='wait'>
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
          >
            {data.questions[selected].map((q, i) => (
              <Question
                key={i}
                {...q}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={styles.glow} />
    </section>
  );
};

const Question = ({ question, answer }) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div className={`${styles.questionCard} ${open ? styles.questionOpen : ""}`}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={styles.questionButton}
      >
        <span className={styles.questionText}>{question}</span>

        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Plus size={22} />
        </motion.span>
      </button>

      <motion.div
        initial={false}
        animate={{
          height: open ? "auto" : 0,
          opacity: open ? 1 : 0,
          marginTop: open ? 16 : 0,
        }}
        transition={{
          height: { type: "spring", stiffness: 260, damping: 25 },
          opacity: { duration: 0.2 },
        }}
        className={styles.answerWrapper}
      >
        <div className={styles.answer}>{answer}</div>
      </motion.div>
    </motion.div>
  );
};

export default Faq2;
