import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { categories } from "@/data/home";
import { CategoryCard } from "./CategoryCard";

export function CategorySection() {
  return (
    <section id="kategoriyalar" className="section-space">
      <div className="container-page">
        <div className="section-heading">
          <div><h2>Kategoriyalar</h2><p>Kerakli kitobingizni yo‘nalish bo‘yicha toping</p></div>
          <Link href="/catalog" className="section-link">Barchasi <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
        <div className="scrollbar-hide -mx-4 mt-6 flex snap-x gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0 lg:grid-cols-10">
          {categories.map((category) => <CategoryCard key={category.id} category={category} />)}
        </div>
      </div>
    </section>
  );
}
