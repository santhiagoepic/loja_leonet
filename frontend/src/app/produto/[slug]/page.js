import ProductDetail from "../../components/ProductDetail";

export default async function ProdutoPage({ params }) {
  const resolved = await params;
  return <ProductDetail slug={resolved.slug} />;
}
