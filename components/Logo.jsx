import { default as Image } from "next/image"




const Logo = ({width, height}) => {
    return(
        <div>
            <Image src={"/logo.png"} className={`${width} ${height}`} alt="" width={100} height={100} />
        </div>
    )
}

export default Logo
