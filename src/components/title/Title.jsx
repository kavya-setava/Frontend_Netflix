import React from "react";

const Title = (props) =>
{
    return(
        <div>
                 <h2 className="mb-4" style={{ 
  fontWeight: 'bold', 
  fontSize: 'clamp(14px, 4vw, 18px)' 
}}>
  {props?.title}
</h2>

        </div>
    )
}
export default Title