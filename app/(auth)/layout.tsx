import Image from "next/image";
import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="w-1/2 h-full flex items-center justify-center">
        {children}
      </div>
      <div className="hidden md:flex w-1/2 h-full relative">
        <Image
          src="https://images.pexels.com/photos/7583375/pexels-photo-7583375.jpeg"
          fill
          alt="Doctors"
          className="object-cover"
          sizes="50vw"
          priority
        />
        <div className="absolute inset-0 z-10 bg-black/40 flex flex-col items-center justify-center">
          <h1 className="text-3xl 2xl:text-5xl font-bold text-white">
            Abia HMS
          </h1>
          <p className="text-blue-500 text-base">You&apos;re welcome</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;