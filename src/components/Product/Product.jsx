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
    const [oldVariations, setOldVariations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState([]);
    const [productState, setProductState] = useState({
        id: 0,
        desc: "",
        precio: 0,
        imagen:"",
        imagen2:"",
        stock_total: 0,
        category: "",
        variations: []
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
        const fetchAvailableVariations = async () => {
            try{
                const response = await fetch(`${process.env.REACT_APP_API_URL}/variations`, {
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
              
                if(!productState.variations){
                    console.log("Fueron seteadas: ", allVariations);
                    setAvailableVariations(allVariations.map(variation => {
                        return {
                            id: variation.Product_Variation.id,
                            desc: variation.descripcion
                        }
                    }));
                }
                if(productState.variations){
                    
                    const available = allVariations.filter(variation => {
                        return !productState.variations.some(pv => pv.variation_id === variation.id);
                    });
                    setAvailableVariations(available);
                }
                 const responseCategories = await fetch(`${process.env.REACT_APP_API_URL}/categories/listAll`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    }
                });

                if(!responseCategories.ok){
                    throw new Error(`Error: ${responseCategories.status}`);
                }

                const allCategories = await responseCategories.json();
                const availableCategories = allCategories.data.filter((category) => {
                    return category.id != productState.category.id;
                })
                setCategories(availableCategories);
            }catch(error){
                console.log(error);
            }
        }
        fetchAvailableVariations();
    },[productState?.variations]);

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
        try{
            const formData = new FormData();
            formData.append("desc", productState.desc);
            formData.append("precio", productState.precio);
            formData.append("category_id", selectedCategory.id);
            formData.append("stock_total", productState.stock_total);
            
            if(productState.imagenFile){
                formData.append("imagen", productState.imagenFile);
            }
            if(productState.imagen2File){
                formData.append("imagen2", productState.imagen2File);
            }

            const productResponse = await fetch(`${process.env.REACT_APP_API_URL}/products/create`, {
                method: "POST",
                body: formData
            });

            const productData = await productResponse.json();

            const addVariations = productState.variations.map(variation => {
                try{
                    fetch(`${process.env.REACT_APP_API_URL}/product-variation/create`, {
                        method:"POST",
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            id_producto: productData.data,
                            id_variacion: variation.variation_id,
                            stock: variation.stock
                        })
                    }).then(async res => {
                        if(!res.ok){
                            const errorText = await res.text();
                            console.error(`Error al agregar variante ${variation.variation_id}:`, errorText);
                            throw new Error(`Variante ${variation.variation_id}: ${res.status}`);
                        }
                    });
                }catch(error){
                    alert("Error al agregar product-variation: ", error);
                }
            });

            await Promise.all(addVariations);
            navigate(`${process.env.REACT_APP_ADMIN_URL}/products`);
            alert("Producto creado con exito");
        }catch(error){
            alert("Error en base de datos: ", error);
        }
    }

    const handleUpdate = async() => {
        try{
            const formData = new FormData();
            formData.append('id', productState.id);
            formData.append('desc', productState.desc);
            formData.append('precio', productState.precio);
            formData.append("stock_total", productState.stock_total || 0);
            formData.append("category_id", selectedCategory.id);
            
            // Agregar imágenes si hay archivos nuevos
            if (productState.imagenFile) {
                formData.append('imagen', productState.imagenFile);
            }
            if (productState.imagen2File) {
                formData.append('imagen2', productState.imagen2File);
            }
            
            // Actualizar producto
            const productResponse = await fetch(`${process.env.REACT_APP_API_URL}/products/update`, {
                method: "POST",
                body: formData 
            });

            if (!productResponse.ok) {
                throw new Error(`Error producto: ${productResponse.status}`);
            }

            const updatedVariations = productState.variations.filter(newVariation => {
                return oldVariations?.some(oldVariation => 
                   oldVariation.variation_id ==  newVariation.variation_id
                );
            });            
            console.log("PREPARADOS PARA ACTUALIZAR: ", updatedVariations);
            const updatePromises = updatedVariations.map(update => 
                fetch(`${process.env.REACT_APP_API_URL}/product-variation/update`, {
                    method: 'POST',
                    headers: {  
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: update.id,
                        stock: update.stock
                    })
                }).then(async res => {
                    if (!res.ok) {
                        const errorText = await res.text();
                        console.error(`Error variante ${update.id} con stock: ${update.stock}:`, errorText);
                        throw new Error(`Variante ${update.id}: ${res.status}`);
                    }
                    return res.json();
                    
                }).catch(err => {
                    console.error("Error en fetch:", err);
                    alert("Error en la base de datos: "+ err);
                    return { success: false, id: update.id, error: err.message };
                })
            );

            const deletedVariations = oldVariations.filter(oldVariation => {
                return !productState.variations?.some(newVariation => 
                    newVariation.variation_id == oldVariation.variation_id 
                );
            });
            const deleteVariations = deletedVariations.map(variation => {
                try{
                    fetch(`${process.env.REACT_APP_API_URL}/product-variation/delete`, {
                        method: "POST",
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: variation.id})
                    }).then(async res => {
                        if (!res.ok) {
                            const errorText = await res.text();
                            console.error(`Error al borrar variante ${variation.id}:`, errorText);
                            throw new Error(`Variante ${variation.id}: ${res.status}`);
                    }});
                }catch(error){
                    alert("Error al eliminar product-variation: ", error);
                }
            })

            const addedVariations = productState.variations.filter(newVariation => {
                return !oldVariations.some(oldVariation => 
                    oldVariation.variation_id == newVariation.variation_id
                );
            });

            const addVariations = addedVariations.map(variation => {
                try{
                    fetch(`${process.env.REACT_APP_API_URL}/product-variation/create`, {
                        method:"POST",
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            id_producto: productState.id,
                            id_variacion: variation.variation_id,
                            stock: variation.stock
                        })
                    }).then(async res => {
                        if(!res.ok){
                            const errorText = await res.text();
                            console.error(`Error al agregar variante ${variation.variation_id}:`, errorText);
                            throw new Error(`Variante ${variation.variation_id}: ${res.status}`);
                        }
                    });
                }catch(error){
                    alert("Error al agregar product-variation: ", error);
                }
            });

            await Promise.all(updatePromises);
            await Promise.all(deleteVariations);
            await Promise.all(addVariations);
            setNewVariantStock(0);
            navigate(`${process.env.REACT_APP_ADMIN_URL}/products`);
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
    
     const append = (id) => {
        setProductState(prev => ({
            ...prev,
            stock_total: prev.stock_total + 1,
            variations: prev.variations.map(variation => 
                variation.id == id
                ? {...variation, stock: variation.stock + 1}
                : variation
            )
        }))    
    }
    
    const prepend = (id) => {
    
    setProductState(prev => ({
        ...prev,
        stock_total: prev.stock_total - 1,
        variations: prev.variations.map(variation => 
            variation.id === id && variation.stock > 0
                ? { ...variation, stock: variation.stock - 1 }
                : variation
        ),
        }));
    };

    const handleNewVariation = () => {
        if(selectedVariant != null && newVariantStock > -1){
            console.log("ID DE LA VARIANTE ELEGIDA: ", selectedVariant.id);
            const existedBefore = oldVariations.find(old => 
                old.variation_id === selectedVariant.id
                
            );
        console.log("RESULTADO DEL EXISTED: ",existedBefore);
        if (existedBefore) {
        
            setProductState(prev => {
                const currentVariations = prev.variations || [];
                return {
                    ...prev,
                variations: [
                    ...currentVariations,  
                    {
                        id: existedBefore.id,
                        variation_id: selectedVariant.id,
                        desc: selectedVariant.descripcion,
                        stock: newVariantStock
                    }
                ]}
            });
        }else{
             setProductState(prev => {
                const currentVariations = prev.variations || [];
                return {
                    ...prev,
                variations: [
                    ...currentVariations,  
                    {
                        variation_id: selectedVariant.id,
                        desc: selectedVariant.descripcion,
                        stock: newVariantStock
                    }
                ]}
            });
        }
            setSelectedVariant(null);
            setNewVariantStock(0);
            console.log("variante agregada: " + selectedVariant.id, " su stock es: "+ newVariantStock);
            
        }
    }

    const handleDeleteVariation = (variationId) => {
        const indexToDelete  = productState.variations.findIndex(v => 
            v.id === variationId
        );
        
        const deletedVariation = productState.variations[indexToDelete];

        const newVariations = productState.variations.filter((_, index) => 
            index != indexToDelete
        );

        setProductState(prev => ({...prev, variations: newVariations}));

        if(deletedVariation){
            const restoredVariation = {
            id: deletedVariation.id,
            descripcion: deletedVariation.descripcion  
            };
            setAvailableVariations(prev => [...prev, restoredVariation]);
        }
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
            const response = await fetch(`${process.env.REACT_APP_API_URL}/products/byId`, {
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
                
                if (!productData) {
                    throw new Error("PRODUCT_NOT_FOUND");
                }
                if(productData){
                console.log("Datos del producto recibidos:", productData);
                const cleanProduct = extractProductData(productData);
                console.log("Producto limpio:", cleanProduct);
                setProduct(cleanProduct);
                
                const productStateVariations = cleanProduct.variations?.map((variation) => {
                return {
                    id: variation.Product_Variation.id,
                    desc: variation.descripcion || variation.desc, // Usa descripcion o desc
                    stock: variation.Product_Variation?.stock ||  
                           variation.stock || 
                           0,
                    variation_id: variation.id
                    };
                }) || [];

                setOldVariations(productStateVariations);
         
                setProductState({
                    id: cleanProduct.id,
                    desc: cleanProduct.desc || "",
                    precio: cleanProduct.precio || 0,
                    ruta_imagen: cleanProduct.ruta_imagen || "",
                    imagen: getImage(cleanProduct.imagen_optimizada, cleanProduct.ruta_imagen)||"",
                    imagen2: getImage(cleanProduct.imagen2_optimizada, cleanProduct.ruta_imagen2)||"",
                    stock_total: cleanProduct.stock_total || 0,
                    category: cleanProduct.category,
                    variations: productStateVariations
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
        const result = productState.imagen2;
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
    
    const categoryName = product?.category?.desc || "";
    const image1 = productState.imagen;
    const image2 = productState.imagen2;
    
    return (
        <div className="product-detail-background">
            <section className="image-section">
                {(!primary && productState.imagen2File ||!primary && hasSecondImage) && (
                    <Icon css="previus-image" icon={faAngleLeft} onClick={()=>{setPrimaryImage(true)}}/>
                )}
                
                <div className={`product-image-container ${hasSecondImage() ? 'has-hover' : ''}`}>
                    {image1 ? (
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
                            onChange={(e) => handleImageChange(e, 'imagen')}
                        />
                        {(image1 || productState.imagen) && (
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
                    <select className="product-detail-select" onChange={(e) => {
                        if(e.target.value === ""){
                            setSelectedVariant(null);
                        } else {
                            const selectedIndex = e.target.selectedIndex - 1;
                            console.log("Categoria seleccionada: ", categories[selectedIndex].desc);
                            setSelectedCategory(categories[selectedIndex]);
                        }
                    }}>
                        <option value={productState.category?.desc||""}>{productState.category?.desc||"Selecciona una categoría"}</option>
                        {categories.map((category) => {
                            return(
                                <option
                                    key={category.id}
                                    value={category.id}
                                    className="category-option"
                                >
                                    {category.desc}
                                </option>
                            )
                        })}
                    </select>
                </section>
                <section className="options-section">
                    
                    {categoryName.includes("Vapes") ? (
                        <p className="product-variation-title">Agregar sabor:</p>
                    ) : (
                        <p className="product-variation-title">Agregar variación:</p>
                    )}
                    <div className="select-background">
                    <select className="product-detail-select" onChange={(e) => {
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
                            <option value="">Selecciona una variacion</option>
                        )}
                        
                        {availableVariations.map((variation, index) => {                               
                            return (
                                <option 
                                    key={variation.id}
                                    value={variation.id}
                                    className="variation-option"
                                >
                                    {variation.descripcion}
                                </option>
                            );
                        })}
                    </select>
                    </div>
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
                    <button className="add-variation-button" onClick={handleNewVariation}>AGREGAR</button>
                </section>
                
                {productState.variations?.map((variation, index) => {
                    return (
                        <li
                            key={variation.id}
                            value={variation.id}
                            className="product-variation-row"
                        > 
                            <p className="row-title">{variation.desc}</p>
                            {console.log("id: ", variation.id, " stock: ", variation.stock)}
                            <div className="row-buttons">
                                <div className="form-quantity">
                                    <button 
                                        type="button" 
                                        className="form-quantity-button-minus" 
                                        onClick={() => {prepend(variation.id)}}
                                        disabled={variation.stock <= 0}
                                    >
                                        <Icon icon={faMinus}/>
                                    </button>
            
                                    <input 
                                        className="form-quantity-input" 
                                        type="number" 
                                        min="0"
                                        value={variation.stock} 
                                        onChange={(e) => {
                                            if(selectedVariant){
                                                setNewVariantStock(Math.max(0, parseInt(e.target.value) || 0));
                                            }
                                        }}
                                    />
                    
                                    <button 
                                        type="button" 
                                        className="form-quantity-button-plus" 
                                        onClick={() => {append(variation.id)}}
                                    >
                                        <Icon icon={faPlus}/>
                                    </button>
                                </div>
                                <button
                                    className="form-trash-button"
                                    onClick={() => handleDeleteVariation(variation.id)}
                                >
                                    <Icon icon={faTrashCan}/>    
                                </button>
                            </div>
                        </li>
                    );
                })}
                
                <section className="product-detail-buttons">
                    <p className="product-stock-label">Stock Disponible:</p>
                    
                    {productState.variations.length == 0 || !productState.variations ?  (
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
                            {productState.stock_total = productState.variations?.reduce((sum, stock) => sum + stock.stock, 0)}
                        </div>
                    )}
                    
                    <button 
                        className="edit-button-detail"
                        onClick={id ? handleUpdate : handleCreate}
                    >
                        {id ? "GUARDAR CAMBIOS": "CREAR PRODUCTO"}
                    </button>
                </section>
            </div>  
        </div>
    );
}

export default Product;