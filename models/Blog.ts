import mongoose, { Schema, Document, model, models, Model } from 'mongoose'
import { BlogStatus, IAuthor, ISEO } from '@/types/blog'

// Re-export for backward compatibility
export { BlogStatus } from '@/types/blog'

// Interface for the Blog document
export interface IBlog extends Document {
  title: string
  slug: string
  excerpt: string // Short summary for blog listing pages
  content: string // Full blog content (can be HTML or Markdown)
  featuredImage: string // Base64 encoded image with compression
  author: IAuthor
  category: string // e.g., "Industry News", "Recipes", "Product Updates"
  tags: string[] // e.g., ["spices", "turmeric", "health"]
  status: BlogStatus // 'draft' or 'published'
  priority: number // Similar to products - lower number = higher priority
  seo: ISEO // SEO metadata
  publishedAt?: Date // When the blog was published
  readTime?: number // Estimated read time in minutes
  views?: number // Track blog views (optional)
  createdAt: Date
  updatedAt: Date
}

// Mongoose schema for the Blog
const blogSchema: Schema<IBlog> = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Blog excerpt is required'],
      trim: true,
      maxlength: [500, 'Excerpt cannot exceed 500 characters'],
    },
    content: {
      type: String,
      required: [true, 'Blog content is required'],
    },
    featuredImage: {
      type: String,
      default: '',
      // Stores base64 encoded compressed image
    },
    author: {
      name: {
        type: String,
        required: true,
        default: 'Admin',
      },
      email: {
        type: String,
        default: '',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      default: 'General',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: Object.values(BlogStatus),
      default: BlogStatus.DRAFT,
      required: true,
    },
    priority: {
      type: Number,
      default: 1000,
      min: [0, 'Priority cannot be negative'],
    },
    seo: {
      metaTitle: {
        type: String,
        maxlength: [60, 'Meta title should not exceed 60 characters'],
      },
      metaDescription: {
        type: String,
        maxlength: [160, 'Meta description should not exceed 160 characters'],
      },
      keywords: [
        {
          type: String,
          trim: true,
        },
      ],
    },
    publishedAt: {
      type: Date,
    },
    readTime: {
      type: Number,
      min: [1, 'Read time must be at least 1 minute'],
    },
    views: {
      type: Number,
      default: 0,
      min: [0, 'Views cannot be negative'],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  },
)

// Index for better query performance
blogSchema.index({ status: 1, priority: 1, publishedAt: -1 })
blogSchema.index({ slug: 1 })
blogSchema.index({ category: 1 })
blogSchema.index({ tags: 1 })

// Export the model, handling the case where the model might already be compiled
const Blog: Model<IBlog> = models.Blog || model<IBlog>('Blog', blogSchema)

export default Blog
