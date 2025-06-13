// src/app/unauthorized/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Assuming you have a button component

const UnauthorizedPage = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 text-center'>
      <h1 className='text-4xl font-bold text-red-500 mb-4'>Access Denied</h1>
      <p className='text-lg text-muted-foreground mb-8'>
        You do not have permission to access this page.
      </p>
      <Button asChild>
        <Link href='/'>Go to Home</Link>
      </Button>
    </div>
  );
};

export default UnauthorizedPage;
