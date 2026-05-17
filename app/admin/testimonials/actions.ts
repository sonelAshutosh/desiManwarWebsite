'use server'

import { revalidatePath } from 'next/cache'
import dbConnect from '@/lib/dbConnect'
import Testimonial, { ITestimonial } from '@/models/Testimonials'

export async function getAllTestimonials(): Promise<{
  success: boolean
  testimonials?: any[]
  message?: string
}> {
  try {
    await dbConnect()

    const testimonials = await Testimonial.find({})
      .sort({ createdAt: -1 })
      .lean()

    return {
      success: true,
      testimonials: JSON.parse(JSON.stringify(testimonials)),
    }
  } catch (error) {
    console.error('Get all testimonials error:', error)
    return {
      success: false,
      message: 'Failed to fetch testimonials',
    }
  }
}

export async function getTestimonialById(testimonialId: string): Promise<{
  success: boolean
  testimonial?: any
  message?: string
}> {
  try {
    await dbConnect()
    const testimonial = await Testimonial.findById(testimonialId).lean()
    if (!testimonial) {
      return { success: false, message: 'Testimonial not found' }
    }
    return {
      success: true,
      testimonial: JSON.parse(JSON.stringify(testimonial)),
    }
  } catch (error) {
    console.error('Get testimonial by id error:', error)
    return { success: false, message: 'Failed to fetch testimonial' }
  }
}

export async function createTestimonial(
  data: Partial<ITestimonial>
): Promise<{
  success: boolean
  message: string
  testimonial?: any
}> {
  try {
    await dbConnect()
    const newTestimonial = await Testimonial.create(data)
    revalidatePath('/admin/testimonials')
    revalidatePath('/')
    return {
      success: true,
      message: 'Testimonial created successfully',
      testimonial: JSON.parse(JSON.stringify(newTestimonial)),
    }
  } catch (error: any) {
    console.error('Create testimonial error:', error)
    return {
      success: false,
      message: error.message || 'An error occurred while creating the testimonial',
    }
  }
}

export async function updateTestimonial(
  testimonialId: string,
  data: Partial<ITestimonial>
): Promise<{
  success: boolean
  message: string
  testimonial?: any
}> {
  try {
    await dbConnect()

    delete data._id
    delete data.createdAt

    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      testimonialId,
      { $set: data },
      { new: true, runValidators: true }
    ).lean()

    if (!updatedTestimonial) {
      return {
        success: false,
        message: 'Failed to update testimonial',
      }
    }

    revalidatePath('/admin/testimonials')
    revalidatePath('/')

    return {
      success: true,
      message: 'Testimonial updated successfully',
      testimonial: JSON.parse(JSON.stringify(updatedTestimonial)),
    }
  } catch (error: any) {
    console.error('Update testimonial error:', error)
    return {
      success: false,
      message: error.message || 'An error occurred while updating the testimonial',
    }
  }
}

export async function deleteTestimonial(testimonialId: string): Promise<{
  success: boolean
  message: string
}> {
  try {
    await dbConnect()
    const deletedTestimonial = await Testimonial.findByIdAndDelete(testimonialId)
    if (!deletedTestimonial) {
      return {
        success: false,
        message: 'Testimonial not found',
      }
    }
    revalidatePath('/admin/testimonials')
    revalidatePath('/')
    return {
      success: true,
      message: 'Testimonial deleted successfully',
    }
  } catch (error: any) {
    console.error('Delete testimonial error:', error)
    return {
      success: false,
      message: error.message || 'An error occurred while deleting the testimonial',
    }
  }
}
