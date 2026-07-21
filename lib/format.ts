export function formatPrice(price: number): string {
  return `${new Intl.NumberFormat("uz-UZ").format(price)} so‘m`;
}

export function isExternalImage(src: string): boolean {
  return src.startsWith("https://") || src.startsWith("http://");
}
