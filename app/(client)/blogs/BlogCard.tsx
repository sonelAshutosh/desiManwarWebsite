import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Calendar, Clock, Eye, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface BlogCardProps {
  blog: {
    _id: string
    title: string
    slug: string
    excerpt: string
    featuredImage?: string
    author: {
      name: string
    }
    category: string
    tags?: string[]
    publishedAt?: string
    readTime?: number
    views?: number
  }
}

export default function BlogCard({ blog }: BlogCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all border-border bg-card group">
      {/* Featured Image */}
      <Link href={`/blogs/${blog.slug}`}>
        <div className="relative h-56 bg-muted/20 border-b border-border overflow-hidden">
          {blog.featuredImage ? (
            <Image
              src={blog.featuredImage}
              alt={blog.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground bg-linear-to-br from-primary/5 to-primary/10">
              <div className="text-center">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No Image</p>
              </div>
            </div>
          )}

          {/* Category Badge Overlay */}
          <div className="absolute top-4 left-4">
            <Badge className="bg-primary text-primary-foreground shadow-lg">
              {blog.category}
            </Badge>
          </div>
        </div>
      </Link>

      <CardContent className="p-6 space-y-4">
        {/* Title */}
        <Link href={`/blogs/${blog.slug}`}>
          <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
            {blog.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {blog.excerpt}
        </p>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            <span>{blog.author.name}</span>
          </div>

          {blog.publishedAt && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{blog.publishedAt}</span>
            </div>
          )}

          {blog.readTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{blog.readTime} min read</span>
            </div>
          )}

          {blog.views !== undefined && (
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{blog.views} views</span>
            </div>
          )}
        </div>

        {/* Read More Link */}
        <Link
          href={`/blogs/${blog.slug}`}
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors text-sm pt-2"
        >
          Read More <ArrowRight className="w-4 h-4" />
        </Link>
      </CardContent>
    </Card>
  )
}
