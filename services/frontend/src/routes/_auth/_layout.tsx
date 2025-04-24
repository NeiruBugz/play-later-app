import { createFileRoute, Link, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/_layout')({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="w-screen h-screen bg-[#F8F8F8]">
      <header className="flex items-center bg-[#4C9E97] py-3 px-6 h-[64px] mb-6">
        <Link to="">
          <div className="flex items-center gap-2 text-white">
            <div className="h-10 w-10 border border-white rounded-lg text-center min-h-10 min-w-10">
              <h1 className="text-[22px] leading-10 font-bold font-['Jura']">
                Ee
              </h1>
            </div>
            <h2 className="text-md font-normal font-['Jura']">
              Email Extractor
            </h2>
          </div>
        </Link>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
