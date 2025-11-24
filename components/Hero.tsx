import Image from 'next/image'
import React from 'react'

const Hero = () => {
    return (
        <>
        <hr className="h-px border-0 bg-gray-300 shadow-md"/>
            <div className="flex flex-col items-center md:flex-row md:justify-center md:mx-auto md:max-w-6xl md:px-4 py-12">

                <div className="flex items-center justify-center px-4 mb-6 md:mb-0 md:mr-10">
                    <Image
                        className="mx-2 rounded-3xl mt-4 w-70 h-50 md:w-160 md:h-110 object-cover"
                        src="/hero.jpeg"
                        alt="hero1"
                        width={300}
                        height={300} />
                </div>

                <div className=" flex items-center text-2xl font-bold text-primary">
                    Kost Griya Citra
                </div>
            </div>
        </>

    )
}

export default Hero