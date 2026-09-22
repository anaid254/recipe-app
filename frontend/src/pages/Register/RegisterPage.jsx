import { useState, useRef, useEffect } from 'react';
import { FaCheck, FaTimes, FaInfoCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Register.css';
import axios from '../../api/axios.js';
import {Link, useNavigate} from "react-router-dom";

const USER_REGEX = /^[a-zA-Z][a-zA-Z0-9-_]{2,19}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{6,24}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGISTER_URL = '/api/auth/register';

const RegisterPage = () => {
    const userRef = useRef(null);
    const errRef = useRef(null);
    const navigate = useNavigate();

    const [user, setUser] = useState('');
    const [validName, setValidName] = useState(false);
    const [userFocused, setUserFocused] = useState(false);

    const [email, setEmail] = useState('');
    const [validEmail, setValidEmail] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);

    const [pwd, setPwd] = useState('');
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocused, setPwdFocused] = useState(false);

    const [matchPwd, setMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocused, setMatchFocused] = useState(false);

    const [fieldErrors, setFieldErrors] = useState({});
    const [globalError, setGlobalError] = useState('');
    const [success, setSuccess] = useState(false);

    const [showPwd, setShowPwd] = useState(false);
    const [showMatchPwd, setShowMatchPwd] = useState(false);

    useEffect(() => {
        userRef.current.focus();
    }, [])

    useEffect(() => {
        const result = USER_REGEX.test(user);
        console.log(result);
        console.log(user);
        setValidName(result);
    }, [user]);

    useEffect(() => {
        const result = EMAIL_REGEX.test(email);
        console.log(result);
        console.log(email);
        setValidEmail(result);
    }, [email]);

    useEffect(() => {
        const result = PWD_REGEX.test(pwd);
        console.log(result);
        console.log(pwd);
        setValidPwd(result);
        const match = pwd === matchPwd;
        setValidMatch(match);
    }, [pwd, matchPwd]);

    useEffect(() => {
        setGlobalError('');
    }, [user, email, pwd, matchPwd]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const v1 = USER_REGEX.test(user);
        const v2 = EMAIL_REGEX.test(email);
        const v3 = PWD_REGEX.test(pwd);
        if(!v1 || !v2 || !v3) {
            setGlobalError("Invalid Entry");
            return;
        }
        try{
            const response = await axios.post(REGISTER_URL,
                JSON.stringify({username: user,email: email,password: pwd}),
                {
                    headers: {'Content-Type': 'application/json'},
                    withCredentials: true
                });
            console.log(response.data);
            console.log(response.data?.token);
            setSuccess(true);
            setUser('');
            setEmail('');
            setPwd('');
            setMatchPwd('');
            navigate('/login', { replace: true });
        }catch(err){
            if (!err?.response) {
                setGlobalError('No server response. Please try again later.');
            } else {
                const data = err.response.data;
                const msg = typeof data === 'string' ? data : data?.error || data?.message;

                if (msg?.toLowerCase().includes('username')) {
                    setFieldErrors({ username: 'This username is already taken.' });
                } else if (msg?.toLowerCase().includes('email')) {
                    setFieldErrors({ email: 'This email address is already registered.' });
                } else {
                    setGlobalError(msg || 'Registration failed. Please try again.');
                }
            }
            errRef.current?.focus();
        }
    }

    return (
        <div className="auth-wrapper">
            <section className="auth-card">
                <div className="auth-logo-container">
                    <img src="/logo.png" alt="Yummish" className="auth-logo" />
                </div>
                <h1>Sign Up</h1>
                <p ref={errRef} className={globalError ? "errmsg" : "offscreen"} aria-live="assertive">
                    {globalError}
                </p>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="username">
                        Username:
                        <span className={validName ? "valid" : "hide"}>
                            <FaCheck />
                        </span>
                        <span className={validName || !user ? "hide" : "invalid"}>
                            <FaTimes />
                        </span>
                    </label>
                    <div className="field-container">
                    <input
                        type="text"
                        id="username"
                        ref={userRef}
                        autoComplete="off"
                        onChange={(e) => {
                            setUser(e.target.value);
                            if (fieldErrors.username) setFieldErrors(prev => ({ ...prev, username: '' }));
                        }}
                        required
                        aria-invalid={validName ? "false" : "true"}
                        aria-describedby="uidnote"
                        onFocus={() => setUserFocused(true)}
                        onBlur={() => setUserFocused(false)}
                    />
                        {fieldErrors.username && (
                            <span className="field-err-text">{fieldErrors.username}</span>
                        )}
                    <p id="uidnote" className={userFocused && user && !validName ? "instructions" : "offscreen"}>
                        <FaInfoCircle />
                        3 to 20 characters.<br />
                        Must begin with a letter.<br />
                        Letters, numbers, underscores, hyphens allowed.
                    </p>
                    </div>

                    <label htmlFor="email">
                        Email:
                        <span className={validEmail ? "valid" : "hide"}>
                            <FaCheck />
                        </span>
                        <span className={validEmail || !email ? "hide" : "invalid"}>
                            <FaTimes />
                        </span>
                    </label>
                    <div className="field-container">
                        <input
                            type="email"
                            id="email"
                            autoComplete="off"
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
                            }}
                            required
                            aria-invalid={validEmail ? "false" : "true"}
                            aria-describedby="emailnote"
                            onFocus={() => setEmailFocused(true)}
                            onBlur={() => setEmailFocused(false)}
                        />
                        {fieldErrors.email && (
                            <span className="field-err-text">{fieldErrors.email}</span>
                        )}
                        <p id="emailnote" className={emailFocused && !validEmail ? "instructions" : "offscreen"}>
                            <FaInfoCircle />
                            Must be a valid email address.<br />
                            Example: name@domain.com
                        </p>
                    </div>

                    <label htmlFor="password">
                        Password:
                        <span className={validPwd? "valid" : "hide"}>
                            <FaCheck />
                        </span>
                        <span className={validPwd || !pwd ? "hide" : "invalid"}>
                            <FaTimes />
                        </span>
                    </label>
                    <div className="field-container">
                        <div className="input-container">
                            <input
                                type={showPwd ? "text" : "password"}
                                id="password"
                                onChange={(e) => setPwd(e.target.value)}
                                value={pwd}
                                required
                                aria-invalid={validPwd ? "false" : "true"}
                                aria-describedby="pwdnote"
                                onFocus={() => setPwdFocused(true)}
                                onBlur={() => setPwdFocused(false)}
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
                        <p id="pwdnote" className={pwdFocused && !validPwd ? "instructions" : "offscreen"}>
                            <FaInfoCircle />
                            6 to 24 characters.<br />
                            Must include uppercase and lowercase letters, a number and a special character.<br />
                            Allowed special characters: <span aria-label="exclamation mark">!</span>
                            <span aria-label="at symbol">@</span>
                            <span aria-label="hash symbol">#</span>
                            <span aria-label="dollar sign">$</span>
                            <span aria-label="percent">%</span>
                        </p>
                    </div>

                    <label htmlFor="confirm_pwd">
                        Confirm password:
                        <span className={validMatch && matchPwd ? "valid" : "hide"}>
                            <FaCheck />
                        </span>
                        <span className={validMatch || !matchPwd ? "hide" : "invalid"}>
                            <FaTimes />
                        </span>
                    </label>
                    <div className="field-container">
                        <div className="input-container">
                            <input
                                type={showMatchPwd ? "text" : "password"}
                                id="confirm_pwd"
                                onChange={(e) => setMatchPwd(e.target.value)}
                                value={matchPwd}
                                required
                                aria-invalid={validMatch ? "false" : "true"}
                                aria-describedby="confirmnote"
                                onFocus={() => setMatchFocused(true)}
                                onBlur={() => setMatchFocused(false)}
                            />
                            <button
                                type="button"
                                className="toggle-pwd-btn"
                                onClick={() => setShowMatchPwd((prev) => !prev)}
                                aria-label={showMatchPwd ? "Hide confirm password" : "Show confirm password"}
                            >
                                {showMatchPwd ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        <p id="confirmnote" className={matchFocused && !validMatch ? "instructions" : "offscreen"}>
                            <FaInfoCircle />
                            Must match the first password input field.
                        </p>
                    </div>

                        <button disabled={!validName || !validPwd || !validEmail || !validMatch}>
                            Sign Up
                        </button>
                </form>
                <p className="signin-prompt">
                    Already registered?<br />
                    <span className="line">
                        <Link to="/login">Sign In</Link>
                    </span>
                </p>
            </section>
        </div>
    )
}

export default RegisterPage

