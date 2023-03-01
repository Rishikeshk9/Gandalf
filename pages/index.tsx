import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import Navbar from "@/components/navbar";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="flex flex-col align-middle items-center text-center">
        <div className="mt-36 text-4xl">
          <strong className="text-primary">🧙‍♂️Gandalf</strong> is the Protocol
          Layer for storing Data <br></br>
          Securely on Flow Blockchain.
        </div>
        <div className="mt-3 text-lg">
          Speed up your Dapp Development using Gandalf
        </div>
        <Link
          href="/dashboard"
          className="btn btn-active btn-primary
        mt-6"
        >
          Get API Key 🚀
        </Link>
      </div>
    </>
  );
}
