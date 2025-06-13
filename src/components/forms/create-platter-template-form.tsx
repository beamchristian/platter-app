// src/components/forms/create-platter-template-form.tsx
"use client";

import { createPlatterTemplate } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming you have a textarea component
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Assuming you have a shadcn/ui select component
import { useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
// import { type Department } from "@prisma/client"; // Import Department type

// Define a type that matches exactly what you are fetching
type DepartmentForForm = {
  id: string;
  name: string;
};

// Define props for the form component to receive departments
interface CreatePlatterTemplateFormProps {
  departments: DepartmentForForm[]; // Use the more specific type here
}

export function CreatePlatterTemplateForm({
  departments,
}: CreatePlatterTemplateFormProps) {
  const [message, setMessage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");

  // Hook to get the pending state of the form
  const { pending } = useFormStatus();

  // Function to handle form submission
  const handleSubmit = async (formData: FormData) => {
    console.log("Client-side: handleSubmit fired. Form data before append:");
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
    // Add the selected department ID to the form data
    formData.append("departmentId", selectedDepartment);

    const result = await createPlatterTemplate(formData);
    setIsSuccess(result.success);
    setMessage(result.message);
    if (result.success) {
      // Clear form fields on success (optional)
      // You might want to reset the form in a more sophisticated way
      const form = document.getElementById(
        "create-template-form"
      ) as HTMLFormElement;
      form.reset();
      setSelectedDepartment(""); // Reset selected department as well
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setIsSuccess(null);
      }, 5000); // Clear message after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <form id='create-template-form' action={handleSubmit} className='space-y-4'>
      <h2 className='text-xl font-semibold text-card-foreground'>
        Create New Platter Template
      </h2>

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
          value={selectedDepartment}
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
        {/* Hidden input to ensure departmentId is sent with FormData */}
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
          disabled={pending}
        />
      </div>

      <Button type='submit' className='w-full' disabled={pending}>
        {pending ? "Creating..." : "Create Template"}
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
