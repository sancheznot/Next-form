'use client'
import React from 'react'
import Nav from '@/components/dashboard/Main/Nav'
import { useSession } from 'next-auth/react'

const Layout = () => {
    const { data: session } = useSession()

  return (
    <div>
        <Nav Session={session} />
    </div>
  )
}

export default Layout