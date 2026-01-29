import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, Eye, User, ArrowLeft, Tag } from 'lucide-react'
import { getBlogBySlug } from '@/app/admin/blogs/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

// Enable ISR - revalidate every 60 seconds
export const revalidate = 60

interface BlogPageProps {
  params: {
    slug: string
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPageProps) {
  const { slug } = await params
  const { blog, status } = await getBlogBySlug(slug)

  if (status === 'error' || !blog) {
    return {
      title: 'Blog Not Found',
      description: 'The requested blog post could not be found.',
    }
  }

  return {
    title: blog.seo?.metaTitle || blog.title,
    description: blog.seo?.metaDescription || blog.excerpt,
    keywords: blog.seo?.keywords?.join(', ') || blog.tags?.join(', '),
    openGraph: {
      title: blog.seo?.metaTitle || blog.title,
      description: blog.seo?.metaDescription || blog.excerpt,
      type: 'article',
      publishedTime: blog.publishedAt,
      authors: [blog.author?.name || 'Admin'],
      tags: blog.tags,
    },
  }
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params
  const { blog, status } = await getBlogBySlug(slug)

  if (status === 'error' || !blog) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-8">
        <Link href="/blogs">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Blogs
          </Button>
        </Link>
      </div>

      {/* Blog Header */}
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Category Badge */}
        <div className="mb-4">
          <Badge className="bg-primary text-primary-foreground">
            {blog.category}
          </Badge>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
          {blog.title}
        </h1>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="font-medium">{blog.author?.name || 'Admin'}</span>
          </div>

          {blog.publishedAt && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </>
          )}

          {blog.readTime && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{blog.readTime} min read</span>
              </div>
            </>
          )}

          {blog.views !== undefined && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{blog.views} views</span>
              </div>
            </>
          )}
        </div>

        {/* Featured Image */}
        {blog.featuredImage && (
          <div className="w-full rounded-lg overflow-hidden mb-8 border border-border">
            <Image
              src={blog.featuredImage}
              alt={blog.title}
              width={1920}
              height={1080}
              className="w-full h-auto"
              priority
            />
          </div>
        )}

        {/* Excerpt */}
        <div className="bg-muted/50 border-l-4 border-primary p-6 rounded-r-lg mb-8">
          <p className="text-lg text-muted-foreground italic">{blog.excerpt}</p>
        </div>

        {/* Blog Content */}
        <div
          className="prose prose-lg prose-slate dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:text-foreground
            prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-4
            prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-3
            prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground prose-strong:font-semibold
            prose-ul:my-4 prose-ol:my-4
            prose-li:text-muted-foreground prose-li:my-2
            prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1
            prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-muted prose-pre:border prose-pre:border-border
            prose-img:rounded-lg prose-img:border prose-img:border-border"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center gap-3 flex-wrap">
              <Tag className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">
                Tags:
              </span>
              {blog.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Author Info
        <div className="mt-12 p-6 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-lg text-foreground">
                {blog.author?.name || 'Admin'}
              </p>
              {blog.author?.email && (
                <p className="text-sm text-muted-foreground">
                  {blog.author.email}
                </p>
              )}
            </div>
          </div>
        </div> */}

        {/* Back to Blogs Button */}
        <div className="mt-12 text-center">
          <Link href="/blogs">
            <Button size="lg" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              View All Blogs
            </Button>
          </Link>
        </div>
      </article>
    </div>
  )
}
