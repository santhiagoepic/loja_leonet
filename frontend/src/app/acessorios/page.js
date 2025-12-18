import CategoryPageTemplate from "../components/CategoryPageTemplate";

export default function AcessoriosPage() {
  return (
    <CategoryPageTemplate
      endpoint="/api/produtos_acessorios/"
      category="acessorios"
      title="Acessórios"
    />
  );
}
