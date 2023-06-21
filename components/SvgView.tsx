import { useEffect, useState } from "react"

type SvgViewProps = {
    image: string,
    height: number,
    width: number,
}
 
export default function SvgView(props: SvgViewProps) {

    return (
        <div dangerouslySetInnerHTML={{
            __html: svg
        }} />
    )
}