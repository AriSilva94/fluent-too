import { cn } from "@/lib/utils";

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    navLinks: { href: string; label: string }[];
    scrollToSection: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}

export default function MobileMenu({
    isOpen,
    onClose,
    navLinks,
    scrollToSection,
}: MobileMenuProps) {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        scrollToSection(e, href);
        onClose();
    };

    return (
        <div
            className={cn(
                "fixed inset-0 z-40 bg-brand-orange transition-transform duration-300 lg:hidden",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}
        >
            <div className="flex h-full flex-col pt-24 px-6 pb-6">
                <ul className="space-y-4">
                    {navLinks.map((link) => (
                        <li key={link.href}>
                            <a
                                href={link.href}
                                onClick={(e) => handleClick(e, link.href)}
                                className="block text-xl font-medium text-white/90 cursor-pointer"
                            >
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
