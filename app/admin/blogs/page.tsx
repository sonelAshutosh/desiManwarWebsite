'use client'

import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Image from 'next/image'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  handleImageUpload,
  validateImageSize,
  validateImageType,
} from '@/lib/imageUtils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  Trash2,
  Loader2,
  FileText,
  Edit,
  Eye,
  EyeOff,
} from 'lucide-react'
import {
  getAllBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogById,
  toggleBlogStatus,
} from './actions'
import { getCurrentUser } from '@/app/login/actions'
import { BlogStatus } from '@/types/blog'
import RichTextEditor from '@/components/ui/rich-text-editor'

interface Blog {
  _id: string
  title: string
  slug: string
  excerpt: string
  category: string
  status: string
  priority: number
  featuredImage?: string
  publishedAt?: string
  readTime?: number
  views?: number
  createdAt?: string
  updatedAt?: string
}

interface CurrentUser {
  id: string
  name: string
  email: string
}

const blogCategories = [
  'Industry News',
  'Recipes',
  'Health & Wellness',
  'Product Updates',
  'Sustainability',
  'General',
]

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)

  // Edit state
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [editBlog, setEditBlog] = useState<any | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editFormData, setEditFormData] = useState<any | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // Form state for Create Blog
  const [createFormData, setCreateFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    category: '',
    tags: '',
    priority: 1000,
    status: BlogStatus.DRAFT,
    metaTitle: '',
    metaDescription: '',
    keywords: '',
  })

  const fetchBlogs = async () => {
    setIsLoading(true)
    try {
      const blogResult = await getAllBlogs()

      if (blogResult.status === 'success' && blogResult.blogs) {
        setBlogs(blogResult.blogs)
      } else {
        toast.error('Failed to load blogs', {
          description: blogResult.message || 'An error occurred',
        })
      }
    } catch (error) {
      toast.error('Failed to load data', {
        description: 'An unexpected error occurred',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCurrentUser = async () => {
    try {
      const result = await getCurrentUser()
      if (result.success && result.user) {
        setCurrentUser(result.user)
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error)
    }
  }

  useEffect(() => {
    fetchBlogs()
    fetchCurrentUser()
  }, [])

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !createFormData.title ||
      !createFormData.excerpt ||
      !createFormData.content ||
      !createFormData.category
    ) {
      toast.error('Title, excerpt, content, and category are required')
      return
    }

    setIsCreating(true)
    try {
      toast.loading('Creating blog...', { id: 'create-blog' })

      const formDataToSend = new FormData()
      formDataToSend.append('title', createFormData.title)
      formDataToSend.append('excerpt', createFormData.excerpt)
      formDataToSend.append('content', createFormData.content)
      formDataToSend.append('featuredImage', createFormData.featuredImage)
      formDataToSend.append('category', createFormData.category)
      formDataToSend.append('tags', createFormData.tags)
      formDataToSend.append('priority', String(createFormData.priority))
      formDataToSend.append('status', createFormData.status)
      formDataToSend.append('authorName', currentUser?.name || 'Admin')
      formDataToSend.append('authorEmail', currentUser?.email || '')
      formDataToSend.append('metaTitle', createFormData.metaTitle)
      formDataToSend.append('metaDescription', createFormData.metaDescription)
      formDataToSend.append('keywords', createFormData.keywords)

      const result = await createBlog(formDataToSend)

      if (result.status === 'success') {
        toast.success('Blog created successfully', {
          id: 'create-blog',
          description: `${createFormData.title} has been added.`,
        })

        setCreateFormData({
          title: '',
          excerpt: '',
          content: '',
          featuredImage: '',
          category: '',
          tags: '',
          priority: 1000,
          status: BlogStatus.DRAFT,
          metaTitle: '',
          metaDescription: '',
          keywords: '',
        })
        setIsSheetOpen(false)
        await fetchBlogs()
      } else {
        toast.error('Failed to create blog', {
          id: 'create-blog',
          description: result.message,
        })
      }
    } catch (error) {
      toast.error('Failed to create blog', {
        id: 'create-blog',
        description: 'An unexpected error occurred',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteClick = (blog: Blog) => {
    setBlogToDelete(blog)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!blogToDelete) return

    setIsDeleting(true)
    try {
      toast.loading('Deleting blog...', { id: 'delete-blog' })

      const result = await deleteBlog(blogToDelete._id)

      if (result.status === 'success') {
        toast.success('Blog deleted successfully', {
          id: 'delete-blog',
          description: `${blogToDelete.title} has been removed`,
        })
        await fetchBlogs()
      } else {
        toast.error('Failed to delete blog', {
          id: 'delete-blog',
          description: result.message,
        })
      }
    } catch (error) {
      toast.error('Failed to delete blog', {
        id: 'delete-blog',
        description: 'An unexpected error occurred',
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setBlogToDelete(null)
    }
  }

  const handleUpdateBlog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editBlog || !editFormData) return

    setIsUpdating(true)
    try {
      toast.loading('Updating blog...', { id: 'update-blog' })

      const formDataToSend = new FormData()
      formDataToSend.append('title', editFormData.title)
      formDataToSend.append('excerpt', editFormData.excerpt)
      formDataToSend.append('content', editFormData.content)
      formDataToSend.append('featuredImage', editFormData.featuredImage || '')
      formDataToSend.append('category', editFormData.category)
      formDataToSend.append(
        'tags',
        Array.isArray(editFormData.tags)
          ? editFormData.tags.join(', ')
          : editFormData.tags || '',
      )
      formDataToSend.append('priority', String(editFormData.priority))
      formDataToSend.append('status', editFormData.status)
      formDataToSend.append('authorName', editFormData.author?.name || 'Admin')
      formDataToSend.append('authorEmail', editFormData.author?.email || '')
      formDataToSend.append('metaTitle', editFormData.seo?.metaTitle || '')
      formDataToSend.append(
        'metaDescription',
        editFormData.seo?.metaDescription || '',
      )
      formDataToSend.append(
        'keywords',
        Array.isArray(editFormData.seo?.keywords)
          ? editFormData.seo.keywords.join(', ')
          : '',
      )

      const result = await updateBlog(editBlog._id, formDataToSend)

      if (result.status === 'success') {
        toast.success('Blog updated successfully', {
          id: 'update-blog',
        })
        setIsEditSheetOpen(false)
        setEditBlog(null)
        setEditFormData(null)
        await fetchBlogs()
      } else {
        toast.error('Failed to update blog', {
          id: 'update-blog',
          description: result.message,
        })
      }
    } catch (error) {
      toast.error('Failed to update blog', {
        id: 'update-blog',
        description: 'An unexpected error occurred',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      if (!validateImageType(file)) {
        toast.error('Invalid file type. Please select an image.')
        return
      }

      if (!validateImageSize(file, 2)) {
        toast.error('File size exceeds 2MB. Please select a smaller image.')
        return
      }

      setIsUploadingImage(true)
      toast.loading('Uploading image...', { id: 'image-upload' })
      try {
        const base64Image = await handleImageUpload(file, {
          maxSizeMB: 0.2,
          maxWidthOrHeight: 1920,
        })
        setEditFormData({
          ...editFormData,
          featuredImage: base64Image,
        })
        toast.success('Image uploaded successfully', { id: 'image-upload' })
      } catch (error) {
        toast.error('Failed to upload image', {
          id: 'image-upload',
          description: 'An unexpected error occurred.',
        })
      } finally {
        setIsUploadingImage(false)
      }
    }
  }

  const handleCreateImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      if (!validateImageType(file)) {
        toast.error('Invalid file type. Please select an image.')
        return
      }

      if (!validateImageSize(file, 2)) {
        toast.error('File size exceeds 2MB. Please select a smaller image.')
        return
      }

      setIsUploadingImage(true)
      toast.loading('Uploading image...', { id: 'image-upload' })
      try {
        const base64Image = await handleImageUpload(file, {
          maxSizeMB: 0.2,
          maxWidthOrHeight: 1920,
        })
        setCreateFormData({
          ...createFormData,
          featuredImage: base64Image,
        })
        toast.success('Image uploaded successfully', { id: 'image-upload' })
      } catch (error) {
        toast.error('Failed to upload image', {
          id: 'image-upload',
          description: 'An unexpected error occurred.',
        })
      } finally {
        setIsUploadingImage(false)
      }
    }
  }

  const handleRowClick = async (blog: Blog) => {
    toast.loading('Fetching blog details...', { id: 'fetch-blog' })
    try {
      const result = await getBlogById(blog._id)
      if (result.status === 'success' && result.blog) {
        setEditBlog(result.blog)
        setEditFormData(result.blog)
        setIsEditSheetOpen(true)
        toast.success('Blog details loaded', { id: 'fetch-blog' })
      } else {
        toast.error('Failed to fetch blog details', {
          id: 'fetch-blog',
          description: result.message,
        })
      }
    } catch (error) {
      toast.error('Failed to fetch blog details', {
        id: 'fetch-blog',
        description: 'An unexpected error occurred',
      })
    }
  }

  const handleToggleStatus = async (blog: Blog, e: React.MouseEvent) => {
    e.stopPropagation()

    toast.loading('Updating status...', { id: 'toggle-status' })
    try {
      const result = await toggleBlogStatus(blog._id)
      if (result.status === 'success') {
        toast.success(result.message, { id: 'toggle-status' })
        await fetchBlogs()
      } else {
        toast.error('Failed to update status', {
          id: 'toggle-status',
          description: result.message,
        })
      }
    } catch (error) {
      toast.error('Failed to update status', {
        id: 'toggle-status',
        description: 'An unexpected error occurred',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
          <p className="text-muted-foreground">
            Create and manage your blog posts.
          </p>
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="cursor-pointer" suppressHydrationWarning>
              <Plus className="mr-2 h-4 w-4" />
              Add New Blog
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-4xl overflow-y-auto p-0">
            <div className="flex flex-col h-full">
              <SheetHeader className="space-y-4 px-6 pt-6 pb-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <SheetTitle className="text-xl">Create New Blog</SheetTitle>
                    <SheetDescription className="mt-1">
                      Add a new blog post to your website.
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <form
                onSubmit={handleCreateBlog}
                className="flex-1 flex flex-col px-6 pt-6"
              >
                <Tabs defaultValue="content" className="flex-1">
                  <TabsList>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                  </TabsList>

                  <TabsContent value="content" className="mt-6 space-y-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor="title"
                        className="text-base font-semibold"
                      >
                        Blog Title *
                      </Label>
                      <Input
                        id="title"
                        placeholder="e.g., The Health Benefits of Turmeric"
                        value={createFormData.title}
                        onChange={(e) =>
                          setCreateFormData({
                            ...createFormData,
                            title: e.target.value,
                          })
                        }
                        disabled={isCreating}
                        required
                        className="h-11 text-base"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="excerpt"
                        className="text-base font-semibold"
                      >
                        Excerpt *
                      </Label>
                      <Textarea
                        id="excerpt"
                        placeholder="Short summary of your blog (max 500 characters)"
                        value={createFormData.excerpt}
                        onChange={(e) =>
                          setCreateFormData({
                            ...createFormData,
                            excerpt: e.target.value,
                          })
                        }
                        disabled={isCreating}
                        required
                        maxLength={500}
                        className="text-base min-h-[100px]"
                      />
                      <p className="text-xs text-muted-foreground">
                        {createFormData.excerpt.length}/500 characters
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-semibold">
                        Blog Content *
                      </Label>
                      <RichTextEditor
                        content={createFormData.content}
                        onChange={(content) =>
                          setCreateFormData({ ...createFormData, content })
                        }
                        placeholder="Write your blog content here..."
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-semibold">
                        Featured Image
                      </Label>
                      <div className="flex items-center gap-6">
                        <div className="w-32 h-32 relative rounded-md overflow-hidden border">
                          {createFormData?.featuredImage ? (
                            <Image
                              src={createFormData.featuredImage}
                              alt="Featured"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs text-center p-2">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Input
                            id="create-image-upload"
                            type="file"
                            className="hidden"
                            onChange={handleCreateImageChange}
                            accept="image/*"
                            disabled={isUploadingImage}
                          />
                          <Label
                            htmlFor="create-image-upload"
                            className={`cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 ${
                              isUploadingImage ? 'opacity-50' : ''
                            }`}
                          >
                            {isUploadingImage ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              'Upload Image'
                            )}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Max 2MB. Recommended 1920x1080px.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="mt-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label
                          htmlFor="category"
                          className="text-base font-semibold"
                        >
                          Category *
                        </Label>
                        <Select
                          value={createFormData.category}
                          onValueChange={(value) =>
                            setCreateFormData({
                              ...createFormData,
                              category: value,
                            })
                          }
                          disabled={isCreating}
                        >
                          <SelectTrigger className="h-11 text-base">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {blogCategories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label
                          htmlFor="priority"
                          className="text-base font-semibold"
                        >
                          Priority
                        </Label>
                        <Input
                          id="priority"
                          type="number"
                          placeholder="e.g., 100"
                          value={createFormData.priority}
                          onChange={(e) =>
                            setCreateFormData({
                              ...createFormData,
                              priority: parseInt(e.target.value, 10),
                            })
                          }
                          disabled={isCreating}
                          className="h-11 text-base"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="tags" className="text-base font-semibold">
                        Tags
                      </Label>
                      <Input
                        id="tags"
                        placeholder="e.g., spices, health, turmeric (comma-separated)"
                        value={createFormData.tags}
                        onChange={(e) =>
                          setCreateFormData({
                            ...createFormData,
                            tags: e.target.value,
                          })
                        }
                        disabled={isCreating}
                        className="h-11 text-base"
                      />
                      <p className="text-xs text-muted-foreground">
                        Separate tags with commas
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="status"
                        className="text-base font-semibold"
                      >
                        Status
                      </Label>
                      <Select
                        value={createFormData.status}
                        onValueChange={(value) =>
                          setCreateFormData({
                            ...createFormData,
                            status: value as BlogStatus,
                          })
                        }
                        disabled={isCreating}
                      >
                        <SelectTrigger className="h-11 text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={BlogStatus.DRAFT}>
                            Draft
                          </SelectItem>
                          <SelectItem value={BlogStatus.PUBLISHED}>
                            Published
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="seo" className="mt-6 space-y-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor="metaTitle"
                        className="text-base font-semibold"
                      >
                        Meta Title
                      </Label>
                      <Input
                        id="metaTitle"
                        placeholder="SEO title (max 60 characters)"
                        value={createFormData.metaTitle}
                        onChange={(e) =>
                          setCreateFormData({
                            ...createFormData,
                            metaTitle: e.target.value,
                          })
                        }
                        disabled={isCreating}
                        maxLength={60}
                        className="h-11 text-base"
                      />
                      <p className="text-xs text-muted-foreground">
                        {createFormData.metaTitle.length}/60 characters
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="metaDescription"
                        className="text-base font-semibold"
                      >
                        Meta Description
                      </Label>
                      <Textarea
                        id="metaDescription"
                        placeholder="SEO description (max 160 characters)"
                        value={createFormData.metaDescription}
                        onChange={(e) =>
                          setCreateFormData({
                            ...createFormData,
                            metaDescription: e.target.value,
                          })
                        }
                        disabled={isCreating}
                        maxLength={160}
                        className="text-base"
                      />
                      <p className="text-xs text-muted-foreground">
                        {createFormData.metaDescription.length}/160 characters
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="keywords"
                        className="text-base font-semibold"
                      >
                        Keywords
                      </Label>
                      <Input
                        id="keywords"
                        placeholder="e.g., turmeric, health, benefits (comma-separated)"
                        value={createFormData.keywords}
                        onChange={(e) =>
                          setCreateFormData({
                            ...createFormData,
                            keywords: e.target.value,
                          })
                        }
                        disabled={isCreating}
                        className="h-11 text-base"
                      />
                      <p className="text-xs text-muted-foreground">
                        Separate keywords with commas
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex flex-col-reverse sm:flex-row gap-3 py-6 border-t mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsSheetOpen(false)}
                    disabled={isCreating}
                    className="cursor-pointer h-11 text-base sm:flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="cursor-pointer h-11 text-base sm:flex-1"
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-5 w-5" />
                        Create Blog
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Blogs Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : blogs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No blogs found. Create your first blog post!
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <TableRow
                  key={blog._id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(blog)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {blog.featuredImage && (
                        <div className="relative w-12 h-12 rounded overflow-hidden shrink-0">
                          <Image
                            src={blog.featuredImage}
                            alt={blog.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="max-w-xs truncate">{blog.title}</div>
                    </div>
                  </TableCell>
                  <TableCell>{blog.category}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        blog.status === 'published' ? 'default' : 'secondary'
                      }
                    >
                      {blog.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{blog.priority}</TableCell>
                  <TableCell>{blog.views || 0}</TableCell>
                  <TableCell>{blog.publishedAt || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleToggleStatus(blog, e)}
                        className="cursor-pointer"
                      >
                        {blog.status === 'published' ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteClick(blog)
                        }}
                        className="cursor-pointer text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Blog Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="w-full sm:max-w-4xl overflow-y-auto p-0">
          <div className="flex flex-col h-full">
            <SheetHeader className="space-y-4 px-6 pt-6 pb-6 border-b">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Edit className="h-6 w-6" />
                </div>
                <div>
                  <SheetTitle className="text-xl">Edit Blog</SheetTitle>
                  <SheetDescription className="mt-1">
                    Update the details of '{editBlog?.title}'
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <form
              onSubmit={handleUpdateBlog}
              className="flex-1 flex flex-col px-6 pt-6"
            >
              <Tabs defaultValue="content" className="flex-1">
                <TabsList>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="mt-6 space-y-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="edit-title"
                      className="text-base font-semibold"
                    >
                      Blog Title
                    </Label>
                    <Input
                      id="edit-title"
                      value={editFormData?.title || ''}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          title: e.target.value,
                        })
                      }
                      className="h-11 text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="edit-excerpt"
                      className="text-base font-semibold"
                    >
                      Excerpt
                    </Label>
                    <Textarea
                      id="edit-excerpt"
                      value={editFormData?.excerpt || ''}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          excerpt: e.target.value,
                        })
                      }
                      maxLength={500}
                      className="text-base min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold">
                      Blog Content
                    </Label>
                    <RichTextEditor
                      content={editFormData?.content || ''}
                      onChange={(content) =>
                        setEditFormData({ ...editFormData, content })
                      }
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold">
                      Featured Image
                    </Label>
                    <div className="flex items-center gap-6">
                      <div className="w-32 h-32 relative rounded-md overflow-hidden border">
                        {editFormData?.featuredImage ? (
                          <Image
                            src={editFormData.featuredImage}
                            alt="Featured"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs text-center p-2">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Input
                          id="edit-image-upload"
                          type="file"
                          className="hidden"
                          onChange={handleImageChange}
                          accept="image/*"
                          disabled={isUploadingImage}
                        />
                        <Label
                          htmlFor="edit-image-upload"
                          className={`cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 ${
                            isUploadingImage ? 'opacity-50' : ''
                          }`}
                        >
                          {isUploadingImage ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            'Upload Image'
                          )}
                        </Label>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="mt-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor="edit-category"
                        className="text-base font-semibold"
                      >
                        Category
                      </Label>
                      <Select
                        value={editFormData?.category || ''}
                        onValueChange={(value) =>
                          setEditFormData({
                            ...editFormData,
                            category: value,
                          })
                        }
                      >
                        <SelectTrigger className="h-11 text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {blogCategories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="edit-priority"
                        className="text-base font-semibold"
                      >
                        Priority
                      </Label>
                      <Input
                        id="edit-priority"
                        type="number"
                        value={editFormData?.priority || 1000}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            priority: parseInt(e.target.value, 10),
                          })
                        }
                        className="h-11 text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="edit-tags"
                      className="text-base font-semibold"
                    >
                      Tags
                    </Label>
                    <Input
                      id="edit-tags"
                      value={
                        Array.isArray(editFormData?.tags)
                          ? editFormData.tags.join(', ')
                          : editFormData?.tags || ''
                      }
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          tags: e.target.value,
                        })
                      }
                      className="h-11 text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="edit-status"
                      className="text-base font-semibold"
                    >
                      Status
                    </Label>
                    <Select
                      value={editFormData?.status || BlogStatus.DRAFT}
                      onValueChange={(value) =>
                        setEditFormData({ ...editFormData, status: value })
                      }
                    >
                      <SelectTrigger className="h-11 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={BlogStatus.DRAFT}>Draft</SelectItem>
                        <SelectItem value={BlogStatus.PUBLISHED}>
                          Published
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="edit-slug"
                      className="text-base font-semibold"
                    >
                      Slug
                    </Label>
                    <Input
                      id="edit-slug"
                      value={editFormData?.slug || ''}
                      disabled
                      className="h-11 text-base bg-muted"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="mt-6 space-y-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="edit-metaTitle"
                      className="text-base font-semibold"
                    >
                      Meta Title
                    </Label>
                    <Input
                      id="edit-metaTitle"
                      value={editFormData?.seo?.metaTitle || ''}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          seo: {
                            ...editFormData?.seo,
                            metaTitle: e.target.value,
                          },
                        })
                      }
                      maxLength={60}
                      className="h-11 text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="edit-metaDescription"
                      className="text-base font-semibold"
                    >
                      Meta Description
                    </Label>
                    <Textarea
                      id="edit-metaDescription"
                      value={editFormData?.seo?.metaDescription || ''}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          seo: {
                            ...editFormData?.seo,
                            metaDescription: e.target.value,
                          },
                        })
                      }
                      maxLength={160}
                      className="text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="edit-keywords"
                      className="text-base font-semibold"
                    >
                      Keywords
                    </Label>
                    <Input
                      id="edit-keywords"
                      value={
                        Array.isArray(editFormData?.seo?.keywords)
                          ? editFormData.seo.keywords.join(', ')
                          : ''
                      }
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          seo: {
                            ...editFormData?.seo,
                            keywords: e.target.value
                              .split(',')
                              .map((k) => k.trim()),
                          },
                        })
                      }
                      className="h-11 text-base"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex flex-col-reverse sm:flex-row gap-3 py-6 border-t mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditSheetOpen(false)}
                  disabled={isUpdating}
                  className="cursor-pointer h-11 text-base sm:flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="cursor-pointer h-11 text-base sm:flex-1"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="mr-2 h-5 w-5" />
                      Update Blog
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{blogToDelete?.title}". This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
