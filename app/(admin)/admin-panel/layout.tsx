import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Navbar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const user = await currentUser();
  const isAdmin = user?.publicMetadata?.role === 'admin';

  if (!isAdmin) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <Sidebar />

      <div className="pl-64 flex flex-col min-h-screen">
                
        <Header/>

        <main className="flex-1 p-8">
          {children}
        </main>
        
      </div>
    </div>
  )
}