// src/components/forms/edit-platter-template-form.tsx
"use client";

import { updatePlatterTemplate } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { type Department, type PlatterTemplate } from "@prisma/client";
import { useRouter } from "next/navigation"; // For redirection after update

interface EditPlatterTemplateFormProps {
  template: PlatterTemplate; // The template data to pre-fill the form
  departments: Department[];
}

export function EditPlatterTemplateForm({
  template,
  departments,
}: EditPlatterTemplateFormProps) {
  const [message, setMessage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  // Pre-fill selectedDepartment with the template's current departmentId
  const [selectedDepartment, setSelectedDepartment] = useState<string>(
    template.departmentId
  );
  const router = useRouter();

  const { pending } = useFormStatus();

  // Effect to clear message after a few seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setIsSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (formData: FormData) => {
    // Add the template ID and selected department ID to the form data
    formData.append("id", template.id); // Crucial for update
    formData.append("departmentId", selectedDepartment); // Ensure updated departmentId is sent

    const result = await updatePlatterTemplate(formData);
    setIsSuccess(result.success);
    setMessage(result.message);

    if (result.success) {
      // Optional: Redirect back to the templates list after successful update
      router.push("/dashboard/templates");
    }
  };

  return (
    <form id='edit-template-form' action={handleSubmit} className='space-y-4'>
      <h2 className='text-xl font-semibold text-card-foreground'>
        Edit Platter Template: {template.name}
      </h2>

      {/* Hidden input for the template ID */}
      {/* This ensures the ID is sent with the form data when `action={handleSubmit}` is called */}
      <input type='hidden' name='id' value={template.id} />

      <div>
        <label
          htmlFor='name'
          className='block text-sm font-medium text-muted-foreground mb-1'
        >
          Template Name <span className='text-red-500'>*</span>
        </label>
        <Input
          id='name'
          name='name'
          placeholder='e.g., Sandwich Platter, Meat & Cheese Platter'
          defaultValue={template.name} // Pre-fill with existing name
          required
          disabled={pending}
        />
      </div>

      <div>
        <label
          htmlFor='departmentId'
          className='block text-sm font-medium text-muted-foreground mb-1'
        >
          Department <span className='text-red-500'>*</span>
        </label>
        <Select
          onValueChange={setSelectedDepartment}
          value={selectedDepartment} // Controlled component for select
          disabled={pending}
        >
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='Select a department' />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Hidden input here is redundant if `selectedDepartment` is appended directly to FormData,
            but harmless. It's often used when `action` is a direct server action (not wrapped in `handleSubmit`).
            We can keep it or remove it, as `formData.append` takes precedence.
        */}
        <input type='hidden' name='departmentId' value={selectedDepartment} />
      </div>

      <div>
        <label
          htmlFor='description'
          className='block text-sm font-medium text-muted-foreground mb-1'
        >
          Description (Optional)
        </label>
        <Textarea
          id='description'
          name='description'
          placeholder='A brief description of the platter template.'
          defaultValue={template.description || ""} // Pre-fill, handle null/undefined
          rows={3}
          disabled={pending}
        />
      </div>

      <div>
        <label
          htmlFor='baseInstructions'
          className='block text-sm font-medium text-muted-foreground mb-1'
        >
          Base Instructions (Optional)
        </label>
        <Textarea
          id='baseInstructions'
          name='baseInstructions'
          placeholder='Detailed instructions for assembling this platter type.'
          defaultValue={template.baseInstructions || ""} // Pre-fill, handle null/undefined
          rows={5}
          disabled={pending}
        />
      </div>

      <div>
        <label
          htmlFor='imageUrl'
          className='block text-sm font-medium text-muted-foreground mb-1'
        >
          Image URL (Optional)
        </label>
        <Input
          id='imageUrl'
          name='imageUrl'
          type='url'
          placeholder='https://example.com/platter-image.jpg'
          defaultValue={template.imageUrl || ""} // Pre-fill, handle null/undefined
          disabled={pending}
        />
      </div>

      <Button type='submit' className='w-full' disabled={pending}>
        {pending ? "Updating..." : "Update Template"}
      </Button>

      {message && (
        <p
          className={`text-center text-sm ${
            isSuccess ? "text-green-500" : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
