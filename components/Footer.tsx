import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className=" py-10">
             

        <div className="max-w-7xl mx-auto mt-3 grid grid-cols-1  md:grid-cols-3  gap-2 items-center">
            

           <div className=" my-9 flex justify-center items-center">
            <Link href={'/'}>
                <Image width={200} height={200} src="/logo.png" alt="" />
            </Link>
           </div>

            {/* Social Media */}
           <div className=" my-9  grid place-items-center">
                <h1 className="text-xl font-semibold text-primary ">SOCIAL MEDIA</h1> 
                    <div className="flex p-1 items-center justify-center mt-2">
                        <Image width={200} height={200} className="size-9" src="/footer/footer1.png" alt="" />
                        <a className="text-primary ml-2" href="https://www.instagram.com/amara_kostputri.ptk/profilecard/?igsh=MWhraDVmODV3ejJ1aA=="> nama.ig</a>
                    </div>

                    <div className="flex p-1 items-center justify-center">
                        <Image width={200} height={200} className="size-9" src="/footer/footer2.png" alt="" />
                        <a className="text-primary ml-2" href="https://api.whatsapp.com/send/?phone=6289504100165&text&type=phone_number&app_absent=0&wame_ctl=1"> +62..</a>
                    </div>      
           </div>
           {/* End Social Media */}

           <div className=" my-9  grid ">
                <h1 className="text-xl font-semibold text-primary text-center">KOST GRIYA CITRA</h1> 
                    <div className="flex  p-1 mx-auto my-2">
                        <a className="text-primary ml-2" href="/">Laporkan Keluhan</a>
                    </div>

                    <div className="flex  p-1 mx-auto my-2">
                        <a className="text-primary ml-2" href="/">Cek Ketersedian Kamar</a>
                    </div>
                    
           </div>
            
        </div>
    </footer>
    );
}