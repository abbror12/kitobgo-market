// Strukturali ma'lumot (schema.org). Google narx, mavjudlik va reyting yulduzchalarini
// aynan shundan o'qiydi — sahifadagi matndan emas.
//
// `<` belgisi qochiriladi: kitob tavsifi ichida tasodifan `</script>` uchrasa, u skriptni
// yopib sahifani buzardi.
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
