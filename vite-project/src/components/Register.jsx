import React, { useEffect } from "react";
import { useRef, useState } from "react";
import {faCheck,faTimes, faInfoCircle} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "../api/axios";
import { Link } from "react-router-dom";

const USER_REGEX = /^[a-zA-Z][a-zA-Z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%_]).{8,24}$/;

const Register = ()=>{
    const userRef = useRef();
    const errRef = useRef();
    
    const [user, setUser] = useState('');
    const [validName, setValidName] = useState(false);
    const [userFocus, setUserFocus] = useState(false);

    const [pwd, setPwd] = useState('');
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    const [matchPwd, setMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(()=>{
        userRef.current.focus();
    },[]);

    useEffect(()=>{
        const result = USER_REGEX.test(user);
        setValidName(result);
    },[user]);

    useEffect(() =>{
        const result = PWD_REGEX.test(pwd);
        setValidPwd(result);
        const match = pwd ===matchPwd;
        setValidMatch(match);
    },[pwd,matchPwd]);
    
    useEffect(()=>{
        setErrMsg('');
    },[user,pwd,matchPwd])

    const handleSubmit = async (e) =>{
        e.preventDefault();
        try{
            const formData = new URLSearchParams();
            formData.append("username", user);
            formData.append("password", pwd);

            const response = await axios.post('/create_account', formData, {
                headers:{"Content-Type":"application/x-www-form-urlencoded"},
                withCredentials: true}
            )
            setSuccess(true);
        }catch(error){
            if (error.response) {
                // If the server returned a response
                setErrMsg(error.response.data.detail || "Registration failed.");
            } else if (error.request) {
                // If no response was received from the server
                setErrMsg("No server response.");
            } else {
                // If another error occurred
                setErrMsg("Registration failed.");
            }
            errRef.current.focus(); // Focus the error message for accessibility
        }
    }

    return(
        <>
        { success ? (
            <section>
                <h1>
                    Success!
                </h1>
            </section>
        ):(
        <section>
            <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">
                    Username:
                    <FontAwesomeIcon icon={faCheck} className={validName ? "valid" : "hide"} />
                    <FontAwesomeIcon icon={faTimes} className={validName || !user ? "hide" : "invalid"} />
                </label>
                <input type="text"
                        id="username"
                        ref={userRef}
                        autoComplete="off"
                        onChange={(e) => setUser(e.target.value)}
                        required
                        aria-invalid={validName ? "false" : "true"}
                        aria-describedby="uidnote"
                        onFocus={()=> setUserFocus(true)}
                        onBlur={()=> setUserFocus(false)}
                         />
                        <p id="uidnote" className={userFocus && user && !validName ? "instructions" : "offscreen"}>
                            <FontAwesomeIcon icon={faInfoCircle} />
                            4 to 24 characters.<br />
                            Must begin with a letter.<br />
                            Letters, numbers, underscores, hyphens allowed.
                        </p>

                
                <label htmlFor="password">
                    Password:
                    <FontAwesomeIcon icon={faCheck} className={validPwd ? "valid" : "hide"} />
                    <FontAwesomeIcon icon={faTimes} className={validPwd || !pwd ? "hide" : "invalid"} />
                </label>
                <input type="password"
                        id="password"
                        onChange={(e) => setPwd(e.target.value)}
                        required
                        aria-invalid={validPwd ? "false" : "true"}
                        aria-describedby="pwdnote"
                        onFocus={()=> setPwdFocus(true)}
                        onBlur={()=> setPwdFocus(false)}
                         />
                        <p id="pwdnote" className={pwdFocus && !validPwd ? "instructions" : "offscreen"}>
                            <FontAwesomeIcon icon={faInfoCircle} />
                            8 to 24 characters.<br />
                            Must include uppercase and lowercase letters, a number and a special character.<br />
                            Allowed special characters:<span aria-label="exclamation mark">!</span> <span aria-label="at symbol">@</span> <span aria-label="hashtag">#</span> <span aria-label="dollar sign">$</span> <span aria-label="percent">%</span>
                        </p>
                
                <label htmlFor="confirm_pwd">
                    Confirm Password:
                    <FontAwesomeIcon icon={faCheck} className={validMatch && matchPwd ? "valid" : "hide"} />
                    <FontAwesomeIcon icon={faTimes} className={validMatch || !matchPwd ? "hide" : "invalid"} />
                </label>
                <input type="password"
                        id="confirm_pwd"
                        onChange={(e) => setMatchPwd(e.target.value)}
                        required
                        aria-invalid={validMatch ? "false" : "true"}
                        aria-describedby="confirmnote"
                        onFocus={()=> setMatchFocus(true)}
                        onBlur={()=> setMatchFocus(false)}
                         />
                        <p id="confirmnote" className={matchFocus && !validMatch ? "instructions" : "offscreen"}>
                            <FontAwesomeIcon icon={faInfoCircle} />
                            Must match the first password input field.

                        </p>
                <button disabled={validMatch && validName && validPwd ? false : true}> Sign Up</button>
            </form>
            <p>Already have an account?</p>
            <Link to={'/'}>
                <p>Sign In</p>
            </Link>
           
        </section>
        )}
        </>
    );
}

export default Register;