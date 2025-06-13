// src/components/platter-template-card.tsx
"use client";

import { useState, useTransition } from "react";
// Remove `Decimal` import as it's no longer passed directly
import {
  type PlatterTemplate,
  //   type Department,
  //   type User,
  type PlatterSizeEnum,
} from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deletePlatterTemplate } from "@/lib/actions";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Ensure Link is imported if used directly here

// --- IMPORTANT: Update the type definition for variations ---
interface PlatterTemplateWithRelations extends PlatterTemplate {
  department: { name: string } | null;
  createdBy: { name: string | null; email: string } | null;
  variations: {
    id: string;
    size: PlatterSizeEnum; // Keep as enum if that's what Prisma returns, or cast to string in page.tsx
    price: string; // <-- Now it's a string!
  }[];
}

interface PlatterTemplateCardProps {
  template: PlatterTemplateWithRelations;
  isManager: boolean;
}

export function PlatterTemplateCard({
  template,
  isManager,
}: PlatterTemplateCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${template.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setDeleteMessage("");

    startTransition(async () => {
      const result = await deletePlatterTemplate(template.id);
      if (result.success) {
        setDeleteMessage(result.message);
        router.refresh();
      } else {
        setDeleteMessage(`Error: ${result.message}`);
      }
      setIsDeleting(false);
    });
  };

  return (
    <Card key={template.id} className='flex flex-col'>
      <CardHeader>
        <CardTitle>{template.name}</CardTitle>
        <CardDescription>
          {template.department?.name && (
            <span className='text-sm text-muted-foreground block'>
              Department: {template.department.name}
            </span>
          )}
          {template.createdBy && (
            <span className='text-xs text-muted-foreground'>
              Created by: {template.createdBy.name || template.createdBy.email}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex-grow'>
        {template.description && (
          <p className='text-sm mb-2 text-foreground'>{template.description}</p>
        )}
        {template.baseInstructions && (
          <p className='text-xs italic text-muted-foreground'>
            Instructions: {template.baseInstructions.substring(0, 100)}
            {template.baseInstructions.length > 100 ? "..." : ""}
          </p>
        )}
        {template.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={template.imageUrl}
            alt={template.name}
            className='w-full h-32 object-cover rounded-md mt-4'
          />
        )}

        {template.variations.length > 0 && (
          <div className='mt-4'>
            <h4 className='text-sm font-semibold mb-2'>Variations:</h4>
            <ul className='list-disc list-inside text-xs text-muted-foreground'>
              {template.variations.map((variation) => (
                <li key={variation.id}>
                  {variation.size} - ${variation.price}{" "}
                  {/* price is already a formatted string */}
                </li>
              ))}
            </ul>
          </div>
        )}
        {deleteMessage && (
          <p
            className={`mt-2 text-sm ${
              deleteMessage.startsWith("Error")
                ? "text-red-500"
                : "text-green-500"
            }`}
          >
            {deleteMessage}
          </p>
        )}
      </CardContent>
      {isManager && (
        <CardFooter className='flex justify-end gap-2'>
          <Button variant='outline' size='sm' asChild>
            <Link href={`/dashboard/templates/${template.id}/edit`}>Edit</Link>
          </Button>
          <Button
            variant='destructive'
            size='sm'
            onClick={handleDelete}
            disabled={isDeleting || isPending}
          >
            {isDeleting || isPending ? "Deleting..." : "Delete"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
