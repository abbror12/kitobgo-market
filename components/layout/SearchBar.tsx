import { Search } from "lucide-react";

export function SearchBar({ mobile = false }: { mobile?: boolean }) {
  return (
    <form className="relative w-full" role="search" action="/catalog">
      <label htmlFor={mobile ? "mobile-search" : "desktop-search"} className="sr-only">Kitob qidirish</label>
      <input
        id={mobile ? "mobile-search" : "desktop-search"}
        name="q"
        type="search"
        placeholder="Kitob nomi, muallifi yoki kategoriya"
        className="h-12 w-full rounded-xl border border-line bg-white pl-4 pr-12 text-[15px] text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
      />
      <button type="submit" aria-label="Qidirish" className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-ink transition hover:bg-brand/10 hover:text-brand">
        <Search size={19} aria-hidden="true" />
      </button>
    </form>
  );
}
