import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop({ scrollContainer }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = scrollContainer?.current;
    if (!el) return;
    const onScroll = () => setVisible(el.scrollTop > 300);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollContainer]);

  if (!visible) return null;

  return (
    <button
      onClick={() => scrollContainer?.current?.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Başa dön"
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-10 h-10 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.97] text-white rounded-full shadow-lg transition-all duration-200 animate-pop-in"
    >
      <ArrowUp size={18} />
    </button>
  );
}
