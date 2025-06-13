// src/lib/actions.ts
"use server"; // This must be at the very top of the file

import { schema } from "@/lib/schema";
import db from "@/lib/db/db";
import { executeAction } from "@/lib/executeAction";
import { hash } from "bcryptjs";
import { auth } from "./auth"; // Import auth for session access
import { redirect } from "next/navigation";
import { z } from "zod"; // Import z for schema definition
import { revalidatePath } from "next/cache"; // Import revalidatePath for cache invalidation

// --- Existing signUp action ---
const signUp = async (formData: FormData) => {
  return executeAction({
    actionFn: async () => {
      const email = formData.get("email");
      const password = formData.get("password");

      const validatedData = schema.parse({ email, password });

      const hashedPassword = await hash(validatedData.password, 10);

      await db.user.create({
        data: {
          email: validatedData.email.toLocaleLowerCase(),
          passwordHash: hashedPassword,
          role: "TEAM_MEMBER", // Default role for new sign-ups
        },
      });
    },
    successMessage: "Signed up successfully",
  });
};

// --- Schema for PlatterTemplate creation ---
const createPlatterTemplateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
  description: z.string().optional(),
  baseInstructions: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")), // Allows empty string for optional URL
  departmentId: z.string().uuid("Invalid department selected."), // UUID for department ID
});

// --- Server Action for creating a PlatterTemplate ---
const createPlatterTemplate = async (formData: FormData) => {
  return executeAction({
    actionFn: async () => {
      console.log("--- Starting createPlatterTemplate action ---");
      const session = await auth();
      console.log("Session:", session);

      // 1. Role Check: Only Managers can create templates
      if (!session || session.user.role !== "MANAGER") {
        console.warn("Unauthorized attempt to create platter template.");
        redirect("/unauthorized"); // Redirect for unauthorized access
      }

      // 2. Extract and validate data from FormData
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;
      const baseInstructions = formData.get("baseInstructions") as string;
      const imageUrl = formData.get("imageUrl") as string;
      const departmentId = formData.get("departmentId") as string;

      const validatedData = createPlatterTemplateSchema.parse({
        name,
        description: description || undefined, // Convert empty string to undefined for optional fields
        baseInstructions: baseInstructions || undefined,
        imageUrl: imageUrl || undefined,
        departmentId,
      });
      console.log("Validated data for creation:", validatedData);

      // 3. Create PlatterTemplate in the database
      await db.platterTemplate.create({
        data: {
          ...validatedData,
          createdById: session.user.id, // Link to the current user
        },
      });
      console.log("Platter template created successfully.");
    },
    successMessage: "Platter template created successfully!",
  });
};

// --- Server Action for deleting a PlatterTemplate ---
const deletePlatterTemplate = async (templateId: string) => {
  return executeAction({
    actionFn: async () => {
      const session = await auth();

      // 1. Authorization Check: Only Managers can delete templates
      if (!session || session.user.role !== "MANAGER") {
        redirect("/unauthorized");
      }

      // 2. Validate input (ensure templateId is a valid UUID)
      const validatedId = z
        .string()
        .uuid("Invalid template ID.")
        .parse(templateId);

      // 3. Delete PlatterTemplate (onDelete: Cascade in schema handles related records)
      await db.platterTemplate.delete({
        where: {
          id: validatedId,
        },
      });

      // 4. Revalidate cache for the templates page to show updated list
      revalidatePath("/dashboard/templates");
    },
    successMessage: "Platter template deleted successfully!",
  });
};

// --- NEW: Schema for PlatterTemplate update (similar to create, but includes ID) ---
const updatePlatterTemplateSchema = z.object({
  id: z.string().uuid("Invalid template ID for update."), // Must include the ID
  name: z.string().min(3, "Name must be at least 3 characters long."),
  description: z.string().optional(),
  baseInstructions: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  departmentId: z.string().uuid("Invalid department selected."),
});

// --- NEW: Server Action for updating a PlatterTemplate ---
const updatePlatterTemplate = async (formData: FormData) => {
  return executeAction({
    actionFn: async () => {
      const session = await auth();

      // 1. Authorization Check: Only Managers can update templates
      if (!session || session.user.role !== "MANAGER") {
        redirect("/unauthorized");
      }

      // 2. Extract and validate data from FormData
      const id = formData.get("id") as string; // Get the ID from the form
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;
      const baseInstructions = formData.get("baseInstructions") as string;
      const imageUrl = formData.get("imageUrl") as string;
      const departmentId = formData.get("departmentId") as string;

      const validatedData = updatePlatterTemplateSchema.parse({
        id,
        name,
        description: description || undefined,
        baseInstructions: baseInstructions || undefined,
        imageUrl: imageUrl || undefined,
        departmentId,
      });

      // 3. Update PlatterTemplate in the database
      await db.platterTemplate.update({
        where: { id: validatedData.id },
        data: {
          name: validatedData.name,
          description: validatedData.description,
          baseInstructions: validatedData.baseInstructions,
          imageUrl: validatedData.imageUrl,
          departmentId: validatedData.departmentId,
          // createdById is generally not updated on edit
        },
      });

      // 4. Revalidate cache for the templates list and the specific template page if applicable
      revalidatePath("/dashboard/templates");
      revalidatePath(`/dashboard/templates/${validatedData.id}/edit`); // Revalidate the edit page itself
    },
    successMessage: "Platter template updated successfully!",
  });
};

// Export all server actions
export {
  signUp,
  createPlatterTemplate,
  deletePlatterTemplate,
  updatePlatterTemplate,
};
