'use server'

import { revalidatePath } from 'next/cache'
import dbConnect from '@/lib/dbConnect'
import Member, { IMember } from '@/models/Member'

export async function getAllMembers(): Promise<{
  success: boolean
  members?: any[]
  message?: string
}> {
  try {
    await dbConnect()
    const members = await Member.find({})
      .sort({ priority: 1, joiningDate: -1 })
      .lean()
    return {
      success: true,
      members: JSON.parse(JSON.stringify(members)),
    }
  } catch (error) {
    console.error('Get all members error:', error)
    return {
      success: false,
      message: 'Failed to fetch members',
    }
  }
}

export async function getMemberById(memberId: string): Promise<{
  success: boolean
  member?: any
  message?: string
}> {
  try {
    await dbConnect()
    const member = await Member.findById(memberId).lean()
    if (!member) {
      return { success: false, message: 'Member not found' }
    }
    return {
      success: true,
      member: JSON.parse(JSON.stringify(member)),
    }
  } catch (error) {
    console.error('Get member by id error:', error)
    return { success: false, message: 'Failed to fetch member' }
  }
}

export async function createMember(data: Partial<IMember>): Promise<{
  success: boolean
  message: string
  member?: any
}> {
  try {
    await dbConnect()
    const newMember = await Member.create(data)
    revalidatePath('/admin/members')
    revalidatePath('/')
    return {
      success: true,
      message: 'Member created successfully',
      member: JSON.parse(JSON.stringify(newMember)),
    }
  } catch (error: any) {
    console.error('Create member error:', error)
    return {
      success: false,
      message: error.message || 'An error occurred while creating the member',
    }
  }
}

export async function updateMember(
  memberId: string,
  data: Partial<IMember>
): Promise<{
  success: boolean
  message: string
  member?: any
}> {
  try {
    await dbConnect()
    delete data._id
    delete data.joiningDate

    const updatedMember = await Member.findByIdAndUpdate(
      memberId,
      { $set: data },
      { new: true, runValidators: true }
    ).lean()

    if (!updatedMember) {
      return {
        success: false,
        message: 'Failed to update member',
      }
    }
    revalidatePath('/admin/members')
    revalidatePath('/')
    return {
      success: true,
      message: 'Member updated successfully',
      member: JSON.parse(JSON.stringify(updatedMember)),
    }
  } catch (error: any) {
    console.error('Update member error:', error)
    return {
      success: false,
      message: error.message || 'An error occurred while updating the member',
    }
  }
}

export async function deleteMember(memberId: string): Promise<{
  success: boolean
  message: string
}> {
  try {
    await dbConnect()
    const deletedMember = await Member.findByIdAndDelete(memberId)
    if (!deletedMember) {
      return {
        success: false,
        message: 'Member not found',
      }
    }
    revalidatePath('/admin/members')
    revalidatePath('/')
    return {
      success: true,
      message: 'Member deleted successfully',
    }
  } catch (error: any) {
    console.error('Delete member error:', error)
    return {
      success: false,
      message: error.message || 'An error occurred while deleting the member',
    }
  }
}

// Fetch top active members (default 4) sorted by priority and newest joining date
export async function getTopMembers(limit: number = 4): Promise<{
  success: boolean
  members?: any[]
  message?: string
}> {
  try {
    await dbConnect()
    const members = await Member.find({ isActive: true })
      .sort({ priority: 1, joiningDate: -1 })
      .limit(limit)
      .lean()
    return {
      success: true,
      members: JSON.parse(JSON.stringify(members)),
    }
  } catch (error) {
    console.error('Get top members error:', error)
    return {
      success: false,
      message: 'Failed to fetch top members',
    }
  }
}
