import Image from 'next/image'
import React from 'react'

const List = () => {
    return (
        <div className="">
            <div className="max-w-80 md:max-w-5xl mx-auto p-2">

                <div className="py-3">
                    <h2 className="text-primary text-center text-2xl font-bold">Fasilitas</h2>

                    <div className="inline-block text-center bg-primary rounded-2xl my-5">
                        <Image width={1000} height={1000} className="h-auto rounded-tr-2xl rounded-tl-2xl  mx-auto " src="/list/list1.jpg" alt="" />
                        <p className="text-l font-semibold text-white my-2">Kipas Angin - Kasur - Lemari</p>
                    </div>

                    <div className="inline-block text-center bg-primary rounded-2xl my-5">
                        <Image width={1000} height={1000} className="h-auto rounded-tr-2xl rounded-tl-2xl  mx-auto " src="/list/list1.jpg" alt="" />
                        <p className="text-l font-semibold text-white my-2">Kipas Angin - Kasur - Lemari</p>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default List