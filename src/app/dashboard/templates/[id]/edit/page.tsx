// src/app/dashboard/templates/[id]/edit/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import db from "@/lib/db/db";
import { EditPlatterTemplateForm } from "@/components/forms/edit-platter-template-form";
import Link from "next/link";
// Removed: import { use } from 'react'; // We will not use the `use` hook in this component

interface PlatterTemplateEditPageProps {
  // In Next.js 15, `params` is a Promise, so we type it accordingly.
  params: {
    id: string; // The dynamic 'id' from the URL
  };
}

// Mark the component function as `async` to use `await` directly
const PlatterTemplateEditPage = async ({
  params,
}: PlatterTemplateEditPageProps) => {
  const { id: templateId } = await params;

  // --- Authorization Check ---
  const session = await auth(); // Await the authentication session

  if (!session) {
    redirect("/sign-in"); // Redirect if not authenticated
  }
  if (session.user.role !== "MANAGER") {
    redirect("/unauthorized"); // Redirect if not a manager
  }

  // 2. Fetch the specific Platter Template from the database
  const template = await db.platterTemplate.findUnique({
    where: {
      id: templateId,
    },
  });

  // 3. Handle case where template is not found
  if (!template) {
    return (
      <div className='container mx-auto py-8 text-center text-red-500'>
        <h1 className='text-2xl font-bold'>Platter Template Not Found</h1>
        <p className='mt-2'>
          The template with ID &quot;{templateId}&quot; does not exist or you
          don&apos;t have permission to access it.
        </p>
        <p className='mt-4'>
          <Link
            href='/dashboard/templates'
            className='text-primary hover:underline'
          >
            Back to Templates List
          </Link>
        </p>
      </div>
    );
  }

  // 4. Fetch all Departments for the dropdown in the form
  const departments = await db.department.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className='container mx-auto py-8'>
      <div className='max-w-xl mx-auto p-6 bg-card rounded-lg shadow-md'>
        <EditPlatterTemplateForm
          template={template}
          departments={departments}
        />
      </div>
    </div>
  );
};

export default PlatterTemplateEditPage;
