'use server'

import dbConnect from '@/lib/dbConnect'
import Product from '@/models/Product'

export async function getProducts(filter = 'all') {
  let products = []
  try {
    await dbConnect()
    if (filter === 'all') {
      products = await Product.find().sort({ priority: 1 }).lean()
    } else {
      products = await Product.find({ category: filter }).lean()
    }

    const productsJSON = JSON.parse(JSON.stringify(products))
    return {
      status: 'success',
      message: 'Products fetched successfully',
      data: productsJSON,
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return {
      status: 'error',
      message: 'Failed to fetch products. Please try again.',
    }
  }
}

export async function getTopThreeProducts() {
  try {
    await dbConnect()
    const products = await Product.find().lean()

    const topThree = [...products]
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 3)

    const productsJSON = JSON.parse(JSON.stringify(topThree))
    return {
      status: 'success',
      message: 'Products fetched successfully',
      data: productsJSON,
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return {
      status: 'error',
      message: 'Failed to fetch products. Please try again.',
    }
  }
}

export async function getProductBySlug(slug) {
  try {
    await dbConnect()
    const product = await Product.find({ slug }).lean()

    const productJSON = JSON.parse(JSON.stringify(product))

    if (!productJSON) {
      return {
        status: 'error',
        message: 'Product not found',
      }
    }

    return {
      status: 'success',
      message: 'Product fetched successfully',
      data: productJSON,
    }
  } catch (error) {
    return {
      status: 'error',
      message: 'Failed to fetch product. Please try again.',
    }
  }
}

export async function addProduct(formData) {
  try {
    await dbConnect()

    const name = formData.get('name')
    const description = formData.get('description')
    const category = formData.get('category')
    const slug = formData.get('slug')
    const image = formData.get('imageUrl') || ''
    const priority = parseInt(formData.get('priority')) || 0
    const isFSSAICertified = formData.get('isFSSAICertified') === 'on'
    const priceAmount = parseFloat(formData.get('pricePerKg.amount')) || 0
    const priceCurrency = formData.get('pricePerKg.currency') || 'USD'
    const onePagerURL = formData.get('onePagerURL') || ''
    const coaReportURL = formData.get('coaReportURL') || ''

    if (!name || !description || !category || !slug) {
      return { status: 'error', message: 'Missing required fields.' }
    }

    // const existingProduct = await Product.findOne({ slug })
    // if (existingProduct) {
    //   return {
    //     status: 'error',
    //     message: 'Product with this slug already exists.',
    //   }
    // }

    const newProduct = new Product({
      name,
      description,
      category,
      slug,
      image,
      isFSSAICertified,
      priority,
      onePagerURL,
      coaReportURL,
      pricePerKg: {
        amount: priceAmount,
        currency: priceCurrency,
      },
    })

    const saved = await newProduct.save()

    console.log('Saved Product:', saved)

    return { status: 'success', message: 'Product added successfully!' }
  } catch (error) {
    console.log('Error adding product:', error)
    return {
      status: 'error',
      message: 'Failed to add product. Please try again.',
    }
  }
}

export async function updateProduct(formData) {
  console.log('Form Data:', formData)

  try {
    await dbConnect()

    const updated = await Product.findByIdAndUpdate(formData._id, formData, {
      new: true,
    })

    if (!updated) {
      return {
        status: 'error',
        message: 'Product not found or update failed.',
      }
    }

    return {
      status: 'success',
      message: 'Product updated successfully.',
    }
  } catch (error) {
    console.error('Update error:', error)
    return {
      status: 'error',
      message: 'Failed to update product. Please try again.',
    }
  }
}

export async function deleteProduct(productId) {
  try {
    await dbConnect()

    const deletedProduct = await Product.findByIdAndDelete(productId)
    if (!deletedProduct) {
      return {
        status: 'error',
        message: 'Product not found',
      }
    }

    return {
      status: 'success',
      message: 'Product deleted successfully',
    }
  } catch (error) {
    return {
      status: 'error',
      message: 'Error deleting Product',
    }
  }
}
