// components/demos/Toast1Demo.jsx

"use client";

import Toast1, { toast1 } from "@/components/UI/ToastNotification/Toast1";

import styles from "./Toast1Demo.module.css";

export default function Toast1Demo() {
  return (
    <div>
      <div className={styles.wrapper}>
        <button
          className={`${styles.button} ripple`}
          onClick={() =>
            toast1({
              title: "Success",
              message: "Changes saved successfully",
              type: "success",
            })
          }
        >
          Success
        </button>

        <button
          className={`${styles.button} ripple`}
          onClick={() =>
            toast1({
              title: "Info",
              message: "New update available",
              type: "info",
            })
          }
        >
          Info
        </button>

        <button
          className={`${styles.button} ripple`}
          onClick={() =>
            toast1({
              title: "Alert",
              message: "Your running low on Storage",
              type: "alert",
            })
          }
        >
          Alert
        </button>

        <button
          className={`${styles.button} ripple`}
          onClick={() =>
            toast1({
              title: "Warning",
              message: "Something went wrong",
              type: "warning",
            })
          }
        >
          Warning
        </button>

        <button
          className={`${styles.button} ripple`}
          onClick={() =>
            toast1({
              title: "Error",
              message: "Something seriously went wrong",
              type: "error",
            })
          }
        >
          Error
        </button>
      </div>

      <Toast1 theme='dark' />
    </div>
  );
}
