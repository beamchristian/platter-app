import { SignOut } from "@/components/sign-out";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const Page = async () => {
  const session = await auth();
  if (!session) redirect("/sign-in");

  return (
    <>
      <div className='bg-secondary rounded-lg p-4 text-center mb-6'>
        <p className='text-secondary-foreground'>Signed in as:</p>
        <p className='font-medium text-foreground'>
          {session.user?.email}
        </p>{" "}
        {/* Use text-foreground for the email */}
      </div>

      <SignOut />
    </>
  );
};

export default Page;
