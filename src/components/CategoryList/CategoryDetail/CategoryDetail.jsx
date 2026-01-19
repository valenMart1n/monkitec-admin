import { useEffect, useState } from "react";
import "./CategoryDetail.css"
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Icon } from "../../Icon";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
function CategoryDetail(category){
    const location = useLocation();
    const navigate = useNavigate();
    const {id} = useParams();
    const [loading, setLoading] = useState(true);
    const [selectedParent, setSelectedParent] = useState(null);
    const [availableCategories, setAvailableCategories] = useState([]);
    const [parent, setParent] = useState(null);
    const [categoryState, setCategoryState] = useState({
        id: 0,
        desc: "",
        parent: -1,
        imagen: ""
    });

    const currentId = id||category?.id;

    const getImage = (optimizada, ruta) => {
        if (optimizada) {
            return optimizada.detail || 
                   optimizada.large || 
                   optimizada.medium || 
                   optimizada.original || 
                   null
        }
        if (ruta) return ruta;
            
        return "/default-category.png";
    }
    const handleDescChange = (e) => {
        setCategoryState(prev => ({
            ...prev,
            desc: e.target.value
        }));
    }

    const handleParentChange = (e) => {
        setCategoryState(prev => ({
            ...prev,
            parent: e.target.value
        }));
    }

    const handleImageChange = (e, imageField) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            
            setCategoryState(prev => ({
                ...prev,
                [imageField]: imageUrl,
                [`${imageField}File`]: file
            }));
        }
    };

    const handleCreateCategory = async() => {
        try{
            const formData = new FormData();
            formData.append('desc', categoryState.desc);
            formData.append('parent', categoryState.parent);
            if(categoryState.imagenFile){
                formData.append("imagen", categoryState.imagenFile);
            }else{
                alert("Necesitas agregar una imagen");
                return;
            }
            const categoryResponse = await fetch("https://monkitec-api.vercel.app/categories/create", {
                method: "POST",
                body: formData
            });

            if(!categoryResponse.ok){
                throw new Error(`Error al crear categoría: ${categoryResponse.status}`);
            }

            navigate("https://monkitec-api.vercel.app/categories");
            alert("Categoria creada correctamente");
        }catch(error){
            alert("Error en la base de datos: ", error);
        }
    }

    const handleUpdateCategory = async() => {
        try{ 
            const formData = new FormData();
            formData.append('id', categoryState.id);
            formData.append('desc', categoryState.desc);
            formData.append('parent', categoryState.parent);
            if(categoryState.imagenFile){
                formData.append("imagen", categoryState.imagenFile);
            }
            const categoryResponse = await fetch("https://monkitec-api.vercel.app/categories/update", {
                method: "POST",
                body: formData 
            });

            if(!categoryResponse.ok){
                throw new Error(`Error al editar categoría: ${categoryResponse.status}`);
            }

            navigate("https://monkitec-api.vercel.app/categories");
            alert("Categoria actualizada correctamente");
        }catch(error){
            alert("Error en la base de datos: ", error);
        }
    }
    const fetchCategoryFromAPI = async (categoryId) => {
        try{
            const response = await fetch("https://monkitec-api.vercel.app/categories/byId", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({id: parseInt(categoryId)})
            });
            
            if(!response.ok){
                if(response.status == 404){
                    throw new Error("CATEGORY_NOT_FOUND");
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            const categoryData = await response.json();
            return categoryData.data;
        }catch(error){
            throw error;
        }
    };
    
    useEffect(() => {
        if(availableCategories.length > 0 && categoryState.parent !== 0 && categoryState.parent !== -1){
            const foundParent = availableCategories.find(cat => 
                cat.id == parseInt(categoryState.parent)
            );
            setParent(foundParent||null);
            setSelectedParent(foundParent||null);
        }else{
            setParent(null);
            if(categoryState.parent == -1){
                setSelectedParent({id: -1});
            }
        }
    }, [availableCategories, categoryState.parent]);

    useEffect(() => {
       
        const fetchCategory = async() => {
            try{
                setLoading(true);
                let categoryData;

                if(location.state?.category){
                    categoryData = location.state.category;
                }else if(currentId){
                    categoryData = await fetchCategoryFromAPI(currentId);
                    categoryData.imageUrl = getImage(categoryData.imagen_optimizada, categoryData.ruta_imagen);
                }
                if(!categoryData){
                    throw new Error("CATEGORY_NOT_FOUND");
                }

                setCategoryState({
                    id: categoryData.id || 0,
                    desc: categoryData.desc || "",
                    parent: categoryData.parent||-1,
                    imagen: categoryData.imageUrl
                });
                
            }catch(error){
                console.error("Error cargando categoria: ", error);
            }finally{
                setLoading(false);
            }
        };
        if(currentId){
            fetchCategory();
            
        }else{
            setLoading(false);
        }
        
    }, [currentId, location.state]);

    useEffect(() => {
        const fetchAvailableCategories = async() => {

            try{
                const response = await fetch("https://monkitec-api.vercel.app/categories/listAll", {
                    method: "GET",
                    headers: { 
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                });

                if(!response.ok){
                    throw new Error(`Error: ${response.status}`);
                }
                const result = await response.json();

                const allCategories = result.data || [];
                
                if(!id){
                    setAvailableCategories(allCategories);
                }else{
                const available = allCategories.filter(category => {
                    return category.id !== parseInt(currentId);
                });
    
                setAvailableCategories(available);        
                }
                }catch(error){
                    console.error(error);
                }
        }
        fetchAvailableCategories();

    }, [currentId]);

    if (loading) {
        return <div className="loading">Cargando producto...</div>;
    }

    return(
        <div className="category-detail-background">
            <div className="detail-category-data">
            <div className="category-detail-image-container" style={{marginTop: "20px"}}>
           
                <img
                    src={categoryState.imagen}
                    className="category-image"
                />
                <div className="item-overlay"></div>
            </div>
            <h3 className="category-detail-title">{categoryState.desc}</h3>
           <div className="category-detail-route">
            <input 
                type="file"
                accept="image/*"
                className="input-category-image"
                onChange={(e) => handleImageChange(e, 'imagen')}
            />
            </div>
            </div>
            <div className="detail-category-data">
            <section className="detail-section-container">
            <input 
                className="category-desc-input"
                value={categoryState.desc}
                onChange={handleDescChange}
            />
            </section>
            <section className="detail-section-container" style={{marginTop: "30px"}}>
            <p className="parent-selector-title">Selecciona categoría padre:</p>
                <select className="parent-selector" 
                value={categoryState.parent}
                onChange={(e) => {
                        setCategoryState(prev => ({
                            ...prev,
                            parent: e.target.value
                        }));

                        if(e.target.value == -1){    
                            setSelectedParent({ id: -1});
                            setParent(null);
                        }else{
                            const selectedCategory = availableCategories.find(cat =>
                                cat.id == e.target.value
                            );
                            setSelectedParent(selectedCategory);
                            setParent(selectedCategory);                            
                        }
                    
                }}>
                    
                    <option value={-1}>Ninguna</option>
                    {availableCategories.map((category, index) => {
                        
                        return(
                            <option
                                key={category.id}
                                value={category.id}
                                className="parent-option"    
                            >
                                {category.desc}
                            </option>
                        );
                        
                    })}
                    
                </select>            
            </section>
            <section
                className="detail-section-container"
            >
                <button className="edit-category-button-detail" onClick={id? handleUpdateCategory: handleCreateCategory}>{id? "GUARDAR CAMBIOS" : "AGREGAR CATEGORÍA"}</button>
            </section>
            </div>
           
        </div>
    )
}


export default CategoryDetail;