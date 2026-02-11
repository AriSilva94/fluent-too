import Container from "@/components/ui/Container";
import type { Dictionary } from "@/lib/getDictionary";

export default function Hero({ dict }: { dict: Dictionary }) {
  return (
    <section
      id="inicio"
      className="relative bg-cover bg-[center_top] bg-no-repeat pb-28 pt-20 md:bg-center md:pb-36 md:pt-24"
      style={{ backgroundImage: "url('/assets/img/FOTO-BANNER-TOPO.png')" }}
    >
      {/* Mobile Gradient Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-transparent md:hidden" />

      <Container className="relative text-left">
        <h1 className="max-w-xl md:max-w-2xl">
          <span className="block font-medium leading-tight text-brand-blue [font-size:var(--text-hero-main)]">
            {dict.home.hero.titleLine1}
          </span>
          <span className="block font-medium leading-tight text-brand-blue [font-size:var(--text-hero-main)]">
            {dict.home.hero.titleLine2}
          </span>
          <span className="block font-bold leading-none text-brand-orange [font-size:var(--text-hero-accent)]">
            {dict.home.hero.accent}
          </span>
        </h1>
      </Container>
    </section>
  );
}
