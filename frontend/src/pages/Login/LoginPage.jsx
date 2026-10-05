import { useRef, useState, useEffect, useContext} from "react";
import AuthContext from "../../context/AuthProvider.jsx";
import { Link, useNavigate } from 'react-router-dom';
import '../Register/Register.css';
import Button from "../../components/Button/Button.jsx";

import axios from '../../api/axios.js';
import {FaEye, FaEyeSlash} from "react-icons/fa";
const LOGIN_URL = '/api/auth/login';

const LoginPage = () => {
    const { setAuth } = useContext(AuthContext);
    const navigate = useNavigate();
    const userRef = useRef(null);
    const errRef = useRef(null);

    const [user, setUser] = useState('');
    const [pwd, setPwd] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        userRef.current.focus();
    }, [])

    useEffect(() => {
        setErrMsg('');
    }, [user, pwd])


    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsLoading(true);

        try{
            const response = await axios.post(LOGIN_URL, {
                username: user,
                password: pwd
            });
            console.log(JSON.stringify(response?.data));
            const role = response?.data?.role;
            setAuth({ user, role});
            localStorage.setItem('user', JSON.stringify({ user, role }));

            setUser('');
            setPwd('');
            navigate('/feed', { replace: true });
        }catch(err){
            if(!err?.response){
                setErrMsg('No Server Response');
            }else if(err.response?.status === 400){
                setErrMsg('Missing Username or Password');
            }else if(err.response?.status === 401){
                setErrMsg('Unauthorized');
            }else{
                setErrMsg('LoginPage Failed');
            }
            errRef.current.focus();
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-logo-container">
                    <img src="/logo.png" alt="Yummish" className="auth-logo" />
                </div>
                <h1>Sign In</h1>
                <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">
                    {errMsg}
                </p>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="username">
                        Username:
                    </label>
                    <div className="field-container">
                        <input
                            type="text"
                            id="username"
                            ref={userRef}
                            autoComplete="off"
                            onChange={(e) => setUser(e.target.value)}
                            value={user}
                            required
                        />
                    </div>
                    <label htmlFor="password">
                        Password:
                    </label>
                    <div className="field-container">
                        <div className="input-container">
                            <input
                                type={showPwd ? "text" : "password"}
                                id="password"
                                onChange={(e) => setPwd(e.target.value)}
                                value={pwd}
                                required
                            />
                            <button
                                type="button"
                                className="toggle-pwd-btn"
                                onClick={() => setShowPwd((prev) => !prev)}
                                aria-label={showPwd ? "Hide password" : "Show password"}
                            >
                                {showPwd ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        isLoading={isLoading}
                        disabled={!user || !pwd}
                    >
                        Sign In
                    </Button>
                </form>
                <p className="signin-prompt">
                    Need an Account?<br />
                    <span className="line">
                        <Link to="/register">Sign Up</Link>
                    </span>
                </p>
            </div>
        </div>
    )
}

export default LoginPage