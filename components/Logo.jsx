import { default as Image } from "next/image"




const Logo = ({width, height}) => {
    return(
        <div className="flex items-center gap-1">
            <Image src={"/logo.png"} className={`${width} ${height}`} alt="" width={100} height={100} />
            <h1 className="text-2xl font-bold">Dunkab</h1>
        </div>
    )
}

export default Logo
