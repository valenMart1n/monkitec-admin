import "./Home.css"
import { useNavigate } from "react-router-dom";
function Home(){
    const navigate = useNavigate();
    const handleClickProduct = () => {
        navigate("/products");
    }
    const handleClickCategories = () => {
        navigate("/categories");
    }
    return(
        <div className="home-background">
            <div className="home-option" onClick={handleClickProduct}>Productos</div>
            <div className="home-option" onClick={handleClickCategories}>Categorías</div>
        </div>
    );
}
export default Home;