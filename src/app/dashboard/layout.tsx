// src/app/dashboard/layout.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignOut } from "@/components/sign-out";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/sign-in");
  }

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard/orders", label: "View Orders" },
    { href: "/dashboard/tasks", label: "My Tasks" },
  ];

  const managerLinks = [
    { href: "/dashboard/templates", label: "View Templates" }, // <--- ADDED THIS LINK
    { href: "/dashboard/templates/create", label: "Create Template" },
    { href: "/dashboard/departments", label: "Manage Departments" },
    { href: "/dashboard/users", label: "Manage Users" },
  ];

  return (
    <div className='flex min-h-screen'>
      <aside className='w-64 bg-secondary text-secondary-foreground p-6 flex flex-col justify-between shadow-md'>
        <div>
          <h2 className='text-xl font-bold mb-6'>Dashboard</h2>
          {session.user?.email && (
            <div className='mb-8 p-3 bg-secondary-background rounded-md text-center'>
              <p className='text-sm'>Signed in as:</p>
              <p className='font-medium text-lg text-primary-foreground'>
                {session.user.email}
              </p>
              <p className='text-xs mt-1 text-muted-foreground'>
                Role: {session.user.role}
              </p>
            </div>
          )}
          <nav>
            <ul className='space-y-3'>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Button
                    asChild
                    variant='ghost'
                    className='w-full justify-start text-lg'
                  >
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                </li>
              ))}
              {session.user.role === "MANAGER" && (
                <>
                  <li className='border-t border-secondary-foreground/20 pt-3 mt-3'>
                    <p className='text-xs text-muted-foreground uppercase tracking-wider mb-2'>
                      Manager Tools
                    </p>
                  </li>
                  {managerLinks.map((link) => (
                    <li key={link.href}>
                      <Button
                        asChild
                        variant='ghost'
                        className='w-full justify-start text-lg'
                      >
                        <Link href={link.href}>{link.label}</Link>
                      </Button>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </nav>
        </div>
        <div className='mt-auto'>
          <SignOut />
        </div>
      </aside>

      <main className='flex-1 p-8 bg-background'>{children}</main>
    </div>
  );
}
