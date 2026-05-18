'use server'

import { revalidatePath } from 'next/cache'
import dbConnect from '@/lib/dbConnect'
import Product, { IProduct } from '@/models/Product'

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

export async function getAllProducts(includeImage: boolean = true): Promise<{
  status: 'success' | 'error'
  products?: any[]
  message?: string
}> {
  try {
    await dbConnect()

    let query = Product.find({})
    
    if (!includeImage) {
      query = query.select('-image') // Exclude image field to reduce payload size
    }

    const products = await query
      .sort({ priority: 1, createdAt: -1 })
      .lean()

    return {
      status: 'success',
      products: products.map((product) => ({
        _id: product._id.toString(),
        name: product.name,
        slug: product.slug,
        description: product.description,
        category: product.category,
        priority: product.priority,
        productVisibility: product.visibility.productVisibility,
        createdAt: product.createdAt?.toLocaleDateString(),
        ...(includeImage && { image: product.image }),
      })),
    }
  } catch (error) {
    console.error('Get all products error:', error)
    return {
      status: 'error',
      message: 'Failed to fetch products',
    }
  }
}

export async function getProductById(productId: string): Promise<{
  status: 'success' | 'error'
  product?: any
  message?: string
}> {
  try {
    await dbConnect()

    const product = await Product.findById(productId).lean()

    if (!product) {
      return {
        status: 'error',
        message: 'Product not found',
      }
    }

    return {
      status: 'success',
      product: JSON.parse(JSON.stringify(product)),
    }
  } catch (error) {
    console.error(`Get product by id error: ${error}`)
    return {
      status: 'error',
      message: 'Failed to fetch product',
    }
  }
}

export async function getProductBySlug(slug: string): Promise<{
  status: 'success' | 'error'
  product?: any
  message?: string
}> {
  try {
    await dbConnect()

    const product = await Product.findOne({ slug }).lean()

    if (!product) {
      return {
        status: 'error',
        message: 'Product not found',
      }
    }

    return {
      status: 'success',
      product: JSON.parse(JSON.stringify(product)),
    }
  } catch (error) {
    console.error(`Get product by slug error: ${error}`)
    return {
      status: 'error',
      message: 'Failed to fetch product',
    }
  }
}

export async function createProduct(formData: FormData): Promise<{
  status: 'success' | 'error'
  message: string
  product?: any
}> {
  try {
    await dbConnect()

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const priority = parseInt(formData.get('priority') as string) || 1000
    const image = formData.get('image') as string

    if (!name || !category) {
      return {
        status: 'error',
        message: 'Name and category are required',
      }
    }

    const slug = slugify(name)
    const existingProduct = await Product.findOne({ slug })
    if (existingProduct) {
      return {
        status: 'error',
        message: 'A product with this name already exists.',
      }
    }

    const newProduct = await Product.create({
      name,
      description,
      category,
      priority,
      image,
      slug,
      // Default values for other fields if not provided in FormData
      pricePerKg: { amount: '', currency: 'USD' },
      visibility: {
        priceVisibility: false,
        specificationVisibility: true,
        descriptionVisibility: true,
        productVisibility: true,
      },
      isFSSAICertified: false,
      onePagerURL: '',
      coaReportURL: '',
    })

    revalidatePath('/admin/products')
    revalidatePath('/products')
    revalidatePath('/')

    return {
      status: 'success',
      message: 'Product created successfully',
      product: JSON.parse(JSON.stringify(newProduct)),
    }
  } catch (error: any) {
    console.error('Create product error:', error)
    return {
      status: 'error',
      message: error.message || 'An error occurred while creating the product',
    }
  }
}

export async function updateProduct(
  productId: string,
  formData: FormData,
): Promise<{
  status: 'success' | 'error' | 'pending'
  message: string
  product?: any
}> {
  try {
    await dbConnect()

    const product = await Product.findById(productId)
    if (!product) {
      return {
        status: 'error',
        message: 'Product not found',
      }
    }

    // Extract fields from FormData
    const updateData: Partial<IProduct> = {}

    const name = formData.get('name') as string
    if (name) updateData.name = name

    const description = formData.get('description') as string
    if (description) updateData.description = description

    const category = formData.get('category') as string
    if (category) updateData.category = category

    const priority = formData.get('priority') as string
    if (priority) updateData.priority = parseInt(priority)

    const image = formData.get('image') as string
    if (image) updateData.image = image

    const onePagerURL = formData.get('onePagerURL') as string
    if (onePagerURL) updateData.onePagerURL = onePagerURL

    const coaReportURL = formData.get('coaReportURL') as string
    if (coaReportURL) updateData.coaReportURL = coaReportURL

    const isFSSAICertified = formData.get('isFSSAICertified') === 'on'
    updateData.isFSSAICertified = isFSSAICertified

    // Handle nested pricePerKg
    const priceAmount = formData.get('pricePerKg.amount') as string
    const priceCurrency =
      (formData.get('pricePerKg.currency') as string) || 'USD'
    updateData.pricePerKg = {
      amount: priceAmount,
      currency: priceCurrency,
    }

    // Handle nested visibility
    updateData.visibility = {
      productVisibility: formData.get('productVisibility') === 'on',
      priceVisibility: formData.get('priceVisibility') === 'on',
      descriptionVisibility: formData.get('descriptionVisibility') === 'on',
      specificationVisibility: formData.get('specificationVisibility') === 'on',
    }

    // Handle specifications
    const specificationTitles = formData.getAll(
      'specification.title[]',
    ) as string[]
    const specificationValues = formData.getAll(
      'specification.value[]',
    ) as string[]
    if (
      specificationTitles &&
      specificationValues &&
      specificationTitles.length === specificationValues.length
    ) {
      updateData.specification = specificationTitles.map((title, index) => ({
        title,
        value: specificationValues[index],
      }))
    } else {
      updateData.specification = [] // Clear or set to default if mismatch
    }

    // Handle slug regeneration if name changes
    const oldSlug = product.slug // Store old slug for revalidation
    if (updateData.name && updateData.name !== product.name) {
      const newSlug = slugify(updateData.name)
      const existingProduct = await Product.findOne({ slug: newSlug })
      if (existingProduct && existingProduct._id.toString() !== productId) {
        return {
          status: 'error',
          message: 'A product with this name already exists.',
        }
      }
      updateData.slug = newSlug
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updateData },
      { new: true, runValidators: true },
    ).lean()

    if (!updatedProduct) {
      return {
        status: 'error',
        message: 'Failed to update product',
      }
    }

    // Revalidate paths - including old slug if it changed
    revalidatePath('/admin/products')
    revalidatePath('/products')
    revalidatePath(`/products/${updatedProduct.slug}`)
    revalidatePath('/')
    if (oldSlug !== updatedProduct.slug) {
      revalidatePath(`/products/${oldSlug}`) // Clean up old URL
    }

    return {
      status: 'success',
      message: 'Product updated successfully',
      product: JSON.parse(JSON.stringify(updatedProduct)),
    }
  } catch (error: any) {
    console.error('Update product error:', error)
    return {
      status: 'error',
      message: error.message || 'An error occurred while updating the product',
    }
  }
}

export async function deleteProduct(productId: string): Promise<{
  status: 'success' | 'error'
  message: string
}> {
  try {
    await dbConnect()

    const deletedProduct = await Product.findByIdAndDelete(productId)

    if (!deletedProduct) {
      return {
        status: 'error',
        message: 'Product not found',
      }
    }

    revalidatePath('/admin/products')
    revalidatePath('/products')
    revalidatePath('/')

    return {
      status: 'success',
      message: 'Product deleted successfully',
    }
  } catch (error: any) {
    console.error('Delete product error:', error)
    return {
      status: 'error',
      message: error.message || 'An error occurred while deleting the product',
    }
  }
}
