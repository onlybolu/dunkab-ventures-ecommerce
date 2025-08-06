"use client";

import Link from "next/link";
import { useEffect } from "react";
import Aos from "aos";
import "aos/dist/aos.css";
import Image from "next/image";
import Img1 from "../../../public/img1.png"

export default function LandingPage() {
  useEffect(() => {
    Aos.init({
      delay: 100,
      duration: 700,
      once: false,
    });
  }, []);

  return (
    <div className="text-gray-700">
      <section className="flex flex-col-reverse md:flex-row lg:flex-row justify-evenly items-center py-10 text-white bg-gray-600 md:h-[70vh]">
        <div data-aos="zoom-in-right" className="flex flex-col gap-5">
          <h1 className="text-4xl font-medium w-72">
            Island breeze 28 quarts
          </h1>
          <Link href="/products">
            <div className="flex flex-col gap-1">
              <p className="font-medium">Shop Now</p>
              <hr className="w-20" />
            </div>
          </Link>
        </div>
        <Image data-aos="zoom-in-left" className="w-96 xl:w-130" src={Img1} alt="cooler" width={1000} height={100} />
      </section>

      <section className="flex justify-evenly flex-col md:flex-row lg:flex-row pt-14 pb-20 bg-[#dbc8c8] text-gray-700">
        <div className="relative flex items-end">
          <div data-aos="zoom-in-up" className="absolute bottom-5 md:bottom-12 lg:bottom-12 left-10 flex flex-col gap-3 z-10">
            <h1 className="text-xl font-medium">Fisti Cup</h1>
            <Link href="/products">
              <div className="flex flex-col gap-1">
                <p className="font-medium">View More</p>
                <hr className="w-20 border-gray-800" />
              </div>
            </Link>
          </div>
          <Image
          data-aos="zoom-in-down"
            src="/img1.png"
            alt="Fisti Cup"
            width={10000}
            height={100}
            className="w-96 pl-15 pb-4"
          />

        </div>


        <div className="relative flex items-end">
          <div data-aos="zoom-in-up" className="absolute bottom-5 md:bottom-12 lg:bottom-12 left-10 flex flex-col gap-3 z-10">
            <h1 className="text-xl font-medium">Fisti Cup</h1>
            <Link href="/products">
              <div className="flex flex-col gap-1">
                <p className="font-medium">View More</p>
                <hr className="w-20 border-gray-800" />
              </div>
            </Link>
          </div>
          <Image
          data-aos="zoom-in-down"
            src="/img1.png"
            alt="Fisti Cup"
            width={10000}
            height={100}
            className="w-96 pl-15"
          />

        </div>

      </section>
    </div>
  );
}
