import "./Navbar.css"
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaPlus, FaUserCircle } from 'react-icons/fa';

const Navbar = ({ searchTerm = '', setSearchTerm = () => {} }) => {
    const navigate = useNavigate();

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
                    <button
                        type="button"
                        className="btn-create-recipe"
                        onClick={() => navigate('/create-recipe')}
                    >
                        <FaPlus />
                        <span className="btn-text">New Recipe</span>
                    </button>

                    <button
                        type="button"
                        className="btn-profile"
                        onClick={() => navigate('/profile')}
                        title="My Profile"
                        >
                        <FaUserCircle />
                        <span className="btn-text">Profile</span>
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Navbar;