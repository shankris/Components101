"use client";

import { useEffect } from "react";
import "./Ripple.css";

export default function Ripple() {
  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target.closest(".ripple");

      if (!target) return;

      const rect = target.getBoundingClientRect();

      const ripple = document.createElement("span");

      const size = Math.max(rect.width, rect.height);

      ripple.className = "ripple-effect";

      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;

      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;

      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

      target.appendChild(ripple);

      ripple.addEventListener("animationend", () => {
        ripple.remove();
      });
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return null;
}
