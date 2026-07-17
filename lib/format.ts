export function formatPrice(price: number): string {
  return `${new Intl.NumberFormat("uz-UZ").format(price)} so‘m`;
}
