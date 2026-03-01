export const LEVELS = ["A1", "A2", "B1", "B2", "C1/C2"];
export type LevelDisplay = (typeof LEVELS)[number];

export const LEVEL_VISUALS: Record<
  LevelDisplay,
  { image: string; accent: string; surface: string }
> = {
  A1: {
    image: "/levels/a1.svg",
    accent: "from-[#ff8c42]/90 via-[#ffb347]/70 to-[#ffe3a3]/50",
    surface: "bg-[#fff7ed]",
  },
  A2: {
    image: "/levels/a2.svg",
    accent: "from-[#3b82f6]/90 via-[#60a5fa]/70 to-[#dbeafe]/55",
    surface: "bg-[#eff6ff]",
  },
  B1: {
    image: "/levels/b1.svg",
    accent: "from-[#8b5cf6]/90 via-[#a78bfa]/70 to-[#ede9fe]/55",
    surface: "bg-[#f5f3ff]",
  },
  B2: {
    image: "/levels/b2.svg",
    accent: "from-[#0f766e]/90 via-[#2dd4bf]/70 to-[#ccfbf1]/55",
    surface: "bg-[#f0fdfa]",
  },
  "C1/C2": {
    image: "/levels/c1-c2.svg",
    accent: "from-[#111827]/90 via-[#334155]/70 to-[#cbd5e1]/55",
    surface: "bg-[#f8fafc]",
  },
};
