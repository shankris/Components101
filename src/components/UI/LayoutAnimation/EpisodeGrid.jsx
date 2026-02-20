"use client";

import { useState } from "react";
import styles from "./EpisodeGrid.module.css";
import data from "./episodes.json";

export default function EpisodeGrid() {
  const [activeId, setActiveId] = useState(null);
  const [animating, setAnimating] = useState(false);

  const handleOpen = (id) => {
    if (animating) return;
    setAnimating(true);
    setActiveId(id);
    setTimeout(() => setAnimating(false), 1000);
  };

  const handleClose = () => {
    if (animating) return;
    setAnimating(true);
    setActiveId(null);
    setTimeout(() => setAnimating(false), 1000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        {/* EPISODE GRID */}
        <div className={styles.rows}>
          {data.episodes.map((ep) => (
            <div
              key={ep.id}
              className={[styles.cell, activeId === ep.id && styles.active, activeId && activeId !== ep.id && styles.cellFade].filter(Boolean).join(" ")}
              onClick={() => handleOpen(ep.id)}
            >
              <div className={styles.info}>
                <p className={styles.ep}>
                  EP <span>{ep.ep}</span>
                </p>
              </div>

              <div className={styles.info}>
                <p className={styles.title}>{ep.title}</p>
              </div>

              <div className={styles.info}>
                <div className={styles.sign} />
              </div>

              <div className={`${styles.info} ${styles.time}`}>
                <p>{ep.duration}</p>
              </div>

              <div className={styles.full}>
                <h1>{ep.title}</h1>
                <p>{ep.summary}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CONTENT PANELS */}
        {data.episodes.map((ep) => (
          <div
            key={ep.id}
            className={[styles.content, activeId === ep.id && styles.showContent].filter(Boolean).join(" ")}
          >
            <div className={styles.contentWrapper}>
              <div className={styles.contentInner}>
                <h2>SYNOPSIS – {ep.synopsisTime}</h2>
                <p>{ep.summary}</p>

                <h2>SHOW NOTES</h2>
                <ul>
                  {ep.notes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}

        {/* CLOSE BUTTON */}
        <div
          className={[styles.close, activeId && styles.closeActive].filter(Boolean).join(" ")}
          onClick={handleClose}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} />
          ))}
        </div>

        {/* TITLE */}
        <div className={styles.mainTitle}>
          <h1>
            {data.title.heading}
            <br />
            <span>{data.title.highlight}</span>
          </h1>
          <p>{data.title.subtitle}</p>
        </div>
      </div>
    </div>
  );
}
