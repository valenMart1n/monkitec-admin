import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateProductForm.css"
import { Icon } from "../../Icon";
import { faMinus, faPlus, faTrash, faTrashCan } from "@fortawesome/free-solid-svg-icons";

function CreateProductForm(){
    const navigate = useNavigate();
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [availableVariations, setAvailableVariations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newVariantStock, setNewVariantStock] = useState(0);
    const [stocks, setStocks] = useState([]);

    const [productState, setProductState] = useState({
            desc: "",
            precio: 0,
            imagen1: "",
            imagen2: "",
            stock_total: 0,
            variations: []
        });
    

    const handleImageChange = (e, imageField) => {
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

    const handleNewVariation = () => {
        if(selectedVariant != null && newVariantStock > -1){
            setProductState(prev => ({
                ...prev,
                variations: [
                    ...prev.variations,  
                    {
                        id: selectedVariant.id,
                        desc: selectedVariant.descripcion,
                        stock: newVariantStock
                    }
                ]
            }));
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
            setAvailableVariations(prev => [...prev, deletedVariation]);
        }
    }

    const handleSendProduct = async() => {
        try{
            const formData = new FormData();
            if(productState.desc != "" && productState.precio != 0 && selectedCategory.id != null && productState.imagen1){
            console.log("Desc", productState.desc, " precio: ", productState.precio, " category_id: ", selectedCategory.id, " imagen ", productState.imagen1);
            formData.append("desc", productState.desc);
            formData.append("precio", productState.precio);
            formData.append("category_id", selectedCategory.id);
            formData.append("stock_total", productState.stock_total);
            formData.append("imagen", productState.imagen1File);
            if(productState.imagen2File != ""){
                formData.append("imagen2", productState.imagen2File);
            }

            const productResponse = await fetch("http://localhost:3030/products/create", {
                method: "POST",
                body: formData
            });

            if(!productResponse.ok){
                throw new Error(`Error producto: ${productResponse.status}`);
            }
            const productData = await productResponse.json();
            const stockVariations = productState.variations.map((variation, index) => ({
                id: variation.id,
                stock: variation.stock||0
            }));

            const associateVariations = stockVariations.map(variation => 
                fetch("http://localhost:3030/product-variation/create", {
                    method: "POST",
                    headers: {  
                        'Content-Type': 'application/json'
                    }, 
                    body: JSON.stringify({
                        id_producto: productData.data,
                        id_variacion: variation.id,
                        stock: variation.stock
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
                })
            )    
            await Promise.all(associateVariations);
            setSelectedCategory(null);
            setNewVariantStock(0);
            setSelectedVariant(null);
            navigate("/products")
        }
        }catch(err){
            console.error("Error en fetch:", err);
            alert("Error en la base de datos: "+ err);
            return { success: false, error: err.message };
        }
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
    useEffect(() => {
        
        const fetchAvailableVariations = async () => {
            try{
                console.log("asasas");
                const response = await fetch("http://localhost:3030/variations", {
                    method:"GET",
                    headers: { 
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    }
                });
                
                if(!response.ok){
                    throw new Error(`Error: ${response.status}`);
                }

                const allVariations = await response.json();

                const available = allVariations.filter(variation => {
                    return !productState.variations?.some(pv => pv.id === variation.id);
                });

                setAvailableVariations(available);
                console.log("Variaciones Obtenidas");
               
                const responseCategories = await fetch("http://localhost:3030/categories", {
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

                setCategories(allCategories.data);
                console.log("Categorias obtenidas")
            }catch(error){
                console.log(error);
            }
        }
        fetchAvailableVariations();
        
    },[productState?.id, productState?.variations]);

    return(
        <div className="create-product-form">
            <section className="preview-image-container">
                <div className="preview-container">
                    <p>Imagen Principal:</p>
                    
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'imagen1')}
                    />
                    {(productState.imagen1) && (
                        <img
                            src={productState.imagen1}
                            alt="Previsualizacion 1"
                            className="preview"
                        />
                    )}
                </div>

                <div className="preview-container">
                    <p>Imagen Secundaria: </p>
                    
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, "imagen2")}
                    />

                    {(productState.imagen2) && (
                        <img
                            src={productState.imagen2}
                            alt="Previsualizacion 2"
                            className="preview"
                        />
                    )}
                </div>
            </section>
            <section className="input-container">
            <input
                className="product-create-title"
                type="text"
                value={productState.desc}
                onChange={handleDescChange}
            />
            <input
                className="product-create-price"
                type="text"
                value={productState.precio.toLocaleString("es-AR")}
                onChange={handlePriceChange}
            />
            <section className="options-create-section">
                <p className="product-category-title">Seleccionar Categoría</p>
                <select className="create-product-category" onChange={(e) => {
                    if(e.target.value == ""){
                        setSelectedCategory(null)
                    }else{
                        const selectedIndex = e.target.selectedIndex-1;
                        setSelectedCategory(categories[selectedIndex]);
                    }
                }}>
                    <option value="">Selecciona una categoría</option>
                {categories.map((category, index) => {
                    return(
                        <option
                            key={category.id || index}
                            value={category.id|| index}
                            className="category-create-option"
                        >
                            {category.desc}
                        </option>
                    )
                })}
                </select>
           
                <p className="product-variation-title">Agregar Variante</p>
                <select className="create-product-variations" onChange={(e) => {
                    if(e.target.value === ""){
                        setSelectedVariant(null);
                    }else{
                        const selectedIndex = e.target.selectedIndex -1;
                        setSelectedVariant(availableVariations[selectedIndex]);
                        console.log(availableVariations[selectedIndex]);
                    }
                }}>
                    <option value="">Selecciona una variante</option>                
                    {availableVariations.map((variation, index) => {
                        return (
                            <option
                                key={variation.id || index}
                                value={variation.id|| index}
                                className="variation-create-option"
                            >
                                {variation.descripcion}
                            </option>
                        )
                    })}
                </select>
                </section>
                <div className="create-form-new-quantity">
                    <button
                        type="button"
                        className="create-form-new-quantity-button-minus"
                        onClick={() => setNewVariantStock(prev => Math.max(0, prev- 1))}
                    >
                        <Icon icon={faMinus}/>
                    </button>
                    <input
                        className="create-form-new-quantity-input"
                        type="number"
                        min="0"
                        value={newVariantStock}
                        onChange={(e) => {
                            if(selectedVariant){
                                setNewVariantStock(Math.max(0, parseInt(e.target.value) || 0));
                                }
                            }
                        }
                    />

                    <button
                        type="button"
                        className="create-form-new-quantity-button-plus"
                        onClick={()=> setNewVariantStock(prev => prev + 1)}
                    >
                        <Icon icon={faPlus}/>
                    </button>
                    <button className="add-variation-button" onClick={handleNewVariation}>AGREGAR</button>
                </div>
                <ul className="create-form-variations-list">
                    {productState.variations.map((variation, index) => {
                        return(
                            <li
                                key={variation.id || index}
                                value={variation.id|| index}
                                className="create-form-variations-item"
                            >
                                <p className="create-form-row-title">{variation.desc}</p>
                                <div className="create-form-row-buttons">
                            
                            <button
                                type="button"
                                className="create-form-new-quantity-button-minus"
                                onClick={() => {prepend(variation.id)}}
                            >
                                <Icon icon={faMinus}/>
                            </button>
                    
                            <input
                                className="create-form-new-quantity-input"
                                type="number"
                                min="0"
                                value={variation.stock}
                                onChange={(e) => {
                                    if(selectedVariant){
                                        setNewVariantStock(Math.max(0, parseInt(e.target.value) || 0));
                                    }
                                }
                            }
                            />

                            <button
                                type="button"
                                className="create-form-new-quantity-button-plus"
                                onClick={() => {append(variation.id)}}
                            >
                                <Icon icon={faPlus}/>
                            </button>
                            <button onClick={() => handleDeleteVariation(variation.id)}><Icon icon={faTrashCan}/></button>
                        </div>
                        </li>
                        )
                    })}
                    
                </ul>
            </section>
            
            <section className="product-create-details">
                <p className="product-stock-label">Stock Disponible: {productState.stock_total = productState.variations.reduce((sum, stock) => sum + stock.stock, 0)}</p>
                <button className="product-create-send" onClick={() => handleSendProduct()}>Crear Producto</button>
            </section>
                    

        </div>
  );  
}
export default CreateProductForm;