import React from 'react';
import './ListedProduct.css';
import { useNavigate } from "react-router-dom";
import { Icon } from '../../Icon';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
function ListedProduct({ product, onClick, onDelete }) {
    const navigate = useNavigate();

    const formattedPrice = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(product.precio);

     const getImage = (optimizada, ruta) => {
        if (optimizada) {
            return optimizada.detail || 
                   optimizada.large || 
                   optimizada.medium || 
                   optimizada.original || 
                   null
        }
        if (ruta) return ruta;
    };


    const hasSecondImage = () => {
    const result = getImage(product.imagen2_optimizada, product.ruta_imagen2);
        if(result == null){
            return false;
        }else{
        return true;
        }
    };

    const handleDelete = async(e) => {
        e.stopPropagation();
        try{
        await fetch(`${process.env.REACT_APP_API_URL}/products/delete`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: product.id })
        });
        await fetch(`${process.env.REACT_APP_API_URL}/product-variation/deleteByProduct`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: product.id })
        })
           if (onDelete) {
                onDelete();
            }
            
        }catch(error){
            alert("Error: " + error);
        }
    }

    const image1 = getImage(product.imagen_optimizada, product.ruta_imagen);
    const image2 = getImage(product.imagen2_optimizada, product.ruta_imagen2);
    const showHoverEffect = hasSecondImage();

    return (
        <div className="listed-product-background" onClick={onClick}>
            <div className={`listed-product-image-container ${showHoverEffect ? 'has-hover' : ''}`}>
                {product.hasImage || product.ruta_imagen || product.imagen_optimizada ? (
                    <>
                        {/* Imagen principal */
                        console.log(hasSecondImage())}
                        <img 
                            src={image1} 
                            alt={product.desc}
                            className={`prod-image primary ${showHoverEffect ? 'hover-enabled' : ''}`}
                            onError={(e) => {
                                e.target.src = '/default-product.png';
                            }}
                        />
                        
                        {/* Imagen secundaria (solo si hay hover effect) */}
                        {hasSecondImage() && (
                            <img 
                                src={image2} 
                                alt={`${product.desc} - vista alterna`}
                                className="prod-image secondary"
                                onError={(e) => {
                                    e.target.src = image1 || '/default-product.png';
                                }}
                            />
                        )}
                    </>
                ) : (
                    <div className="product-image-placeholder">
                        <span className="placeholder-text">No image</span>
                    </div>
                )}
            </div>
            
            <div className="labels-container">
                <h3 className="product-name">{product.desc}</h3>
                <p className="label-price">{formattedPrice}</p>
                <button className='delete-product-button' onClick={handleDelete}><Icon icon={faTrashCan}/></button>
                <div className={`product-status ${product.disponible ? 'available' : 'sold-out'}`}>
                    {product.stock_total === 0 ? 'Sin stock' : (!product.disponible ? 'Agotado' : '')}
                </div>
            </div> 
        </div>
    );
}

export default ListedProduct;