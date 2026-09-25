import { Button } from "@/components/ui/button";
import { getRole } from "@/utils/roles";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  const role = await getRole();

  if (userId && role){
    redirect(`/${role}`)
  }

  console.log(userId);
  return (
    <div className="flex flex-col items-center justify-center h-screen p-6">
      <div className="flex flex-col items-center justify-center">
      <Image src="/logo.png" alt="logo" width={300} height={300} className="h-auto" priority />
        <div className="mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-center">Welcome to <br />
           <span className="text-green-500 text-5xl md:text-6xl">Abia</span> <span className=" text-blue-500 text-5xl md:text-6xl">HMS</span>
           </h1>
        </div>.
        <div className="text-center max-w-xl flex flex-col items-center justify-center">
        <p className="mb-8">
          Welcome to the Abia Health Management System. 
          This is a platform for managing the health of the people of Abia State.
        </p>
        <div className="flex gap-4">
          {
            userId ? (
             <>
              <Link href={`/${role}`}>
                  <Button>View Dashboard</Button>
                </Link>
             {/*  <UserButton /> */}
             </>
            ) :  (
            <>
            <Link href="/sign-up">
              <Button className="md:text-base font-light">
                New Patient
                </Button>
            </Link> 

            <Link href="/sign-in">
            <Button variant="outline" className="md:text-base underline hover:text-blue-600">
              Login to your account</Button>
            </Link>
            </>
            )}
        </div>
      </div>
      </div>
      <footer className="mt-88">
        <p className="text-center text-sm">
          &copy; 2026 Abia State Hospital Management System. All rights reserved.
        </p>
      </footer>

    </div>
  );
}
