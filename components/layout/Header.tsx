import { Heart, Menu, MessageCircle, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { AccountLink } from "./AccountLink";
import { Logo } from "./Logo";
import { SearchBar } from "./SearchBar";
import { CartBadge } from "../cart/CartBadge";

const actions = [
  { label: "Sevimlilar", href: "/favorites", icon: Heart },
  { label: "Yordam", href: "/contact", icon: MessageCircle },
];

export function Header() {
  return (
    <div className="hidden bg-white md:block">
      <div className="container-page flex h-[86px] items-center gap-5">
        <Logo />
        <Link href="/catalog" className="button-primary h-12 shrink-0 px-5">
          <Menu size={19} aria-hidden="true" /> Katalog
        </Link>
        <div className="min-w-0 flex-1"><SearchBar /></div>
        <div className="flex shrink-0 items-center gap-1">
          {actions.map(({ label, href, icon: Icon }) => (
            <Link key={label} href={href} className="header-action" aria-label={label}>
              <Icon size={22} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
          <Link href="/cart" className="header-action relative" aria-label="Savatcha">
            <span className="relative">
              <ShoppingCart size={23} aria-hidden="true" />
              <CartBadge className="absolute -right-2 -top-2 grid min-h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white" />
            </span>
            <span>Savatcha</span>
          </Link>
          <AccountLink />
        </div>
      </div>
    </div>
  );
}
