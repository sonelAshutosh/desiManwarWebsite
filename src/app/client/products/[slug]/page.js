'use client'

import React, { useEffect, useState } from 'react'
import { notFound, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getProductBySlug } from '@/app/admin/products/actions'
import { Skeleton } from '@/components/ui/skeleton'

function ProductBySlugPage() {
  const params = useParams()
  const { slug } = params
  const [product, setProduct] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const res = await getProductBySlug(slug)

      if (res.status === 'success') {
        setProduct(res.data[0])
      } else {
        console.error(res.message)
      }
      setLoading(false)
    }

    fetchData()
  }, [slug])

  if (!product) return notFound()

  if (loading) {
    return (
      <div className="px-4 md:px-12 lg:px-20 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-2/3" />
            <div className="grid grid-cols-2 gap-2 pt-4">
              <Skeleton className="h-16 w-full rounded" />
              <Skeleton className="h-16 w-full rounded" />
              <Skeleton className="h-16 w-full rounded" />
              <Skeleton className="h-16 w-full rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 md:px-12 lg:px-20 py-8 text-gray-800 dark:text-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="h-[300px] sm:h-[400px] relative bg-primary-base dark:bg-secondary-dark rounded-xl shadow-md">
          {product.image && (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain rounded-lg"
            />
          )}
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-secondary-dark dark:text-accent-base">
            {product.name}
          </h1>
          <p className="text-lg">{product.description}</p>

          <div className="text-sm">
            <p className="py-2">
              <span className="font-semibold">Category:</span>{' '}
              {product.category}
            </p>
            <div className="py-2">
              <span className="font-semibold">One Pager URL - </span>
              {product.onePagerURL ? (
                <Link
                  href={product.onePagerURL}
                  className="text-accent-base"
                  target="_blank"
                >
                  Link
                </Link>
              ) : (
                <span className="text-muted-foreground">Coming Soon</span>
              )}
            </div>

            <div className="py-2">
              <span className="font-semibold">COA Report URL - </span>
              {product.coaReportURL ? (
                <Link
                  href={product.coaReportURL}
                  className="text-accent-base"
                  target="_blank"
                >
                  Link
                </Link>
              ) : (
                <span className="text-muted-foreground">Coming Soon</span>
              )}
            </div>
          </div>

          {product.specification?.length > 0 && (
            <div className="pt-4">
              <h2 className="text-xl font-semibold mb-2 text-accent-base">
                Specifications
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.specification.map((spec, idx) => (
                  <li
                    key={idx}
                    className="bg-primary-base dark:bg-secondary-dark p-3 rounded"
                  >
                    <strong>{spec.title}:</strong>{' '}
                    <span className="text-primary-base/75">{spec.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductBySlugPage
