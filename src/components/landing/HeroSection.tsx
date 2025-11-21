"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-(--breakpoint-xl) w-full mx-auto grid lg:grid-cols-2 gap-12 custom-ph">
        <div>
          <h1 className="mt-6 max-w-[17ch] text-4xl md:text-5xl lg:text-[2.75rem] xl:text-[3.25rem] font-medium">
            Planea tu próximo viaje en <b className="font-semibold">segundos</b>
          </h1>
          <p className="mt-6 max-w-[60ch] sm:text-lg text-foreground/80">
            Explore a collection of Shadcn UI blocks and components, ready to
            preview and copy. Streamline your development workflow with
            easy-to-implement examples.
          </p>
          <div className="mt-12 flex items-center gap-4">
            <Link
              href="/sign-up"
              className="rounded-full text-base primary-btn flex items-center gap-2 justify-center !py-3"
            >
              Empezar ahora <ArrowUpRight className="h-5! w-5!" />
            </Link>
            <Link href="#" className="third-btn !py-3">
              Ver más
            </Link>
          </div>
        </div>
        <div className="w-full aspect-video bg-secondary-200 rounded-xl">
          <img
            src="static/hero_section_snoopy.jpg"
            alt="Snoopy"
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}
