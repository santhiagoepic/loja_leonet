import CategoryPageTemplate from "../components/CategoryPageTemplate";

export default function InfantilPage() {
  return (
    <CategoryPageTemplate
      endpoint="/api/produtos_infantil/"
      category="infantil"
      title="Moda Infantil"
    />
  );
}
