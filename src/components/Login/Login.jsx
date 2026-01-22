import "./Login.css"
import { useState } from "react";
import logo from "../../img/icono.jpg";
import { useNavigate } from "react-router-dom";

function Login(){
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [userState, setUserState] = useState({
        username: "",
        password: ""
    });

    const handleUsernameChange = (e) => {
        setUserState(prev => ({
            ...prev,
            username: e.target.value
        }));
    } 

    const handlePasswordChange = (e) => {
        setUserState(prev => ({
            ...prev,
            password: e.target.value
        }))
    }

    const handleLogin = async(e) => {
        e.preventDefault();
        setLoading(true);
        try{
            const response = await fetch(`${process.env.REACT_APP_API_URL}/users/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    username: userState.username,
                    password: userState.password
                })
            });
            const responseText = await response.text();
        
            const data = JSON.parse(responseText);

            if(data.success == false){
                alert("Usuario o contraseña incorrectos");
                return;
            }

            if(data.token){
                localStorage.setItem("token", data.token);

                if(data.user){
                    localStorage.setItem("user", JSON.stringify(data.user));
                }

                navigate(`${process.env.REACT_APP_ADMIN_URL}/home`);
            }else{
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        }catch(error){
            alert("Error al obtener usuario: ", error);
        }finally{
            setLoading(false);
        }
    }

    if(loading){
        return(<p>Cargando</p>);
    }

    return(
    <div className="login-background">
        {!localStorage.getItem("user") ? (
        <div className="login-data-background">
           <img className="login-icon" src={logo}/>
            <input className="login-input" placeholder="Usuario" value={userState.username} onChange={handleUsernameChange}/>
            <input className="login-input" type="password" placeholder="Contraseña" value={userState.password} onChange={handlePasswordChange}/>
            <button onClick={handleLogin} className="login-button">Iniciar Sesión</button>
        </div>
        ):(
            navigate(`${process.env.REACT_APP_ADMIN_URL}/home`)
        )}
    </div> 
    )   
}

export default Login;