import Header from '@/components/Header'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/_layout')({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="w-screen h-screen bg-[#F8F8F8]">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
