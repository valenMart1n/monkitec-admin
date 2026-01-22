import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import CategoryItem from "./CategoryItem/CategoryItem";
import "./CategoryList.css"
import { Icon } from "../Icon";
import { faPlus } from "@fortawesome/free-solid-svg-icons";


function CategoryList(){
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categoriesArray, setCategoriesArray] = useState([]);

    const handleCategoryClick = (category) => {
        navigate(`${process.env.REACT_APP_ADMIN_URL}/category/${category.id}`, {
            state: {category}
        });
    };

    const extractCategoryData = (category) => {
        return {
            id: category.id,
            desc: category.desc,
            parent: category.parent,
            imageUrl: getImageUrl(category),
            hasImage: !!(category.ruta_imagen || category.imagen_public_id)
        };
    };

    const getImageUrl = (item) => {
        if (item.imagen_optimizada) {
            return item.imagen_optimizada.original||
                   item.imagen_optimizada.medium||
                   null;
        }
        if (item.ruta_imagen) {
            return item.ruta_imagen;
        }
        
        return "/default-category.png";
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            
            try{
                const categoryRes = await fetch(`${process.env.REACT_APP_API_URL}/categories/listAll`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    }
                });
                if(categoryRes.ok){
                    const dataJson = await categoryRes.json();
                    const data = dataJson.success ?  dataJson.data : dataJson;

                    const categoriesWithImages = Array.isArray(data)
                        ? data.map(extractCategoryData)
                        : [];

                    setCategoriesArray(categoriesWithImages);
                }
            }catch(error){
                alert("Error en la base de datos: ", error);
                setCategoriesArray([]);
            }finally{
                setLoading(false);
            }
        }
        fetchData();
    }, [])
    return(
        <div className="category-list-background">
            <h1 className="category-list-title">Categorias</h1>
                {categoriesArray.map((category) => (
                    <div key={category.id} className="category-listed-background">
                        <CategoryItem
                            id={category.id}
                            name={category.desc}
                            imageUrl={category.imageUrl}
                            hasImage={category.hasImage}
                            onClick={() => handleCategoryClick(category)}
                            onDelete={() => {
                                setCategoriesArray(prev => prev.filter(p => p.id !== category.id));
                            }}
                        />
                    </div>
                ))}
            <button className="add-product-button" onClick={()=>{navigate(`${process.env.REACT_APP_ADMIN_URL}/categories/create`)}}><Icon icon={faPlus}/></button>
        </div>
    );
}
export default CategoryList;