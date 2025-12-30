import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


export const Icon = ({icon,css, onClick}) => {
    return(
        <FontAwesomeIcon className={css} icon={icon} onClick={onClick}/>
    )
}
