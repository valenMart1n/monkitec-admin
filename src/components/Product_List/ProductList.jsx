import { useEffect, useState } from "react";
import "./ProductList.css";
import { useNavigate } from "react-router-dom";
import ListedProduct from "./Listed_Products/ListedProduct"; // Importa ListedProduct
import { Icon } from "../Icon";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

function ProductList(){
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [productsArray, setProductsArray] = useState([]);
    
    

    const getImageUrl = (item) => {
        if (item.imagen_optimizada) {
            return item.imagen_optimizada.thumbnail || 
                   item.imagen_optimizada.medium || 
                   item.imagen_optimizada.original;
        }
        if (item.ruta_imagen) {
            return item.ruta_imagen;
        }
        return "/default-category.png";
    };
     const getImage2Url = (item) => {
        if (item.imagen2_optimizada) {
            return item.imagen2_optimizada.thumbnail || 
                   item.imagen2_optimizada.medium || 
                   item.imagen2_optimizada.original;
        }
        if (item.ruta_imagen2) {
            return item.ruta_imagen2;
        }
        return "/default-category.png";
    };
    
    const extractProductData = (product) => {
        return {
            id: product.id,
            desc: product.desc,
            precio: product.precio,
            imageUrl: getImageUrl(product),
            imageUrl2: getImage2Url(product),
            hasImage: !!(product.ruta_imagen || product.imagen_public_id|| product.image_public_id2),
            variations: product.Variations || product.variations || [],
            stock_total: product.stock_total || 0,
            disponible: product.disponible !== false,
            ruta_imagen: product.ruta_imagen,
            ruta_imagen2: product.ruta_imagen2,
            imagen_public_id: product.imagen_public_id,
            image_public_id2: product.imagen_public_id2,
            imagen_optimizada: product.imagen_optimizada,
            imagen2_optimizada: product.imagen2_optimizada,
            category: product.Category 
        };
    };
    
    const getProductDetail = (product) => {
       
        navigate(`${process.env.REACT_APP_ADMIN_URL}/product/${product.id}`, {
            state: {  product: {
                id: product.id,
                desc: product.desc,
                precio: product.precio,
                imageUrl: getImageUrl(product),
                imageUrl2: getImage2Url(product),
                hasImage: !!(product.ruta_imagen || product.imagen_public_id|| product.image_public_id2),
                variations: product.Variations || product.variations || [],
                stock_total: product.stock_total || 0,
                disponible: product.disponible !== false,
                ruta_imagen: product.ruta_imagen,
                ruta_imagen2: product.ruta_imagen2,
                imagen_public_id: product.imagen_public_id,
                image_public_id2: product.imagen_public_id2,
                imagen_optimizada: product.imagen_optimizada,
                imagen2_optimizada: product.imagen2_optimizada,
                category: product.category
            } }
        });
    };
    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try{
                const result = await fetch(`${process.env.REACT_APP_API_URL}/products`, {
                    method:"GET",
                    headers: { 
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    }
                });
                
                if(result.status === 404){
                    throw new Error("PRODUCTS_NOT_FOUND");
                }
                
                if(result.ok){
                    const productsJson = await result.json();  
                    let products;
                    
                    if(productsJson.success){
                        products = productsJson.data.products || productsJson.data;
                    }else{
                        products = productsJson;
                    }
                    
                    const productsWithImages = Array.isArray(products) 
                        ? products.map(extractProductData)
                        : [];
                    
                    setProductsArray(productsWithImages);
                    console.log("Productos agregados: ", productsWithImages)
                } else {
                    throw new Error("Error al obtener productos");  
                }
            } catch(error){
                console.error("Error en fetchData:", error); 
            } finally {
                setLoading(false);
            }
        };
        
        
        fetchData();
        
    }, []); 
    
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Cargando productos...</p>
            </div>
        );
    }
    
    return(
        <div className="products-list-background">
           <h1 className="products-list-title">Lista de Productos</h1>
           {productsArray.length > 0 ? (
               productsArray.map((product, index) => (
                  <ListedProduct
                       key={product.id || index}
                       product={product}
                       onClick={() => getProductDetail(product)}
                       onDelete={() => {
                        setProductsArray(prev => prev.filter(p => p.id !== product.id));
                       }}
                   />
               ))
               
           ) : (
               <div className="no-products">
                   <p>No se encontraron productos</p>
               </div>
           )}
           <button className="add-product-button" onClick={()=>{navigate(`${process.env.REACT_APP_ADMIN_URL}/products/create`)}}><Icon icon={faPlus}/></button>
        </div>
        
    );
}

export default ProductList;