import "./Navbar.css"
import { Link, useNavigate } from 'react-router-dom';
import {FaSearch, FaPlus, FaUserCircle, FaSignOutAlt} from 'react-icons/fa';
import axios from '../../api/axios.js';
import Button from "../../components/Button/Button.jsx";

const Navbar = ({ searchTerm = '', setSearchTerm = () => {} }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post('/api/auth/logout');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            localStorage.removeItem('user');
            navigate('/login', { replace: true });
        }
    };

    return (
        <header className="navbar-wrapper">
            <div className="navbar-content">
                <Link to="/feed" className="navbar-brand">
                    <img src="/logo.png" alt="Yummish" className="navbar-logo-img" />
                </Link>

                <div className="navbar-search-box">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="navbar-actions">
                    <Button
                        variant="primary"
                        size="sm"
                        icon={FaPlus}
                        onClick={() => navigate('/create-recipe')}
                    >
                        <span className="btn-text">New Recipe</span>
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        icon={FaUserCircle}
                        onClick={() => navigate('/profile')}
                        title="My Profile"
                    >
                        <span className="btn-text">Profile</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        icon={FaSignOutAlt}
                        onClick={handleLogout}
                        title="Logout"
                    >
                        <span className="btn-text">Logout</span>
                    </Button>
                </div>
            </div>
        </header>
    )
}

export default Navbar;