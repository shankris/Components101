// components/demos/Toast1Demo.jsx

"use client";

import Toast1, { toast1 } from "@/components/UI/ToastNotification/Toast1";

import styles from "./Toast1Demo.module.css";

export default function Toast1Demo() {
  return (
    <div>
      <h2>Toast Demo</h2>

      <div className={styles.wrapper}>
        <button
          className={styles.button}
          onClick={() =>
            toast1({
              title: "Success",
              message: "Changes saved successfully",
              type: "success",
            })
          }
        >
          Success Toast
        </button>

        <button
          className={styles.button}
          onClick={() =>
            toast1({
              title: "Error",
              message: "Something went wrong",
              type: "error",
            })
          }
        >
          Error Toast
        </button>

        <button
          className={styles.button}
          onClick={() =>
            toast1({
              title: "Info",
              message: "New update available",
              type: "info",
            })
          }
        >
          Info Toast
        </button>
      </div>

      <Toast1 theme='dark' />
    </div>
  );
}
