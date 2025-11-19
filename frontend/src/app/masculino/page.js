import CategoryPageTemplate from "../components/CategoryPageTemplate";

export default function MasculinoPage() {
  return (
    <CategoryPageTemplate
      endpoint="/api/produtos_masculina/"
      category="masculino"
      title="Moda Masculina"
    />
  );
}
