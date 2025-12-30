import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Product.css"
import Error404 from "../Error404/Error404";
import ignite from "../../img/ignite.jpg"
import { Icon } from "../Icon";
import { faAngleLeft, faAngleRight, faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";

function Product() {
    const { id } = useParams();
    const location = useLocation();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [primary, setPrimaryImage] = useState(true);
    const [touchStartX, setTouchStartX] = useState(0);

    // Estado para los datos editables
    const [productState, setProductState] = useState({
        desc: "",
        precio: 0,
        imagen1: "",
        imagen2: ""
    });

    // Actualizar productState cuando product se carga
    useEffect(() => {
        if (product) {
            setProductState({
                desc: product.desc || "",
                precio: product.precio || 0,
                imagen1: product.ruta_imagen || "",
                imagen2: product.ruta_imagen2 || ""
            });
        }
    }, [product]); // Se ejecuta cuando product cambia

    const handleImageChange = (e, imageField) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            
            setProductState(prev => ({
                ...prev,
                [imageField]: imageUrl
            }));
        }
    };

    const handleDescChange = (e) => {
        setProductState(prev => ({
            ...prev,
            desc: e.target.value
        }));
    };

    const handlePriceChange = (e) => {
        // Remover separadores de miles para convertir a número
        const rawValue = e.target.value.replace(/\./g, '');
        setProductState(prev => ({
            ...prev,
            precio: parseFloat(rawValue) || 0
        }));
    };

    const handleTouchStart = (e) => {
        setTouchStartX(e.touches[0].clientX);
    };
    
    const handleTouchEnd = (e) => {
        if (!touchStartX) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;
        const minSwipeDistance = 50;
        
        if (diff > minSwipeDistance) {
            setPrimaryImage(false);
        }
        else if (diff < -minSwipeDistance) {
            setPrimaryImage(true);
        }
        
        setTouchStartX(0);
    };

    const append = () => {
        setQuantity(prev => prev + 1);
    }
    
    const prepend = () => {
        if(quantity > 1){
            setQuantity(prev => prev - 1);
        }
    }

    // Función para extraer datos limpios del producto
    const extractProductData = (productData) => {
        let product = productData;
        if (productData.success && productData.data) {
            product = productData.data;
        }
        
        return {
            id: product.id,
            desc: product.desc,
            precio: product.precio,
            hasImage: !!(product.ruta_imagen || product.imagen_public_id || product.ruta_imagen2 || product.imagen_public_id2),
            variations: product.Variations || product.variations || [],
            stock_total: product.stock_total || 0,
            disponible: product.disponible !== false,
            category: product.Category || null,
            imagen_optimizada: product.imagen_optimizada || null,
            imagen2_optimizada: product.imagen2_optimizada || null,
            ruta_imagen: product.ruta_imagen || null,
            ruta_imagen2: product.ruta_imagen2 || null
        };
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                
                if (location.state?.product) {
                    const cleanProduct = extractProductData(location.state.product);
                    setProduct(cleanProduct);
                    setLoading(false);
                    return;
                }
                
                const response = await fetch("http://localhost:3000/products/byId", {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({ id: parseInt(id) })
                });
                
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error("PRODUCT_NOT_FOUND");
                    }
                    throw new Error("Error en la petición");
                }
                
                const productData = await response.json();
                
                if (!productData) {
                    throw new Error("PRODUCT_NOT_FOUND");
                }
                
                const cleanProduct = extractProductData(productData);
                setProduct(cleanProduct);

            } catch (error) {
                console.error("Error:", error);
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, location.state]);
    
    // Mostrar loading
    if (loading) {
        return <div className="loading">Cargando producto...</div>;
    }
    
    // Mostrar error 404 si no hay producto
    if (!product) {
        return <Error404/>;
    }
    
    const variations = product.variations || [];
    const categoryName = product.category?.desc || "";
    
    const getImage = (optimizada, ruta) => {
        if (!optimizada && !ruta) {
            return null;
        }

        if (optimizada) {
            const url = optimizada.detail || 
                       optimizada.large || 
                       optimizada.medium || 
                       optimizada.original || 
                       null;
            
            if (url && isCloudinaryPlaceholder(url)) {
                return null;
            }
            return url;
        }
        if (ruta) {
            if (isCloudinaryPlaceholder(ruta)) {
                return null;
            }
            return ruta;
        }
        
        return null;
    };
    
    const isCloudinaryPlaceholder = (url) => {
        if (!url) return true;
    
        const placeholderPatterns = [
            '/0?_a=',      
            '/image/upload/0',
            '/default',    
            '/placeholder' 
        ];
    
        return placeholderPatterns.some(pattern => url.includes(pattern));
    };

    const hasSecondImage = () => {
        const result = getImage(product.imagen2_optimizada, product.ruta_imagen2);
        if(result == 0 || result == null){
            return false;
        }
        return true;
    };
    
    // Usar productState para las imágenes en lugar de product
    const image1 = productState.imagen1 || getImage(product.imagen_optimizada, product.ruta_imagen);
    const image2 = productState.imagen2 || getImage(product.imagen2_optimizada, product.ruta_imagen2);
    
    return (
        <div className="product-detail-background">
            <section className="image-section">
                {(!primary && hasSecondImage()) && (
                    <Icon css="previus-image" icon={faAngleLeft} onClick={()=>{setPrimaryImage(true)}}/>
                )}
                
                <div className={`product-image-container ${hasSecondImage() ? 'has-hover' : ''}`}>
                    {product.hasImage ? (
                        <>
                            <img 
                                src={image1} 
                                alt={productState.desc || product.desc}
                                className={`prod-image primary`}
                                onError={(e) => {
                                    e.target.src = ignite;
                                }}
                            />
                            
                            {(hasSecondImage()) && (
                                <img 
                                    src={image2} 
                                    alt={`${productState.desc || product.desc} - vista alterna`}
                                    onTouchStart={handleTouchStart}
                                    onTouchEnd={handleTouchEnd}
                                    className={`prod-image secondary ${!primary? 'active':''}`}
                                    onError={(e) => {
                                        e.target.src = image1 || ignite;
                                    }}
                                />
                            )}
                        </>
                    ) : (
                        <img 
                            src={ignite} 
                            alt={productState.desc || product.desc}
                            className="prod-image"
                        />
                    )}
                    
                    {!product.hasImage && (
                        <div className="image-placeholder-note">
                            Imagen no disponible
                        </div>
                    )}
                </div>
                
                {(hasSecondImage() && primary) && (
                    <Icon css="next-image" icon={faAngleRight} onClick={()=> {setPrimaryImage(false)}}/>
                )}
            </section>
            
            <div className="detail-container">
                {/* Sección de edición de imágenes */}
                <div>
                    <div>
                        <label>Imagen Principal:</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, 'imagen1')}
                        />
                        {(image1 || productState.imagen1) && (
                            <img 
                                src={image1} 
                                alt="Preview 1" 
                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                            />
                        )}
                    </div>
                    
                    <div>
                        <label>Imagen Secundaria:</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, 'imagen2')}
                        />
                        {(image2 || productState.imagen2) && (
                            <img 
                                src={image2} 
                                alt="Preview 2" 
                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                            />
                        )}
                    </div>
                </div>
                
               
                <input 
                    className="product-detail-title" 
                    type="text" 
                    value={productState.desc}
                    onChange={handleDescChange}
                />
                <input 
                    className="product-detail-price" 
                    type="text"
                    value={productState.precio.toLocaleString('es-AR')}
                    onChange={handlePriceChange}
                />
                
                {variations.length > 0 && (
                    <section className="options-section">
                        <select className="variations" onChange={(e) => {
                            if(e.target.value === ""){
                                setSelectedVariant(null);
                            } else {
                                const selectedIndex = e.target.selectedIndex - 1;
                                setSelectedVariant(variations[selectedIndex]);
                            }
                        }}>
                            {categoryName.includes("Vapes") ? (
                                <option value="">Selecciona un gusto</option>
                            ) : (
                                <option value="">Selecciona un color</option>
                            )}
                            
                            {variations.map((variation, index) => {
                                const stock = variation.stock_info?.stock || variation.Product_Variation?.stock || 0;
                                const isOutOfStock = stock === 0;
                                
                                return (
                                    <option 
                                        key={variation.id || index}
                                        value={variation.id || index}
                                        className="variation-option"
                                        disabled={isOutOfStock}
                                        style={{
                                            backgroundColor: isOutOfStock ? "rgb(61, 61, 61)" : "white",
                                            color: isOutOfStock ? "white" : "black"
                                        }}
                                    >
                                        {isOutOfStock ? 
                                            `${variation.descripcion} (sin stock)` : 
                                            variation.descripcion}
                                    </option>
                                );
                            })}
                        </select>
                    </section>
                )}
                
                <section className="product-detail-buttons">
                    <p className="product-stock-label">Stock Disponible: </p>
                    <div className="form-quantity">
                        
                        <button 
                            type="button" 
                            className="form-quantity-button-minus" 
                            onClick={(e) => {
                                e.preventDefault();
                                prepend();
                            }}
                            disabled={quantity <= 1}
                        >
                            <Icon icon={faMinus}/>
                        </button>
                        
                        <input 
                            className="form-quantity-input" 
                            type="number" 
                            min="1"
                            max={product.stock_total || 99}
                            value={quantity} 
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (val > 0 && val <= (product.stock_total || 99)) {
                                    setQuantity(val);
                                }
                            }}
                        />
                        
                        <button 
                            type="button" 
                            className="form-quantity-button-plus" 
                            onClick={() => append()}
                            disabled={quantity >= (product.stock_total || 99)}
                        >
                            <Icon icon={faPlus}/>
                        </button>
                    </div>
                    
                    <button 
                        className="shop-button-detail"
                        disabled={!product.disponible || (selectedVariant && selectedVariant.stock_info?.stock === 0)}
                    >
                        GUARDAR CAMBIOS
                    </button>
                </section>
            </div>  
        </div>
    );
}

export default Product;