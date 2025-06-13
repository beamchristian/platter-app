// src/app/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link"; // Import Link
import { Button } from "@/components/ui/button";

const Page = async () => {
  const session = await auth();
  if (!session) redirect("/sign-in");

  return (
    <div className='container mx-auto py-8'>
      {/* Remove the old styling here as the DashboardLayout will provide context */}
      <h2 className='text-3xl font-bold text-foreground mb-4'>
        Welcome, {session.user?.email}!
      </h2>
      <p className='text-lg text-muted-foreground mb-6'>
        You are currently logged in as a{" "}
        <span className='font-semibold text-primary'>{session.user.role}</span>.
      </p>

      <p className='text-muted-foreground mb-4'>
        Navigate using the sidebar to access features based on your role.
      </p>

      {/* Example links for non-dashboard areas, if needed */}
      <Link href='/dashboard/templates/create'>
        <Button>Go to Create Template (Manager)</Button>
      </Link>
    </div>
  );
};

export default Page;
