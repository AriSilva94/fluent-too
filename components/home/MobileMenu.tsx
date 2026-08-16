import { cn } from "@/lib/utils";

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    navLinks: { hash: string; href: string; label: string }[];
    scrollToSection: (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => void;
    authSlot?: React.ReactNode;
}

export default function MobileMenu({
    isOpen,
    onClose,
    navLinks,
    scrollToSection,
    authSlot,
}: MobileMenuProps) {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
        scrollToSection(e, hash);
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
                        <li key={link.hash}>
                            <a
                                href={link.href}
                                onClick={(e) => handleClick(e, link.hash)}
                                className="block text-xl font-medium text-white/90 cursor-pointer"
                            >
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>
                {authSlot ? <div className="mt-8 border-t border-white/20 pt-6">{authSlot}</div> : null}
            </div>
        </div>
    );
}
