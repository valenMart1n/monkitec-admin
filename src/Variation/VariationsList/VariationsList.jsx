import { faPlus, faTrashCan, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "../../components/Icon";
import "./VariationsList.css"
import { useEffect, useState } from "react";
import { data, useAsyncError, useNavigate } from "react-router-dom";

function VariationsList(){
const [variations, setVariations] = useState([]);
const [loading, setLoading] = useState(false);
const [editedVariations, setEditedVariations] = useState([]);
const [oldVariations, setOldVariations] = useState([]);
const [addNewRow, setAddNewRow] = useState(false);
const [newVariant, setNewVariant] = useState("");
const navigate = useNavigate();

const handleInputChange = (id, newDescripcion) => {
    setEditedVariations(prev => {
        const existsIndex = prev.findIndex(v => v.id === id);
        
        if (existsIndex >= 0) {
            const updated = [...prev];
            updated[existsIndex] = { id, descripcion: newDescripcion };
            return updated;
        } else {
            return [...prev, { id, descripcion: newDescripcion }];
        }
    });
    console.log("Variaciones editadas:", editedVariations);
};


const handleDeleteVariation = async(e, id) => {
    e.stopPropagation();
    try{
        
        const variationResponse = await fetch("http://localhost:3030/variations/delete", {
            method: "POST",
            headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
            },
            body: JSON.stringify({id:id})
        });

        if(!variationResponse.ok){
            if(variationResponse.status == 404){
                    throw new Error("VARIATION_NOT_FOUND");
                }
                throw new Error(`Error ${variationResponse.status}: ${variationResponse.statusText}`);
        }

        setVariations(prevVariations => prevVariations.filter(v => v.id !== id));
    }catch(error){
        alert("Error al borrar variacion: ", error);
    }
}

const getCurrentDescripcion = (id) => {
    const edited = editedVariations.find(v => v.id === id);
    if (edited) return edited.descripcion;
    
    const original = variations.find(v => v.id === id);
    return original ? original.descripcion : "";
};


const handleSaveVariations = async() => {
    try{
    
        const saveResponse = editedVariations.map((variation) => {
            console.log("Variacion: ", variation.id, " desc: ", variation.descripcion)
            fetch("http://localhost:3030/variations/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    id: variation.id,
                    descripcion: variation.descripcion
                })
            })
        });

        const responses = await Promise.all(saveResponse);

        if(!responses){
            throw new Error(`Algunas actualizaciones fallaron:`);
        }
        if(newVariant != ""){
            console.log("Nueva Variante: ", newVariant);
            fetch("http://localhost:3030/variations/create", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        descripcion: newVariant
                    })
                })
        }

        alert("Variantes actualizadas")
        navigate("http://localhost:3000/variations")
    }catch(error){
        alert("Error guardando variantes: ", error);
    }
}

useEffect(() => {
    if (variations.length > 0) {
        setEditedVariations(variations.map(v => ({
            id: v.id,
            descripcion: v.descripcion
        })));
    }
}, [variations]);

useEffect(() => {
    const fetchData = async() => {
        setLoading(true);
        try{    
            const variationRes = await fetch("http://localhost:3030/variations", {
                method: "GET",
                headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                }
            })
            if(variationRes.ok){
                const dataJson = await variationRes.json();
                console.log("Data recibida: ",dataJson);
                setVariations(dataJson);
                setOldVariations(dataJson);
            }
            
        }catch(error){
            alert("Error en la base de datos: ", error);
            setVariations([]);
        }finally{
            setLoading(false);
        }
    }
    fetchData();
}, [])
    return(
        <div className="variations-list-background">
            <h1 className="variations-list-title">Variaciones</h1>
            <ul className="variations-table">{variations.map((variation) => {
                return <li className="variations-row">
                    <input 
                        className="variations-input" 
                        value={getCurrentDescripcion(variation.id)} 
                        onChange={(e) => handleInputChange(variation.id, e.target.value)}
                    /> 
                    <button className="delete-variation-button">
                        <Icon onClick={(e) => handleDeleteVariation(e, variation.id)} css="delete-variation-icon" icon={faTrashCan}/>
                    </button>
                </li>
            })}
            {addNewRow && (<li className="variations-row">
                    <input 
                        className="variations-input" 
                        value={newVariant}
                        onChange={(e) => {setNewVariant(e.target.value)}} 
                    /> 
                    <button className="delete-variation-button" 
                        onClick={() => {
                            setAddNewRow(false);
                            setNewVariant("");
                        }}
                    >
                        <Icon icon={faXmark}/>
                    </button>
                    
                </li>)}
            </ul>
            <section className="variations-panel">
                <button className="add-product-button" onClick={()=> setAddNewRow(true)}><Icon icon={faPlus}/></button>
                <button className="save-variations-button" onClick={() => handleSaveVariations()}>GUARDAR CAMBIOS</button>
            </section>
        </div>
    );
}

export default VariationsList;