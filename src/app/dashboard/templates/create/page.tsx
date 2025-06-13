// src/app/dashboard/templates/create/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreatePlatterTemplateForm } from "@/components/forms/create-platter-template-form";
import db from "@/lib/db/db"; // Import your Prisma client

const CreatePlatterTemplatePage = async () => {
  const session = await auth();

  // 1. Authorization Check: Ensure user is logged in and is a MANAGER
  if (!session) {
    redirect("/sign-in");
  }
  if (session.user.role !== "MANAGER") {
    redirect("/unauthorized"); // Redirect to an unauthorized page
  }

  // 2. Fetch Departments for the dropdown
  const departments = await db.department.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className='container mx-auto py-8'>
      <div className='max-w-xl mx-auto p-6 bg-card rounded-lg shadow-md'>
        <CreatePlatterTemplateForm departments={departments} />
      </div>
    </div>
  );
};

export default CreatePlatterTemplatePage;
