import React from "react";

interface ButtonProbs{
    className:string;
    text:string;
    type:"submit"|"reset"|"button"|undefined;
}

const Button : React.FC<ButtonProbs> = ({className,text,type})=>{
    return (
        <button
            className={className}
            type ={type}
        >{text}</button>
    )
}
export default Button;