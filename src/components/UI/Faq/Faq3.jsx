"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./Faq3.module.css";
import solutions from "./faq3.json";

export default function Faq3() {
  const [open, setOpen] = useState(solutions[0].id);
  const active = solutions.find((s) => s.id === open);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* LEFT SIDE */}
        <div>
          <h2 className={styles.heading}>Solutions</h2>

          <div className={styles.accordion}>
            {solutions.map((item) => (
              <Solution
                key={item.id}
                {...item}
                open={open}
                setOpen={setOpen}
              />
            ))}
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <AnimatePresence mode='wait'>
          <motion.div
            key={active.imgSrc}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={styles.imagePanel}
            style={{
              backgroundImage: `url(${active.imgSrc})`,
            }}
          />
        </AnimatePresence>
      </div>
    </section>
  );
}

function Solution({ id, title, description, open, setOpen }) {
  const isOpen = id === open;

  return (
    <div
      className={styles.cardWrapper}
      onClick={() => setOpen(id)}
    >
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 240 : 80,
        }}
        transition={{ duration: 0.3 }}
        className={styles.card}
      >
        <div>
          <div className={styles.title}>{title}</div>

          <AnimatePresence>
            {isOpen && (
              <motion.p
                className={styles.description}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {description}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {isOpen && (
          <button className={styles.button}>
            Learn More
            <ArrowRight size={18} />
          </button>
        )}
      </motion.div>
    </div>
  );
}
