import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import List from "@/components/List";
import Loc from "@/components/Loc";
import Image from "next/image";

export default function Home() {
  return (
    <>
    <Navbar />
    <Hero />
    <List />
    <Loc />
    <Footer />
    </>
  );
}
