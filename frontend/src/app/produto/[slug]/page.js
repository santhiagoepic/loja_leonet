import ProductDetail from "../../components/ProductDetail";

export default function ProdutoPage({ params }) {
  return <ProductDetail slug={params.slug} />;
}
