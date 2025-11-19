import { AdminAuthProvider } from "../providers/admin-auth-context";

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      {children}
    </AdminAuthProvider>
  );
}
