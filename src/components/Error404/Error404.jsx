import "./Error404.css"
import errorImg from "../../img/404-Image.jpg";
import { useParams, useNavigate } from "react-router-dom";

function Error404(){
    const navigate = useNavigate();
    
    return(
        <div className="error-background">
        <h1 className="title-error">Error 404</h1>
        <p className="label-error">La página que estabas buscando no existe</p>
        <img src={errorImg} className="error-image"/>
        <div className="home-button-container">
            <button className="home-button" onClick={() => {navigate("/")}}>Volver al inicio</button>
        </div>
        </div>
    )
}
export default Error404;