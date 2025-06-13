// src/app/dashboard/templates/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import db from "@/lib/db/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlatterTemplateCard } from "@/components/platter-template-card";
import { Decimal } from "@prisma/client/runtime/library";
// import { PlatterSizeEnum } from "@prisma/client";

const PlatterTemplatesPage = async () => {
  const session = await auth();

  if (!session) {
    redirect("/sign-in");
  }
  if (session.user.role !== "MANAGER" && session.user.role !== "TEAM_MEMBER") {
    redirect("/unauthorized");
  }

  const platterTemplates = await db.platterTemplate.findMany({
    include: {
      department: {
        select: {
          name: true,
        },
      },
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
      variations: {
        select: {
          id: true,
          size: true,
          price: true, // This is a Prisma Decimal object
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  const serializablePlatterTemplates = platterTemplates.map((template) => ({
    ...template,
    variations: template.variations.map((variation) => {
      let priceAsString: string;

      // --- CRITICAL DEBUGGING LOGS ---
      //   console.log(
      //     `\n--- Analyzing price for Template: ${template.name}, Variation: ${variation.size} ---`
      //   );
      //   console.log(`  1. Raw value of variation.price:`, variation.price);
      //   console.log(`  2. typeof variation.price:`, typeof variation.price);
      //   console.log(
      //     `  3. Is null or undefined?`,
      //     variation.price === null || variation.price === undefined
      //   );
      //   if (variation.price !== null && variation.price !== undefined) {
      //     console.log(
      //       `  4. Constructor name:`,
      //       (variation.price as any)?.constructor?.name
      //     );
      //     // This is the key check: does it have toFixed as a function?
      //     console.log(
      //       `  5. Has .toFixed method (runtime check):`,
      //       typeof (variation.price as any).toFixed === "function"
      //     );
      //     // If it's a Decimal.js instance, it will have a .d property (its internal array of digits)
      //     console.log(
      //       `  6. Has .d property (indicates decimal.js object):`,
      //       (variation.price as any)?.d ? "YES" : "NO"
      //     );
      //     // Also log the prototype to see where toFixed might be
      //     console.log(
      //       `  7. Object.getPrototypeOf(variation.price):`,
      //       Object.getPrototypeOf(variation.price)
      //     );
      //   }
      // --- END CRITICAL DEBUGGING LOGS ---

      if (variation.price !== null && variation.price !== undefined) {
        try {
          // This line is causing the error if the above checks are false.
          priceAsString = (variation.price as Decimal).toFixed(2);
        } catch (e) {
          console.error(
            `  RUNTIME ERROR: Failed to convert price for template ${template.name} variation ${variation.size}.`,
            `  Value: ${
              variation.price
            }, Typeof: ${typeof variation.price}. Error:`,
            e
          );
          // Fallback if toFixed fails at runtime
          priceAsString = String(variation.price);
        }
      } else {
        priceAsString = "0.00"; // Default value for null/undefined prices
      }

      return {
        ...variation,
        price: priceAsString,
      };
    }),
  }));

  const isCurrentUserManager = session.user.role === "MANAGER";

  return (
    <div className='container mx-auto py-8'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold text-card-foreground'>
          Platter Templates
        </h1>
        {isCurrentUserManager && (
          <Button asChild>
            <Link href='/dashboard/templates/create'>Create New Template</Link>
          </Button>
        )}
      </div>

      {serializablePlatterTemplates.length === 0 ? (
        <p className='text-muted-foreground text-center mt-10'>
          No platter templates found.{" "}
          {isCurrentUserManager && "Click 'Create New Template' to add one."}
        </p>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {serializablePlatterTemplates.map((template) => (
            <PlatterTemplateCard
              key={template.id}
              template={template}
              isManager={isCurrentUserManager}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlatterTemplatesPage;
