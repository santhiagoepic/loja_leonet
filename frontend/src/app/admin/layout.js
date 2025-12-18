import { AdminAuthProvider } from "../providers/admin-auth-context";

const APP_VERSION = "v1.0.0";

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      <div className="relative min-h-screen">
        <div className="pointer-events-none fixed right-4 top-4 z-50 select-none rounded-full border border-orange-200 bg-white px-3 py-1 text-xs font-semibold text-orange-600 shadow-sm">
          {APP_VERSION}
        </div>
        {children}
      </div>
    </AdminAuthProvider>
  );
}
