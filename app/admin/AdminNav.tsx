'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  Users,
  Box,
  LayoutGrid,
  Star,
  Quote,
  MessageSquare,
  Award,
  UserCircle,
  Mail,
  LogOut,
  FileText,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { logoutUser } from '@/app/login/actions'
import { toast } from 'sonner'

interface NavItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  {
    title: 'Users',
    url: '/admin/users',
    icon: Users,
  },
  {
    title: 'Products',
    url: '/admin/products',
    icon: Box,
  },
  {
    title: 'Testimonials',
    url: '/admin/testimonials',
    icon: Star,
  },
  {
    title: 'Quotes',
    url: '/admin/quotes',
    icon: Quote,
  },
  {
    title: 'Contact Us',
    url: '/admin/contact-us',
    icon: MessageSquare,
  },
  {
    title: 'Newsletter',
    url: '/admin/newsletter',
    icon: Mail,
  },
  {
    title: 'Certificates',
    url: '/admin/certificates',
    icon: Award,
  },
  {
    title: 'Members',
    url: '/admin/members',
    icon: UserCircle,
  },
  {
    title: 'Blogs',
    url: '/admin/blogs',
    icon: FileText,
  },
]

export function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      toast.loading('Logging out...', { id: 'logout-toast' })

      const result = await logoutUser()

      if (result.success) {
        toast.success('Logged out successfully', {
          id: 'logout-toast',
          description: 'Redirecting to login page...',
        })

        setTimeout(() => {
          router.push('/login')
        }, 500)
      } else {
        throw new Error('Logout failed')
      }
    } catch (error) {
      toast.error('Logout failed', {
        id: 'logout-toast',
        description: 'An error occurred while logging out',
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-border border-b px-2 py-2.5">
        <div className="flex items-center gap-2">
          <div className="h-12 w-12 relative rounded-lg overflow-hidden">
            <Image
              src="/images/logo-image-light.jpg"
              alt="Desi Manwar Logo"
              fill
              className="object-cover"
              quality={1080}
              priority
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Desi Manwar Pvt Ltd</h2>
            <p className="text-xs text-muted-foreground">Admin Portal</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.url

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className="cursor-pointer"
                    >
                      <Link href={item.url}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-border border-t p-4">
        <Button
          variant="outline"
          className="w-full justify-start cursor-pointer"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}

export function AdminNavProvider({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminNav />
        <main className="flex-1">
          <div className="border-border border-b">
            <div className="flex h-17 items-center px-6 sm:px-6">
              <SidebarTrigger />
            </div>
          </div>
          <div className="flex-1 space-y-4 p-4 sm:p-6 md:p-8">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}
