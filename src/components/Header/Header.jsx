import './Header.css';
import logo from '../../img/logo.png';
import { useNavigate } from "react-router-dom";
import { Icon } from "../Icon";
import { faUser } from '@fortawesome/free-solid-svg-icons';
function Header(){
    const navigate = useNavigate();
    return( 
        <header className="header-background">
           <div className="title-background" onClick={() => navigate(`${process.env.REACT_APP_ADMIN_URL}/home`)}>
            <img src={logo} className='image-logo'/>
            <p className='title'>Monkitec</p>
            </div>
            <div className='user-icon-container' onClick={()=> navigate(`${process.env.REACT_APP_ADMIN_URL}/users`)}><Icon icon={faUser} css="user-icon"/></div>
        </header>
    )
}
export default Header;
