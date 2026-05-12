import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  children?: ReactNode;
}

function Card({ children, hoverable = false, className = "", ...props }: CardProps) {
  return (
    <div
      className={[
        "bg-white rounded-xl shadow-sm border border-neutral-200/60",
        hoverable ? "hover:shadow-md transition-shadow duration-200 cursor-pointer" : "",
        className,
      ].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

function Header({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <div className={`px-6 py-4 border-b border-neutral-100 ${className}`}>{children}</div>;
}

function Body({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

function Footer({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 rounded-b-xl ${className}`}>
      {children}
    </div>
  );
}

Card.Header = Header;
Card.Body   = Body;
Card.Footer = Footer;

export default Card;
