import './Header.css';
import logo from '../../img/logo.png';
import { useNavigate } from "react-router-dom";
function Header(){
    const navigate = useNavigate();
    return( 
        <header className="header-background">
           <div className="title-background" onClick={() => navigate("/")}>
            <img src={logo} className='image-logo'/>
            <p className='title'>Monkitec</p>
            </div>
        </header>
    )
}
export default Header;
