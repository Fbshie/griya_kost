import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import Navbar from '@/components/admin/Navbar';
import AdminSidebar from '@/components/admin/AdminSidebar';

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
    <div className="min-h-screen bg-gray-50 text-gray-900 relative">
      
      {/* <div className="md:pl-72 flex flex-col min-h-screen transition-all duration-300">
        <AdminSidebar /> */}
      
        <Navbar />
        
       
        <main className="flex-1 p-4 md:p-4">
          {children}
        </main>

      </div>
      
    //  </div>
  )
}