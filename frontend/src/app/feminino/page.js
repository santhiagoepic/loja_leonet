import CategoryPageTemplate from "../components/CategoryPageTemplate";

export default function FemininoPage() {
  return (
    <CategoryPageTemplate
      endpoint="/api/produtos_feminina/"
      category="feminino"
      title="Moda Feminina"
    />
  );
}
