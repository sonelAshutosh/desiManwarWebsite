// Blog status enum
export enum BlogStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

// Interface for the Author sub-document
export interface IAuthor {
  name: string
  email?: string
}

// Interface for the SEO sub-document
export interface ISEO {
  metaTitle?: string
  metaDescription?: string
  keywords?: string[]
}

// Interface for the Blog document (client-safe version)
export interface IBlogClient {
  _id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage: string
  author: IAuthor
  category: string
  tags: string[]
  status: BlogStatus
  priority: number
  seo: ISEO
  publishedAt?: Date
  readTime?: number
  views?: number
  createdAt: Date
  updatedAt: Date
}
