import { Bell, Building2, ClipboardList, CreditCard, DollarSign, LayoutDashboard, Package, Search, Settings, UsersRound } from "lucide-react";
import Link from "next/link";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Deals", href: "/deals", icon: DollarSign },
  { name: "Contacts", href: "/contacts", icon: UsersRound },
  { name: "Companies", href: "/companies", icon: Building2 },
  { name: "Products", href: "/products", icon: Package },
  { name: "Activities", href: "/activities", icon: ClipboardList }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <aside
        aria-label="Sidebar navigation"
        className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-crm-navy text-white"
      >
        <div className="flex h-[73px] items-center border-b border-white/10 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-emerald-500 text-sm font-bold">
            M
          </div>
          <span className="ml-3 text-lg font-semibold">Mini CRM</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-5">
          {navigation.map((item, index) => {
            const Icon = item.icon;
            const active = index === 0;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded px-3 py-3 text-sm font-medium transition ${
                  active ? "bg-emerald-500 text-white" : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="pl-64">
        <header className="sticky top-0 z-20 flex h-[73px] items-center justify-between border-b border-gray-200 bg-white px-7">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              aria-label="Search"
              className="h-11 w-full rounded-full border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              placeholder="Search contacts, companies, deals"
              type="search"
            />
          </div>

          <div className="ml-6 flex items-center gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100" aria-label="Billing">
              <CreditCard className="h-5 w-5" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100" aria-label="Settings">
              <Settings className="h-5 w-5" />
            </button>
            <div className="ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700" aria-label="User profile">
              AB
            </div>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}
