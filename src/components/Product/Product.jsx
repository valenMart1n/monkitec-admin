import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Product.css"
import Error404 from "../Error404/Error404";

import { Icon } from "../Icon";
import { faAngleLeft, faAngleRight, faMinus, faPlus, faTrashCan } from "@fortawesome/free-solid-svg-icons";

function Product() {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [primary, setPrimaryImage] = useState(true);
    const [touchStartX, setTouchStartX] = useState(0);
    const [stocks, setStocks] = useState([]);
    const [availableVariations, setAvailableVariations] = useState([]);
    const [newVariantStock, setNewVariantStock] = useState(0);

    const [productState, setProductState] = useState({
        desc: "",
        precio: 0,
        imagen1: "",
        imagen2: "",
        stock_total: 0
    });

    const incrementTotal = () => {
        setProductState(prev => ({
            ...prev,
            stock_total: (prev.stock_total || 0) + 1
        }));
    };

    const decrementTotal = () => {
        setProductState(prev => ({
            ...prev,
            stock_total: Math.max(0, (prev.stock_total || 0) - 1)
        }));
    };

    const setTotalDirectly = (value) => {
        const val = Math.max(0, parseInt(value) || 0);
        setProductState(prev => ({
            ...prev,
            stock_total: val
        }));
    };

    useEffect(() => {
        if (product) {
            setProductState({
                desc: product.desc || "",
                precio: product.precio || 0,
                imagen1: product?.ruta_imagen || "",
                imagen2: product.ruta_imagen2 || "",
                stock_total: product.stock_total || 0
            });
        }
    }, [product]); 

    useEffect(() => {
        const fetchAvailableVariations = async () => {
            try{
                const response = await fetch("http://localhost:3030/variations", {
                    method:"GET",
                    headers: { 
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                });

                if(!response.ok){
                    throw new Error(`Error: ${response.status}`);
                }

                const allVariations = await response.json();
                console.log("Producto inexistente: ", product);
                if(!product){
                    console.log("Fueron seteadas: ", allVariations);
                    setAvailableVariations(allVariations);
                }else{
                const available = allVariations.filter(variation => {
                    return !product.variations?.some(pv => pv.id === variation.id);
                });

                setAvailableVariations(available);
            }
            }catch(error){
                console.log(error);
            }
        }
        fetchAvailableVariations();
    },[product?.id, product?.variations]);

    const handleImageChange = (e, imageField) => {
        console.log("Image change ejecutado");
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            
            setProductState(prev => ({
                ...prev,
                [imageField]: imageUrl,
                [`${imageField}File`]: file
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
        const rawValue = e.target.value.replace(/\./g, '');
        setProductState(prev => ({
            ...prev,
            precio: parseFloat(rawValue) || 0
        }));
    };

    const handleTouchStart = (e) => {
        setTouchStartX(e.touches[0].clientX);
    };
    
    const handleCreate = async()=>{

    }

    const handleDelete = async(productVariationId) => {
        try{
            await fetch("http://localhost:3030/product-variation/delete", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: productVariationId })
            }).then(async res => {
                if (!res.ok) {
                    const errorText = await res.text();
                    console.error(`Error al borrar variante ${productVariationId}:`, errorText);
                    throw new Error(`Variante ${productVariationId}: ${res.status}`);
                }
                
                const indexToDelete = product?.variations.findIndex(v => 
                    v.Product_Variation?.id === productVariationId
                );
                
                if (indexToDelete === -1) {
                    console.error("No se encontró la variante con ID:", productVariationId);
                    return;
                }
                
                // Guardar la variante que se va a borrar (para agregar a disponibles)
                const deletedVariation = product?.variations[indexToDelete];
                
                // Crear nuevos arrays sin ese elemento
                const newVariations = product?.variations.filter((_, index) => 
                    index !== indexToDelete
                );
                
                const newStocks = stocks.filter((_, index) => 
                    index !== indexToDelete
                );
                
                // Actualizar estados
                setProduct(prev => ({ ...prev, variations: newVariations }));
                setStocks(newStocks);
                
                // Agregar a variaciones disponibles
                if (deletedVariation) {
                    setAvailableVariations(prev => [...prev, deletedVariation]);
                }
                
                alert("Variante borrada");
                return res.json();
            }).catch(err => {
                console.error("Error en fetch:", err);
                alert("Error en la base de datos: "+ err);
                return { success: false, id: productVariationId, error: err.message };
            })
        }catch(err){
            console.error("Error en fetch:", err);
            alert("Error en la base de datos: "+ err);
            return { success: false, error: err.message };
        }
    }

    const handleUpdate = async() => {
        try{
            const formData = new FormData();
            formData.append('id', product.id);
            formData.append('desc', productState.desc);
            formData.append('precio', productState.precio);
            
            // Calcular stock total
            if(product?.variations.length === 0){
                formData.append("stock_total", productState.stock_total || 0);
            } else {
                const calculatedTotal = stocks.reduce((sum, stock) => sum + stock, 0);
                formData.append("stock_total", calculatedTotal);
            }
            
            // Agregar imágenes si hay archivos nuevos
            if (productState.imagen1File) {
                formData.append('imagen', productState.imagen1File);
            }
            if (productState.imagen2File) {
                formData.append('imagen2', productState.imagen2File);
            }
            
            // Actualizar producto
            const productResponse = await fetch("http://localhost:3030/products/update", {
                method: "POST",
                body: formData 
            });

            if (!productResponse.ok) {
                throw new Error(`Error producto: ${productResponse.status}`);
            }

            // Actualizar stocks de variaciones existentes
            const stockUpdates = product?.variations.map((variation, index) => ({
                id: variation.Product_Variation?.id || variation.id,
                stock: stocks[index] || 0
            }));

            console.log("Enviando stocks:", stockUpdates);

            const updatePromises = stockUpdates.map(update => 
                fetch('http://localhost:3030/product-variation/update', {
                    method: 'POST',
                    headers: {  
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(update)
                }).then(async res => {
                    if (!res.ok) {
                        const errorText = await res.text();
                        console.error(`Error variante ${update.id}:`, errorText);
                        throw new Error(`Variante ${update.id}: ${res.status}`);
                    }
                    return res.json();
                }).catch(err => {
                    console.error("Error en fetch:", err);
                    alert("Error en la base de datos: "+ err);
                    return { success: false, id: update.id, error: err.message };
                })
            );

            // Agregar nueva variación si se seleccionó
            if(selectedVariant != null && newVariantStock > 0){
                await fetch("http://localhost:3030/product-variation/create", {
                    method: "POST",
                    headers: {  
                        'Content-Type': 'application/json'
                    }, 
                    body: JSON.stringify({
                        id_producto: product.id,
                        id_variacion: selectedVariant.id,
                        stock: newVariantStock
                    })
                }).then(async res => {
                    if(!res.ok){
                        const errorText = await res.text();
                        console.error("Error variante", errorText);
                        throw new Error(`Variante ${res.status}`);
                    }
                    return res.json();
                }).catch(err => {
                    console.error("Error en fetch:", err);
                    alert("Error en la base de datos: "+ err);
                    return { success: false, error: err.message };
                });
            }

            await Promise.all(updatePromises);
            setNewVariantStock(0);
            navigate("/products");
            alert("Producto Actualizado correctamente");

        }catch(error){
            console.error("Error al guardar:", error);
            alert("Error al guardar");
        }
    }

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
    
    const append = (indice) => {
        setStocks(prevStocks => {
            const newStocks = [...prevStocks];
            newStocks[indice] = (newStocks[indice] || 0) + 1;
            return newStocks;
        });
    }
    
    const prepend = (indice) => {
        setStocks(prevStocks => {
            const newStocks = [...prevStocks];
            newStocks[indice] = Math.max(0, (newStocks[indice] || 0) - 1);
            return newStocks;
        });
    }

    // Función unificada para extraer datos del producto
    const extractProductData = (productData) => {
        let product = productData;
        
        // Si viene desde la API con estructura {success, data}
        if (productData.success && productData.data) {
            product = productData.data;
        }
        
        // Si viene directamente desde la lista
        if (productData.data && productData.data.product) {
            product = productData.data.product;
        }
        
        return {
            id: product.id,
            desc: product.desc,
            precio: product.precio,
            hasImage: !!(product?.ruta_imagen || product?.imagen_public_id || product?.ruta_imagen2 || product?.imagen_public_id2),
            variations: product?.Variations || product?.variations || [],
            stock_total: product.stock_total || 0,
            disponible: product.disponible !== false,
            category: product?.Category || product?.category || null,
            imagen_optimizada: product?.imagen_optimizada || null,
            imagen2_optimizada: product.imagen2_optimizada || null,
            ruta_imagen: product?.ruta_imagen || null,
            ruta_imagen2: product.ruta_imagen2 || null,
            imagen_public_id: product.imagen_public_id || null,
            imagen_public_id2: product.imagen_public_id2 || null
        };
    };

    // Función para obtener producto desde API
    const fetchProductFromAPI = async (productId) => {
        try {
            const response = await fetch("http://localhost:3030/products/byId", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ id: parseInt(productId) })
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("PRODUCT_NOT_FOUND");
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const productData = await response.json();
            return productData;
        } catch (error) {
            console.error("Error fetching product:", error);
            throw error;
        }
    
    };

    useEffect(() => {
        
        const fetchProduct = async () => {
            try {
                setLoading(true);
                
                let productData;
                
                // Caso 1: Viene desde la lista (con state)
                if (location.state?.product) {
            
                    console.log("Cargando desde location.state");
                    productData = location.state.product;
                } 
                // Caso 2: Acceso directo por URL - necesitamos fetch
                else if (id){

                    console.log("Haciendo fetch desde API");
                    productData = await fetchProductFromAPI(id);
                }
                
                if (!productData && product) {
                    throw new Error("PRODUCT_NOT_FOUND");
                }
                if(productData){
                console.log("Datos del producto recibidos:", productData);
                const cleanProduct = extractProductData(productData);
                console.log("Producto limpio:", cleanProduct);
                setProduct(cleanProduct);

                // Configurar stocks de variaciones
                if (cleanProduct.variations) {
                    const initialStocks = cleanProduct?.variations.map(variation => 
                        variation.stock_info?.stock || 
                        variation.Product_Variation?.stock || 
                        0
                    );
                    console.log("Stocks iniciales:", initialStocks);
                    setStocks(initialStocks);
                }
                
                // Configurar productState
                setProductState({
                    desc: cleanProduct.desc || "",
                    precio: cleanProduct.precio || 0,
                    imagen1: cleanProduct.ruta_imagen || "",
                    imagen2: cleanProduct.ruta_imagen2 || "",
                    stock_total: cleanProduct.stock_total || 0
                });
            
            }
            } catch (error) {
                console.error("Error cargando producto:", error);
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, location.state]);

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
        const result = getImage(product?.imagen2_optimizada, product?.ruta_imagen2);
        console.log("Resultado segunda imagen:", result);
        if(result === 0 || result == null){
            return false;
        }
        return true;
    };
    
    // Mostrar loading
    if (loading) {
        return <div className="loading">Cargando producto...</div>;
    }
    
    
    const variations = product?.variations || [];
    const categoryName = product?.category?.desc || "";
    const image1 = productState.imagen1 || getImage(product?.imagen_optimizada, product?.ruta_imagen);
    const image2 = productState.imagen2 || getImage(product?.imagen2_optimizada, product?.ruta_imagen2);
    
    const showTotal = variations.length === 0 
        ? (productState.stock_total || 0) 
        : stocks.reduce((sum, stock) => sum + stock, 0);
    
    return (
        <div className="product-detail-background">
            <section className="image-section">
                {(!primary && productState.imagen2File ||!primary && hasSecondImage) && (
                    <Icon css="previus-image" icon={faAngleLeft} onClick={()=>{setPrimaryImage(true)}}/>
                )}
                
                <div className={`product-image-container ${hasSecondImage() ? 'has-hover' : ''}`}>
                    {productState.imagen1File || product.hasImage ? (
                        <>
                            <img 
                                src={image1} 
                                alt={productState.desc || product?.desc}
                                className={`prod-image primary ${!primary? 'hidden':''}`}
                            />
                            
                            {(productState.imagen2File || hasSecondImage) && (
                                <img 
                                    src={image2} 
                                    alt={`${productState.desc || product?.desc} - vista alterna`}
                                    onTouchStart={handleTouchStart}
                                    onTouchEnd={handleTouchEnd}
                                    className={`prod-image secondary ${!primary? 'active':''}`}
                                />
                            )}
                        </>
                    ) : (
                        null
                    )}
                    
                </div>
                
                {(productState.imagen2File && primary ||primary && hasSecondImage) && (
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
                                src={productState.imagen1} 
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
                    placeholder="Ingresa descripción"
                    value={productState.desc}
                    onChange={handleDescChange}
                />
                <input 
                    className="product-detail-price" 
                    type="text"
                    value={productState.precio.toLocaleString('es-AR')}
                    onChange={handlePriceChange}
                />
                
                <section className="options-section">
                    {categoryName.includes("Vapes") ? (
                        <p className="product-variation-title">Agregar sabor:</p>
                    ) : (
                        <p className="product-variation-title">Agregar variación:</p>
                    )}
                    <select className="variations" onChange={(e) => {
                        console.log("Seleccionado: " + e.target.selectedIndex);
                        if(e.target.value === ""){
                            setSelectedVariant(null);
                        } else {
                            const selectedIndex = e.target.selectedIndex - 1;
                            console.log("Arreglo disponibles: " + availableVariations[selectedIndex]?.id);
                            setSelectedVariant(availableVariations[selectedIndex]);
                        }
                    }}>
                        {categoryName.includes("Vapes") ? (
                            <option value="">Selecciona un sabor</option>
                        ) : (
                            <option value="">Selecciona un color</option>
                        )}
                        
                        {availableVariations.map((variation, index) => {                               
                            return (
                                <option 
                                    key={variation.id||index}
                                    value={variation.id||index}
                                    className="variation-option"
                                >
                                    {variation.descripcion}
                                </option>
                            );
                        })}
                    </select>
                    <div className="form-new-quantity">
                        <button 
                            type="button" 
                            className="form-new-quantity-button-minus" 
                            onClick={() => setNewVariantStock(prev => Math.max(0, prev - 1))}
                        >
                            <Icon icon={faMinus}/>
                        </button>
                        <input 
                            className="form-new-quantity-input" 
                            type="number" 
                            min="0"
                            value={newVariantStock}
                            onChange={(e) => {
                                if (selectedVariant) {
                                    setNewVariantStock(Math.max(0, parseInt(e.target.value) || 0));
                                }
                            }}
                        />
                    
                        <button 
                            type="button" 
                            className="form-new-quantity-button-plus" 
                            onClick={() => setNewVariantStock(prev => prev + 1)}
                        >
                            <Icon icon={faPlus}/>
                        </button>
                    </div>
                    
                </section>
                
                {variations.map((variation, index) => {
                    const stock = variation.stock_info?.stock || variation.Product_Variation?.stock || 0;
                    const isOutOfStock = stock === 0;
                    
                    return (
                        <li
                            key={variation.id || index}
                            value={variation.id || index}
                            className="product-variation-row"
                            disabled={isOutOfStock}
                        > 
                            <p className="row-title">{variation.descripcion}</p>
                            <div className="row-buttons">
                                <div className="form-quantity">
                                    <button 
                                        type="button" 
                                        className="form-quantity-button-minus" 
                                        onClick={() => prepend(index)}
                                        disabled={stocks[index] <= 0}
                                    >
                                        <Icon icon={faMinus}/>
                                    </button>
            
                                    <input 
                                        className="form-quantity-input" 
                                        type="number" 
                                        min="0"
                                        value={stocks[index]} 
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value) || 0;
                                            setStocks(prev => {
                                                const newStocks = [...prev];
                                                newStocks[index] = Math.max(0, val);
                                                return newStocks;
                                            });
                                        }}
                                    />
                    
                                    <button 
                                        type="button" 
                                        className="form-quantity-button-plus" 
                                        onClick={() => append(index)}
                                    >
                                        <Icon icon={faPlus}/>
                                    </button>
                                </div>
                                <button
                                    className="form-trash-button"
                                    onClick={() => handleDelete(variation.Product_Variation?.id || variation.id)}
                                >
                                    <Icon icon={faTrashCan}/>    
                                </button>
                            </div>
                        </li>
                    );
                })}
                
                <section className="product-detail-buttons">
                    <p className="product-stock-label">Stock Disponible:</p>
                    
                    {variations.length === 0 ? (
                        <div className="form-quantity">
                            <button 
                                type="button" 
                                className="form-quantity-button-minus" 
                                onClick={decrementTotal}
                                disabled={(productState.stock_total || 0) <= 0}
                            >
                                <Icon icon={faMinus}/>
                            </button>
                            
                            <input 
                                className="form-quantity-input" 
                                type="number" 
                                min="0"
                                value={productState.stock_total || 0} 
                                onChange={(e) => setTotalDirectly(e.target.value)}
                            />
                            
                            <button 
                                type="button" 
                                className="form-quantity-button-plus" 
                                onClick={incrementTotal}
                            >
                                <Icon icon={faPlus}/>
                            </button>
                        </div>
                    ) : (
                        <div className="product-stock-total">
                            {stocks.reduce((sum, stock) => sum + stock, 0)}
                        </div>
                    )}
                    
                    <button 
                        className="edit-button-detail"
                        onClick={product ? handleUpdate : handleCreate}
                    >
                        {product ? "GUARDAR CAMBIOS": "CREAR PRODUCTO"}
                    </button>
                </section>
            </div>  
        </div>
    );
}

export default Product;