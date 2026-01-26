import { getAllProducts } from '@/app/admin/products/actions'
import ProductCard from './ProductCard'

// Enable ISR - revalidate every 60 seconds
export const revalidate = 60

export default async function ProductsPage() {
  const { products } = await getAllProducts()

  const visibleProducts = products?.filter((p) => p.productVisibility) || []

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground">Our Products</h1>
        <p className="text-muted-foreground mt-2">
          Explore our wide range of authentic Indian products.
        </p>
      </div>

      {visibleProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {visibleProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No products available at the moment.
          </p>
        </div>
      )}
    </div>
  )
}
