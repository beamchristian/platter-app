// src/lib/actions.ts
import { schema } from "@/lib/schema";
import db from "@/lib/db/db";
import { executeAction } from "@/lib/executeAction";
import { hash } from "bcryptjs"; // Make sure bcryptjs is imported

const signUp = async (formData: FormData) => {
  return executeAction({
    actionFn: async () => {
      const email = formData.get("email");
      const password = formData.get("password");

      const validatedData = schema.parse({ email, password });

      // --- CRITICAL FIX: HASH THE PASSWORD HERE ---
      const hashedPassword = await hash(validatedData.password, 10); // Use a salt round of 10 or more

      await db.user.create({
        data: {
          email: validatedData.email.toLocaleLowerCase(),
          passwordHash: hashedPassword, // <--- Use the HASHED password here
          role: "TEAM_MEMBER", // Add default role if not handled by Prisma's @default
        },
      });
    },
    successMessage: "Signed up successfully",
  });
};

export { signUp };
