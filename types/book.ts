export interface Book {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  images?: string[];
  badge?: string;
  color: string;
  category: string;
  categoryName?: string;
  categories?: Array<{ id: string; name: string }>;
  author: string;
  publisher: string;
  publishedYear: number;
  pages: number;
  language: string;
  cover: string;
  isbn: string;
  inStock: boolean;
  oldPrice?: number;
}

export interface Author {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  booksCount: number;
  initials: string;
  color: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: CategoryIcon;
}

export type CategoryIcon =
  | "book-open"
  | "library"
  | "heart-handshake"
  | "flower"
  | "landmark"
  | "scroll"
  | "sparkles"
  | "baby"
  | "person-standing"
  | "book-marked";

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  text: string;
  rating: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}
