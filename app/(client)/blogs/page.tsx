import { getPublishedBlogs } from '@/app/admin/blogs/actions'
import BlogCard from './BlogCard'

// Using on-demand revalidation via revalidatePath() in admin actions
// No time-based revalidation needed - pages regenerate only when content changes

export default async function BlogsPage() {
  const { blogs } = await getPublishedBlogs()

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground">Our Blog</h1>
        <p className="text-muted-foreground mt-2">
          Latest news, insights, and stories from Desi Manwar
        </p>
      </div>

      {blogs && blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No blog posts available at the moment. Check back soon!
          </p>
        </div>
      )}
    </div>
  )
}
