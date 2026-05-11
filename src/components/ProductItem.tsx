import type { Product } from "../App";

interface ProductItemProps {
  product: Product;
  handleLike: (e: number) => void;
  handleCheck: (e: number) => void;
  likes: Set<number>;
  checked: Set<number>;
}
export default function ProductItem({product, handleCheck, handleLike, likes, checked}: ProductItemProps) {
  return (
    <>
      <div onClick={() => handleLike(product.id)} className={likes.has(product.id) ? 'liked' : ''}>
        <input
          type="checkbox"
          onClick={(e) => e.stopPropagation()}
          onChange={() => handleCheck(product.id)} checked={checked.has(product.id)}
          />
        <h3>{product.title}</h3>
        <p>{product.description}</p>
        <img src={product.thumbnail} />
      </div>
    </>
  )
}