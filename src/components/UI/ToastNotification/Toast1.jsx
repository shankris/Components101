// Toast1.jsx

"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CircleCheckBig, CircleX, OctagonAlert, TriangleAlert, Loader, Info } from "lucide-react";
import styles from "./Toast1.module.css";

let toastTrigger;

/*
|--------------------------------------------------------------------------
| Toast1 Options
|--------------------------------------------------------------------------
|
| title         : string
|                 default: ""
|
| message       : string
|                 default: ""
|
| type          : success | error | warning | alert | info | loading
|                 default: "info"
|
| duration      : number | Infinity
|                 default: 5000
|
| showIcon      : boolean
|                 default: true
|
| closable      : boolean
|                 default: true
|
| showProgress  : boolean
|                 default: true
|
|--------------------------------------------------------------------------
| Example
|--------------------------------------------------------------------------
|
| toast1({
|   title: "Upload Complete",
|   message: "All files uploaded successfully",
|   type: "success",
|   duration: 4000,
|   showIcon: true,
|   closable: true,
|   showProgress: true,
| });
|
|--------------------------------------------------------------------------
| Notes
|--------------------------------------------------------------------------
|
| duration: Infinity
| => keeps toast open until manually closed
|
|--------------------------------------------------------------------------
*/

const icons = {
  success: <CircleCheckBig size={40} />,
  error: <CircleX size={40} />,
  warning: <TriangleAlert size={40} />,
  alert: <OctagonAlert size={40} />,
  info: <Info size={40} />,
  loading: (
    <Loader
      size={40}
      className={styles.loader}
    />
  ),
};

export function toast1(options = {}) {
  if (!toastTrigger) return;

  toastTrigger({
    title: options.title ?? "",
    message: options.message ?? "",
    type: options.type ?? "info",
    duration: options.duration ?? 5000,
    showIcon: options.showIcon ?? true,
    closable: options.closable ?? true,
    showProgress: options.showProgress ?? true,
  });
}

export default function Toast1({ theme = "light" }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  useEffect(() => {
    toastTrigger = (toast) => {
      const id = idRef.current++;

      setToasts((prev) => [...prev, { ...toast, id }]);

      if (toast.duration !== Infinity) {
        setTimeout(() => {
          removeToast(id);
        }, toast.duration);
      }
    };

    return () => {
      toastTrigger = null;
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <div className={`${styles.container} ${styles[theme]}`}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            layout
            key={toast.id}
            className={`${styles.toast} ${styles[toast.type]}`}
            initial={{
              opacity: 0,
              x: 100,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              x: 100,
              scale: 0.9,
            }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
          >
            <div className={styles.left}>
              {toast.showIcon && <div className={styles.icon}>{icons[toast.type]}</div>}

              <div className={styles.content}>
                <div className={styles.title}>{toast.title}</div>

                {toast.message && <div className={styles.message}>{toast.message}</div>}
              </div>
            </div>

            {toast.closable && (
              <button
                className={styles.closeBtn}
                onClick={() => removeToast(toast.id)}
              >
                ✕
              </button>
            )}

            {toast.showProgress && toast.duration !== Infinity && (
              <div
                className={styles.progress}
                style={{
                  animationDuration: `${toast.duration}ms`,
                }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
