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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash2, Loader2, Package, Edit, X } from 'lucide-react'
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} from './actions'

interface Product {
  _id: string
  name: string
  category: string
  priority: number
  productVisibility: boolean
  image?: string
  createdAt?: string
}

const categories = [
  'Whole Spices',
  'Ground Spices',
  'Edible Oils',
  'Millets',
  'Pulses(Dal)',
  'Rice',
]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Edit state
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<any | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editFormData, setEditFormData] = useState<any | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // Form state for Create Product
  const [createFormData, setCreateFormData] = useState({
    name: '',
    description: '',
    category: '',
    priority: 1000,
    image: '',
  })

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const productResult = await getAllProducts(false)

      if (productResult.status === 'success' && productResult.products) {
        setProducts(productResult.products)
      } else {
        toast.error('Failed to load products', {
          description: productResult.message || 'An error occurred',
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

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!createFormData.name || !createFormData.category) {
      toast.error('Name and Category are required')
      return
    }

    setIsCreating(true)
    try {
      toast.loading('Creating product...', { id: 'create-product' })

      const formDataToSend = new FormData()
      formDataToSend.append('name', createFormData.name)
      formDataToSend.append('description', createFormData.description)
      formDataToSend.append('category', createFormData.category)
      formDataToSend.append('priority', String(createFormData.priority))
      formDataToSend.append('image', createFormData.image)


      const result = await createProduct(formDataToSend)

      if (result.status === 'success') {
        toast.success('Product created successfully', {
          id: 'create-product',
          description: `${createFormData.name} has been added.`,
        })

        setCreateFormData({ name: '', description: '', category: '', priority: 1000, image: '' })
        setIsSheetOpen(false)
        await fetchProducts()
      } else {
        toast.error('Failed to create product', {
          id: 'create-product',
          description: result.message,
        })
      }
    } catch (error) {
      toast.error('Failed to create product', {
        id: 'create-product',
        description: 'An unexpected error occurred',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return

    setIsDeleting(true)
    try {
      toast.loading('Deleting product...', { id: 'delete-product' })

      const result = await deleteProduct(productToDelete._id)

      if (result.status === 'success') {
        toast.success('Product deleted successfully', {
          id: 'delete-product',
          description: `${productToDelete.name} has been removed`,
        })
        await fetchProducts()
      } else {
        toast.error('Failed to delete product', {
          id: 'delete-product',
          description: result.message,
        })
      }
    } catch (error) {
      toast.error('Failed to delete product', {
        id: 'delete-product',
        description: 'An unexpected error occurred',
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editProduct || !editFormData) return

    setIsUpdating(true)
    try {
      toast.loading('Updating product...', { id: 'update-product' })

      const formDataToSend = new FormData()
      formDataToSend.append('name', editFormData.name)
      formDataToSend.append('description', editFormData.description)
      formDataToSend.append('category', editFormData.category)
      formDataToSend.append('priority', String(editFormData.priority))
      formDataToSend.append('image', editFormData.image || '')
      formDataToSend.append('slug', editFormData.slug)
      formDataToSend.append('onePagerURL', editFormData.onePagerURL || '')
      formDataToSend.append('coaReportURL', editFormData.coaReportURL || '')
      formDataToSend.append('isFSSAICertified', editFormData.isFSSAICertified ? 'on' : 'off');


      // Nested objects
      formDataToSend.append('pricePerKg.amount', editFormData.pricePerKg?.amount || '')
      formDataToSend.append('pricePerKg.currency', editFormData.pricePerKg?.currency || 'USD')

      formDataToSend.append('productVisibility', editFormData.visibility?.productVisibility ? 'on' : 'off');
      formDataToSend.append('priceVisibility', editFormData.visibility?.priceVisibility ? 'on' : 'off');
      formDataToSend.append('descriptionVisibility', editFormData.visibility?.descriptionVisibility ? 'on' : 'off');
      formDataToSend.append('specificationVisibility', editFormData.visibility?.specificationVisibility ? 'on' : 'off');

      // Specifications array
      editFormData.specification?.forEach((spec: any, index: number) => {
        formDataToSend.append(`specification.title[]`, spec.title);
        formDataToSend.append(`specification.value[]`, spec.value);
      });

      const result = await updateProduct(editProduct._id, formDataToSend)

      if (result.status === 'success') {
        toast.success('Product updated successfully', {
          id: 'update-product',
        })
        setIsEditSheetOpen(false)
        setEditProduct(null)
        setEditFormData(null)
        await fetchProducts()
      } else {
        toast.error('Failed to update product', {
          id: 'update-product',
          description: result.message,
        })
      }
    } catch (error) {
      toast.error('Failed to update product', {
        id: 'update-product',
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
        const base64Image = await handleImageUpload(file)
        setEditFormData({
          ...editFormData,
          image: base64Image,
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

  const handleCreateImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const base64Image = await handleImageUpload(file)
        setCreateFormData({
          ...createFormData,
          image: base64Image,
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

  const handleRowClick = async (product: Product) => {
    toast.loading('Fetching product details...', { id: 'fetch-product' })
    try {
      const result = await getProductById(product._id)
      if (result.status === 'success' && result.product) {
        setEditProduct(result.product)
        setEditFormData(result.product) // Set form data
        setIsEditSheetOpen(true)
        toast.success('Product details loaded', { id: 'fetch-product' })
      } else {
        toast.error('Failed to fetch product details', {
          id: 'fetch-product',
          description: result.message,
        })
      }
    } catch (error) {
      toast.error('Failed to fetch product details', {
        id: 'fetch-product',
        description: 'An unexpected error occurred',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Products Management
          </h1>
          <p className="text-muted-foreground">
            Manage your product catalog.
          </p>
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="cursor-pointer" suppressHydrationWarning>
              <Plus className="mr-2 h-4 w-4" />
              Add New Product
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
            <div className="flex flex-col h-full">
              <SheetHeader className="space-y-4 px-6 pt-6 pb-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <SheetTitle className="text-xl">Create New Product</SheetTitle>
                    <SheetDescription className="mt-1">
                      Add a new product to your catalog.
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <form
                onSubmit={handleCreateProduct}
                className="flex-1 flex flex-col px-6 pt-6"
              >
                <div className="flex-1 space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-base font-semibold">
                      Product Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., Raw Turmeric Powder"
                      value={createFormData.name}
                      onChange={(e) =>
                        setCreateFormData({ ...createFormData, name: e.target.value })
                      }
                      disabled={isCreating}
                      required
                      className="h-11 text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="description"
                      className="text-base font-semibold"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Enter product description"
                      value={createFormData.description}
                      onChange={(e) =>
                        setCreateFormData({
                          ...createFormData,
                          description: e.target.value,
                        })
                      }
                      disabled={isCreating}
                      className="text-base"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor="category"
                        className="text-base font-semibold"
                      >
                        Category
                      </Label>
                      <Select
                        value={createFormData.category}
                        onValueChange={(value) =>
                          setCreateFormData({ ...createFormData, category: value })
                        }
                        disabled={isCreating}
                      >
                        <SelectTrigger className="h-11 text-base">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
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
                    <Label className="text-base font-semibold">
                      Product Image
                    </Label>
                    <div className="flex items-center gap-6">
                      <div className="w-32 h-32 relative rounded-md overflow-hidden border">
                        {createFormData?.image ? (
                          <Image
                            src={createFormData.image}
                            alt={createFormData.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
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
                          Max 2MB. Recommended 800x800px.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

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
                        Create Product
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Edit Product Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="w-full sm:max-w-4xl overflow-y-auto p-0">
          <div className="flex flex-col h-full">
            <SheetHeader className="space-y-4 px-6 pt-6 pb-6 border-b">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Edit className="h-6 w-6" />
                </div>
                <div>
                  <SheetTitle className="text-xl">Edit Product</SheetTitle>
                  <SheetDescription className="mt-1">
                    Update the details of '{editProduct?.name}'
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <form
              onSubmit={handleUpdateProduct}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 px-6 pt-6">
                <Tabs defaultValue="general">
                  <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="pricing">
                      Pricing & Visibility
                    </TabsTrigger>
                    <TabsTrigger value="media">Media</TabsTrigger>
                    <TabsTrigger value="specifications">
                      Specifications
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="general" className="mt-6">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label
                          htmlFor="edit-name"
                          className="text-base font-semibold"
                        >
                          Product Name
                        </Label>
                        <Input
                          id="edit-name"
                          value={editFormData?.name || ''}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              name: e.target.value,
                            })
                          }
                          className="h-11 text-base"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label
                          htmlFor="edit-description"
                          className="text-base font-semibold"
                        >
                          Description
                        </Label>
                        <Textarea
                          id="edit-description"
                          value={editFormData?.description || ''}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              description: e.target.value,
                            })
                          }
                          className="text-base"
                        />
                      </div>
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
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
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
                    </div>
                  </TabsContent>
                  <TabsContent value="pricing" className="mt-6">
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label
                            htmlFor="edit-price"
                            className="text-base font-semibold"
                          >
                            Price per Kg ({editFormData?.pricePerKg?.currency || 'USD'})
                          </Label>
                          <Input
                            id="edit-price"
                            type="text"
                            value={editFormData?.pricePerKg?.amount || ''}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                pricePerKg: {
                                  ...editFormData?.pricePerKg,
                                  amount: e.target.value,
                                },
                              })
                            }
                            className="h-11 text-base"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-base font-semibold">Visibility</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between rounded-lg border p-3">
                            <Label htmlFor="product-visibility">
                              Product Visible
                            </Label>
                            <Switch
                              id="product-visibility"
                              checked={editFormData?.visibility?.productVisibility}
                              onCheckedChange={(checked) =>
                                setEditFormData({
                                  ...editFormData,
                                  visibility: {
                                    ...editFormData?.visibility,
                                    productVisibility: checked,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between rounded-lg border p-3">
                            <Label htmlFor="price-visibility">
                              Price Visible
                            </Label>
                            <Switch
                              id="price-visibility"
                              checked={editFormData?.visibility?.priceVisibility}
                              onCheckedChange={(checked) =>
                                setEditFormData({
                                  ...editFormData,
                                  visibility: {
                                    ...editFormData?.visibility,
                                    priceVisibility: checked,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between rounded-lg border p-3">
                            <Label htmlFor="description-visibility">
                              Description Visible
                            </Label>
                            <Switch
                              id="description-visibility"
                              checked={
                                editFormData?.visibility?.descriptionVisibility
                              }
                              onCheckedChange={(checked) =>
                                setEditFormData({
                                  ...editFormData,
                                  visibility: {
                                    ...editFormData?.visibility,
                                    descriptionVisibility: checked,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between rounded-lg border p-3">
                            <Label htmlFor="specification-visibility">
                              Specifications Visible
                            </Label>
                            <Switch
                              id="specification-visibility"
                              checked={
                                editFormData?.visibility?.specificationVisibility
                              }
                              onCheckedChange={(checked) =>
                                setEditFormData({
                                  ...editFormData,
                                  visibility: {
                                    ...editFormData?.visibility,
                                    specificationVisibility: checked,
                                  },
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="media" className="mt-6">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">
                          Product Image
                        </Label>
                        <div className="flex items-center gap-6">
                          <div className="w-32 h-32 relative rounded-md overflow-hidden border">
                            {editFormData?.image ? (
                              <Image
                                src={editFormData.image}
                                alt={editFormData.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                                No Image
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Input
                              id="image-upload"
                              type="file"
                              className="hidden"
                              onChange={handleImageChange}
                              accept="image/*"
                              disabled={isUploadingImage}
                            />
                            <Label
                              htmlFor="image-upload"
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
                                'Change Image'
                              )}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Max 2MB. Recommended 800x800px.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label
                          htmlFor="edit-onePagerURL"
                          className="text-base font-semibold"
                        >
                          One Pager URL
                        </Label>
                        <Input
                          id="edit-onePagerURL"
                          value={editFormData?.onePagerURL || ''}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              onePagerURL: e.target.value,
                            })
                          }
                          className="h-11 text-base"
                          placeholder="e.g., /docs/one-pager.pdf"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label
                          htmlFor="edit-coaReportURL"
                          className="text-base font-semibold"
                        >
                          COA Report URL
                        </Label>
                        <Input
                          id="edit-coaReportURL"
                          value={editFormData?.coaReportURL || ''}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              coaReportURL: e.target.value,
                            })
                          }
                          className="h-11 text-base"
                          placeholder="e.g., /docs/coa-report.pdf"
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-4">
                        <Checkbox
                          id="isFSSAICertified"
                          checked={editFormData?.isFSSAICertified}
                          onCheckedChange={(checked) =>
                            setEditFormData({
                              ...editFormData,
                              isFSSAICertified: checked,
                            })
                          }
                        />
                        <label
                          htmlFor="isFSSAICertified"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          FSSAI Certified
                        </label>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="specifications" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold">
                          Specifications
                        </h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newSpec = { title: '', value: '' }
                            setEditFormData({
                              ...editFormData,
                              specification: [
                                ...(editFormData?.specification || []),
                                newSpec,
                              ],
                            })
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Specification
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {editFormData?.specification?.map(
                          (spec: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-4"
                            >
                              <Input
                                value={spec.title}
                                onChange={(e) => {
                                  const newSpecs = [
                                    ...editFormData.specification,
                                  ]
                                  newSpecs[index].title = e.target.value
                                  setEditFormData({
                                    ...editFormData,
                                    specification: newSpecs,
                                  })
                                }}
                                placeholder="Title (e.g., Color)"
                                className="h-11 text-base"
                              />
                              <Input
                                value={spec.value}
                                onChange={(e) => {
                                  const newSpecs = [
                                    ...editFormData.specification,
                                  ]
                                  newSpecs[index].value = e.target.value
                                  setEditFormData({
                                    ...editFormData,
                                    specification: newSpecs,
                                  })
                                }}
                                placeholder="Value (e.g., Red)"
                                className="h-11 text-base"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                  const newSpecs = [
                                    ...editFormData.specification,
                                  ]
                                  newSpecs.splice(index, 1)
                                  setEditFormData({
                                    ...editFormData,
                                    specification: newSpecs,
                                  })
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 py-6 border-t mt-6 px-6">
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
                      Update Product
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Products</h2>
          <Badge variant="secondary" className="ml-2">
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </Badge>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 rounded-md border bg-card">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-md border bg-card">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No products found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by creating your first product.
            </p>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button className="cursor-pointer" suppressHydrationWarning>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Product
                </Button>
              </SheetTrigger>
            </Sheet>
          </div>
        ) : (
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Visible</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Created At
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow
                    key={product._id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(product)}
                  >
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.priority}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.productVisibility ? 'default' : 'destructive'
                        }
                      >
                        {product.productVisibility ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {product.createdAt}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteClick(product)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="ml-2 hidden sm:inline">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product{' '}
              <span className="font-semibold">{productToDelete?.name}</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Product'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
