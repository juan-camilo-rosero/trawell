"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-(--breakpoint-xl) w-full mx-auto grid lg:grid-cols-2 gap-12 custom-ph">
        <div>
          <h1 className="mt-6 max-w-[17ch] text-4xl md:text-5xl lg:text-[2.75rem] xl:text-[3.25rem] font-medium">
            Plan your next trip in <b className="font-semibold">seconds</b>
          </h1>
          <p className="mt-6 max-w-[60ch] sm:text-lg text-foreground/80">
            Your itinerary is just a few clicks away
          </p>
          <div className="mt-12 flex items-center gap-4">
            <Link
              href="/sign-up"
              className="rounded-full text-base primary-btn flex items-center gap-2 justify-center !py-3"
            >
              Start now <ArrowUpRight className="h-5! w-5!" />
            </Link>
            <Link href="#" className="third-btn !py-3">
              Learn more
            </Link>
          </div>
        </div>
        <div className="w-full aspect-video flex items-center justify-center rounded-xl">
          <img
            src="static/hero_section_illustration.png"
            alt="Snoopy"
            className="h-full rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}
