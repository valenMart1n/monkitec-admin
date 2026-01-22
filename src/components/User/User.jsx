import { faArrowRightFromBracket, faPenToSquare, faPlus, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "../Icon";
import "./User.css"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


function User(){
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userState, setUserState] = useState({
        id: JSON.parse(localStorage.getItem("user")).id,
        username: JSON.parse(localStorage.getItem("user")).username,
        password: ""
    })

    const handleUsernameChange = (e) => {
        setUserState(prev => ({
            ...prev,
            username: e.target.value
        }));
    };

    const handlePasswordChange = (e) => {
        setUserState(prev => ({
            ...prev,
            password: e.target.value
        }))
    }

    const handleUpdate = async() => {
        setLoading(true);
        try{
            const token = localStorage.getItem("token");
            const userId = JSON.parse(localStorage.getItem("user")).id;

            const response = await fetch(`${process.env.REACT_APP_API_URL}/users/update`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: userId,
                    username: userState.username,
                    password: userState.password
                })
            });
            const data = await response.json();

            if(!response.ok){
                throw new Error(data.message);
            }

            if(data.user){
                localStorage.setItem("user", JSON.stringify(data.user));
            }
            navigate(`${process.env.REACT_APP_ADMIN_URL}/users`);
            alert("Usuario Actualizado");
        }catch(error){
            console.error("ERROR: ", error);
            alert("Error al actualizar usuario: ", error);
        }finally{
            setLoading(false);
        }
    }

    const handleLogOut = async() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate(`${process.env.REACT_APP_ADMIN_URL}/`);
    }

    if(loading){
        return <p>Cargando Usuarios...</p>
    }
    
    return(
        <div className="user-background">
            <div className="user-data-container">
                <p className="user-data-title">Usuario: </p><input className="user-data-input" value={userState.username} onChange={handleUsernameChange}/>
            </div>
            <div className="user-data-container">
                <p className="user-data-title">Contraseña: </p><input className="user-data-input" value={userState.password} onChange={handlePasswordChange}/>
            </div>
            <section className="user-data-buttons-container">
                <button className="user-data-button" style={{color: "green"}}><p className="button-title">Agregar</p><Icon icon={faPlus}/></button>
                <button className="user-data-button" style={{color: "red"}}><p className="button-title">Eliminar</p><Icon icon={faTrashCan}/></button>
                <button className="user-data-button" style={{color: "rgb(20, 43, 68)"}} onClick={() => handleUpdate()}><p className="button-title">Guardar</p><Icon icon={faPenToSquare}/></button>
            </section>
            <section className="user-data-buttons-container">
            <button className="close-session-button" onClick={()=> handleLogOut()}>Cerrar Sesión <Icon icon={faArrowRightFromBracket}/></button>
            </section>
        </div>
    );
}
export default User;