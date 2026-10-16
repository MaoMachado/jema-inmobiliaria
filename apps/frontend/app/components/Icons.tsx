"use client";

interface IconProps {
  name: IconName;
  className?: string;
}

export type IconName =
  | "pin"
  | "bed"
  | "bath"
  | "area"
  | "building"
  | "document"
  | "chart"
  | "edit"
  | "trash"
  | "alert"
  | "home"
  | "star"
  | "check"
  | "clock"
  | "upload";

/** Iconos de trazo (24x24, currentColor). Reemplazan los emojis de la UI. */
const ICONS: Record<IconName, string> = {
  pin: "M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z",
  bed: "M3 18v-7h18v7M3 18v2M21 18v2M3 11V8a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3M7 9.5h3M11 11v-1h4a3 3 0 0 1 3 3v1",
  bath: "M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3ZM6 12V6a2 2 0 0 1 2-2h8M7 19l-1 2M17 19l1 2",
  area: "M4 4h16v16H4z M8 8h8v8H8z",
  building:
    "M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h2a2 2 0 0 1 2 2v10M8 7h4M8 11h4M8 15h4",
  document:
    "M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7l-4-4ZM14 3v4h4M9.5 12.5h5M9.5 16h3",
  chart: "M3 3v18h18M7 15l4-4 3 3 5-6",
  edit: "M4 20h4L18 10l-4-4L4 16v4ZM14.5 5.5l4 4",
  trash:
    "M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M10 11v6M14 11v6",
  alert: "M12 3 2 21h20L12 3ZM12 10v4M12 17h.01",
  home: "M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6",
  star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z",
  check: "M4 12l5 5L20 6",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7v5l4 2",
  upload:
    "M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-.41-8.98 5.25 5.25 0 0 1 10.32-1.98 3.75 3.75 0 0 1 .99 7.4",
};

export default function Icon({ name, className = "w-4 h-4" }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.6}
      stroke="currentColor"
      aria-hidden="true"
      className={`${className} shrink-0`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[name]} />
    </svg>
  );
}
