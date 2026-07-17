"use client";

import { useEffect, useState } from "react";

export function CartBadge({ className }: { className: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => {
      const items = JSON.parse(localStorage.getItem("kitobgo-cart") ?? "[]") as Array<{ quantity: number }>;
      setCount(items.reduce((sum, item) => sum + item.quantity, 0));
    };
    update();
    window.addEventListener("kitobgo-cart-updated", update);
    window.addEventListener("storage", update);
    return () => { window.removeEventListener("kitobgo-cart-updated", update); window.removeEventListener("storage", update); };
  }, []);

  return count > 0 ? <span className={className}>{count}</span> : null;
}
