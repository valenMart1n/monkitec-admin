import "./Home.css"
import { useNavigate } from "react-router-dom";
function Home(){
    const navigate = useNavigate();
    const handleClickProduct = () => {
        navigate(`${process.env.REACT_APP_ADMIN_URL}/products`);
    }
    const handleClickCategories = () => {
        navigate(`${process.env.REACT_APP_ADMIN_URL}/categories`);
    }
    const handleClickVariations = () => {
        navigate(`${process.env.REACT_APP_ADMIN_URL}/variations`);
    }

    return(
        <div className="home-background">
            <div className="home-option" onClick={handleClickProduct}><p className="option-label">Productos</p></div>
            <div className="home-option" onClick={handleClickCategories}><p className="option-label">Categorías</p></div>
            <div className="home-option" onClick={handleClickVariations}><p className="option-label">Variaciones</p></div>
        </div>
    );
}
export default Home;