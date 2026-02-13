'use server'

import { revalidatePath } from 'next/cache'
import dbConnect from '@/lib/dbConnect'
import Blog, { IBlog, BlogStatus } from '@/models/Blog'

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

// Calculate estimated read time based on content (average 200 words per minute)
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.trim().split(/\s+/).length
  const readTime = Math.ceil(wordCount / wordsPerMinute)
  return readTime > 0 ? readTime : 1
}

export async function getAllBlogs(): Promise<{
  status: 'success' | 'error'
  blogs?: any[]
  message?: string
}> {
  try {
    await dbConnect()

    const blogs = await Blog.find({})
      .sort({ priority: 1, publishedAt: -1, createdAt: -1 })
      .lean()

    return {
      status: 'success',
      blogs: blogs.map((blog) => ({
        _id: blog._id.toString(),
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        featuredImage: blog.featuredImage,
        author: blog.author,
        category: blog.category,
        tags: blog.tags,
        status: blog.status,
        priority: blog.priority,
        publishedAt: blog.publishedAt?.toLocaleDateString(),
        readTime: blog.readTime,
        views: blog.views,
        createdAt: blog.createdAt?.toLocaleDateString(),
        updatedAt: blog.updatedAt?.toLocaleDateString(),
      })),
    }
  } catch (error) {
    console.error('Get all blogs error:', error)
    return {
      status: 'error',
      message: 'Failed to fetch blogs',
    }
  }
}

export async function getPublishedBlogs(): Promise<{
  status: 'success' | 'error'
  blogs?: any[]
  message?: string
}> {
  try {
    await dbConnect()

    const blogs = await Blog.find({ status: BlogStatus.PUBLISHED })
      .sort({ priority: 1, publishedAt: -1 })
      .lean()

    return {
      status: 'success',
      blogs: blogs.map((blog) => ({
        _id: blog._id.toString(),
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        featuredImage: blog.featuredImage,
        author: blog.author,
        category: blog.category,
        tags: blog.tags,
        priority: blog.priority,
        publishedAt: blog.publishedAt?.toLocaleDateString(),
        readTime: blog.readTime,
        views: blog.views,
      })),
    }
  } catch (error) {
    console.error('Get published blogs error:', error)
    return {
      status: 'error',
      message: 'Failed to fetch published blogs',
    }
  }
}

export async function getBlogById(blogId: string): Promise<{
  status: 'success' | 'error'
  blog?: any
  message?: string
}> {
  try {
    await dbConnect()

    const blog = await Blog.findById(blogId).lean()

    if (!blog) {
      return {
        status: 'error',
        message: 'Blog not found',
      }
    }

    return {
      status: 'success',
      blog: JSON.parse(JSON.stringify(blog)),
    }
  } catch (error) {
    console.error(`Get blog by id error: ${error}`)
    return {
      status: 'error',
      message: 'Failed to fetch blog',
    }
  }
}

export async function getBlogBySlug(slug: string): Promise<{
  status: 'success' | 'error'
  blog?: any
  message?: string
}> {
  try {
    await dbConnect()

    const blog = await Blog.findOne({
      slug,
      status: BlogStatus.PUBLISHED,
    }).lean()

    if (!blog) {
      return {
        status: 'error',
        message: 'Blog not found',
      }
    }

    // Increment view count
    await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } })

    return {
      status: 'success',
      blog: JSON.parse(JSON.stringify(blog)),
    }
  } catch (error) {
    console.error(`Get blog by slug error: ${error}`)
    return {
      status: 'error',
      message: 'Failed to fetch blog',
    }
  }
}

export async function createBlog(formData: FormData): Promise<{
  status: 'success' | 'error'
  message: string
  blog?: any
}> {
  try {
    await dbConnect()

    const title = formData.get('title') as string
    const excerpt = formData.get('excerpt') as string
    const content = formData.get('content') as string
    const featuredImage = formData.get('featuredImage') as string
    const category = formData.get('category') as string
    const tagsString = formData.get('tags') as string
    const tags = tagsString
      ? tagsString.split(',').map((tag) => tag.trim())
      : []
    const priority = parseInt(formData.get('priority') as string) || 1000
    const statusValue = (formData.get('status') as string) || BlogStatus.DRAFT
    const authorName = (formData.get('authorName') as string) || 'Admin'
    const authorEmail = (formData.get('authorEmail') as string) || ''

    // SEO fields
    const metaTitle = formData.get('metaTitle') as string
    const metaDescription = formData.get('metaDescription') as string
    const keywordsString = formData.get('keywords') as string
    const keywords = keywordsString
      ? keywordsString.split(',').map((kw) => kw.trim())
      : []

    if (!title || !excerpt || !content || !category) {
      return {
        status: 'error',
        message: 'Title, excerpt, content, and category are required',
      }
    }

    const slug = slugify(title)
    const existingBlog = await Blog.findOne({ slug })
    if (existingBlog) {
      return {
        status: 'error',
        message: 'A blog with this title already exists.',
      }
    }

    // Calculate read time
    const readTime = calculateReadTime(content)

    const newBlog = await Blog.create({
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      author: {
        name: authorName,
        email: authorEmail,
      },
      category,
      tags,
      status: statusValue,
      priority,
      seo: {
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        keywords,
      },
      readTime,
      publishedAt:
        statusValue === BlogStatus.PUBLISHED ? new Date() : undefined,
    })

    revalidatePath('/admin/blogs')
    revalidatePath('/blogs')

    return {
      status: 'success',
      message: 'Blog created successfully',
      blog: JSON.parse(JSON.stringify(newBlog)),
    }
  } catch (error: any) {
    console.error('Create blog error:', error)
    return {
      status: 'error',
      message: error.message || 'An error occurred while creating the blog',
    }
  }
}

export async function updateBlog(
  blogId: string,
  formData: FormData,
): Promise<{
  status: 'success' | 'error'
  message: string
  blog?: any
}> {
  try {
    await dbConnect()

    const blog = await Blog.findById(blogId)
    if (!blog) {
      return {
        status: 'error',
        message: 'Blog not found',
      }
    }

    // Extract fields from FormData
    const updateData: Partial<IBlog> = {}

    const title = formData.get('title') as string
    if (title) updateData.title = title

    const excerpt = formData.get('excerpt') as string
    if (excerpt) updateData.excerpt = excerpt

    const content = formData.get('content') as string
    if (content) {
      updateData.content = content
      updateData.readTime = calculateReadTime(content)
    }

    const featuredImage = formData.get('featuredImage') as string
    if (featuredImage) updateData.featuredImage = featuredImage

    const category = formData.get('category') as string
    if (category) updateData.category = category

    const tagsString = formData.get('tags') as string
    if (tagsString !== null) {
      updateData.tags = tagsString
        ? tagsString.split(',').map((tag) => tag.trim())
        : []
    }

    const priority = formData.get('priority') as string
    if (priority) updateData.priority = parseInt(priority)

    const statusValue = formData.get('status') as string
    if (statusValue) {
      updateData.status = statusValue as BlogStatus
      // Set publishedAt when changing from draft to published
      if (
        statusValue === BlogStatus.PUBLISHED &&
        blog.status === BlogStatus.DRAFT
      ) {
        updateData.publishedAt = new Date()
      }
    }

    // Handle author
    const authorName = formData.get('authorName') as string
    const authorEmail = formData.get('authorEmail') as string
    if (authorName || authorEmail) {
      updateData.author = {
        name: authorName || blog.author.name,
        email: authorEmail || blog.author.email,
      }
    }

    // Handle SEO
    const metaTitle = formData.get('metaTitle') as string
    const metaDescription = formData.get('metaDescription') as string
    const keywordsString = formData.get('keywords') as string
    if (metaTitle || metaDescription || keywordsString !== null) {
      updateData.seo = {
        metaTitle: metaTitle || blog.seo?.metaTitle,
        metaDescription: metaDescription || blog.seo?.metaDescription,
        keywords: keywordsString
          ? keywordsString.split(',').map((kw) => kw.trim())
          : blog.seo?.keywords,
      }
    }

    // Handle slug regeneration if title changes
    const oldSlug = blog.slug // Store old slug for revalidation
    if (updateData.title && updateData.title !== blog.title) {
      const newSlug = slugify(updateData.title)
      const existingBlog = await Blog.findOne({ slug: newSlug })
      if (existingBlog && existingBlog._id.toString() !== blogId) {
        return {
          status: 'error',
          message: 'A blog with this title already exists.',
        }
      }
      updateData.slug = newSlug
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { $set: updateData },
      { new: true, runValidators: true },
    ).lean()

    if (!updatedBlog) {
      return {
        status: 'error',
        message: 'Failed to update blog',
      }
    }

    // Revalidate paths - including old slug if it changed
    revalidatePath('/admin/blogs')
    revalidatePath('/blogs')
    revalidatePath(`/blogs/${updatedBlog.slug}`)
    if (oldSlug !== updatedBlog.slug) {
      revalidatePath(`/blogs/${oldSlug}`) // Clean up old URL
    }

    return {
      status: 'success',
      message: 'Blog updated successfully',
      blog: JSON.parse(JSON.stringify(updatedBlog)),
    }
  } catch (error: any) {
    console.error('Update blog error:', error)
    return {
      status: 'error',
      message: error.message || 'An error occurred while updating the blog',
    }
  }
}

export async function deleteBlog(blogId: string): Promise<{
  status: 'success' | 'error'
  message: string
}> {
  try {
    await dbConnect()

    const deletedBlog = await Blog.findByIdAndDelete(blogId)

    if (!deletedBlog) {
      return {
        status: 'error',
        message: 'Blog not found',
      }
    }

    revalidatePath('/admin/blogs')
    revalidatePath('/blogs')

    return {
      status: 'success',
      message: 'Blog deleted successfully',
    }
  } catch (error: any) {
    console.error('Delete blog error:', error)
    return {
      status: 'error',
      message: error.message || 'An error occurred while deleting the blog',
    }
  }
}

export async function toggleBlogStatus(blogId: string): Promise<{
  status: 'success' | 'error'
  message: string
  blog?: any
}> {
  try {
    await dbConnect()

    const blog = await Blog.findById(blogId)
    if (!blog) {
      return {
        status: 'error',
        message: 'Blog not found',
      }
    }

    const newStatus =
      blog.status === BlogStatus.PUBLISHED
        ? BlogStatus.DRAFT
        : BlogStatus.PUBLISHED
    const updateData: any = { status: newStatus }

    // Set publishedAt when publishing
    if (newStatus === BlogStatus.PUBLISHED && !blog.publishedAt) {
      updateData.publishedAt = new Date()
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { $set: updateData },
      { new: true },
    ).lean()

    revalidatePath('/admin/blogs')
    revalidatePath('/blogs')
    if (updatedBlog) {
      revalidatePath(`/blogs/${updatedBlog.slug}`)
    }

    return {
      status: 'success',
      message: `Blog ${newStatus === BlogStatus.PUBLISHED ? 'published' : 'unpublished'} successfully`,
      blog: JSON.parse(JSON.stringify(updatedBlog)),
    }
  } catch (error: any) {
    console.error('Toggle blog status error:', error)
    return {
      status: 'error',
      message: error.message || 'An error occurred while toggling blog status',
    }
  }
}
