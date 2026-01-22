import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "../../Icon";
import "./CategoryItem.css"

function CategoryItem({ id, name, imageUrl, hasImage, onClick, onDelete }) {
    const handleDelete = async(e)=>{
        e.stopPropagation();
        console.log(id);
        if(id != undefined){
        try{
            await fetch(`${process.env.REACT_APP_API_URL}/categories/delete`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id })
            });
            if (onDelete) {
                onDelete();
            }
            
            alert("Categoria eliminada correctamente");
        }catch(error){
            alert("Error en la base de datos: ", error);
        }
    }else{
        return;
    }
    }
    return (
        <div className="category-item-background" onClick={onClick}>
                {hasImage ? (
                    <div className='image-container'>
                    <img 
                        src={imageUrl} 
                        alt={name}
                        className="category-item-image"
                        onError={(e) => {
                            e.target.src = '/default-category.png';
                        }}
                    />
                     <div className='item-overlay'></div>
                     <button className='delete-category-button' onClick={handleDelete}><Icon icon={faTrashCan}/></button>
                     </div>
                ) : (
                    <div className="category-image-placeholder">
                        <span className="placeholder-text">{name.charAt(0)}</span>
                    </div>
                )}
            <h3 className="category-title">{name}</h3>
        </div>
    );
}

export default CategoryItem;