import { Routes, Route, Link, useLocation } from "react-router-dom"
import { Toaster } from "sonner"

function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome to the Cohabit management portal.
      </p>
    </div>
  )
}

const navItems = [
  { label: "Dashboard", path: "/" },
]

export default function App() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-64 border-r border-border p-4">
        <div className="mb-8">
          <h2 className="text-lg font-semibold">Cohabit Management</h2>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </main>
      <Toaster />
    </div>
  )
}
