"use client";

import Image from "next/image";
// import logo from '../assets/icons/logo-footer.svg'
// import fapesq from '../assets/icons/fapesq-logo.png'
import secties from "../assets/images/SECTIES_branco.png";
import gov from "../assets/icons/gov.svg";
import govFull from "../assets/icons/gov.png";
import { usePathname } from "next/navigation";
import line from "../assets/images/line02.svg";
import { cn } from "@/lib/utils";

export function Footer({
  light,
  homepage,
}: {
  light?: boolean;
  homepage?: boolean;
}) {
  const pathname = usePathname().slice(1);

  return (
    pathname !== "map/ocorrencias" && (
      <footer
        className={cn(
          "relative bottom-0 z-[20] hidden w-full items-center justify-start md:mt-0 lg:flex",
          light ? "bg-white" : "bg-primary py-4",
        )}
      >
        <div
          className={cn(
            "flex h-20 w-full items-center justify-start pl-9",
            light
              ? "overflow-hidden"
              : "hidden h-14 justify-center px-8 py-0 md:h-fit md:justify-start lg:flex",
          )}
        >
          {light ? (
            <>
              {/* <Image src={logo} alt="logo" className='w-32 md:w-44 hidden sm:block' /> */}
              <Image
                src={govFull}
                alt="logo"
                className="z-10 h-12 w-64 md:w-96"
              />
              <Image
                src={line}
                alt="logo"
                className="absolute right-0 z-0 hidden h-full self-end sm:block md:w-[50%] lg:w-[80%] xl:w-[90%]"
              />
            </>
          ) : (
            <>
              <Image
                src={secties}
                alt="logo"
                className="w-28 md:h-12 md:w-auto"
              />
              <Image src={gov} alt="logo" className="w-28 md:h-12 md:w-auto" />
            </>
          )}
        </div>
      </footer>
    )
  );
}
