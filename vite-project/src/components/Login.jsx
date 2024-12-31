import { useRef,useState, useEffect } from "react";
import axios from "../api/axios";
import { Link,useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Login = () =>{
    const {setAuth} = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/"; 

    const userRef = useRef();
    const errRef = useRef();

    const [user, setUser] = useState('');
    const [pwd, setPwd] = useState('');
    const [errMsg, setErrMsg] = useState('');

    useEffect(() =>{
        userRef.current.focus();
        
    },[]);

    useEffect(()=>{
        setErrMsg('');
    },[user,pwd]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try{
            const formData = new URLSearchParams();
            formData.append("username", user);
            formData.append("password", pwd);

            const response = await axios.post('/login_for_access_token',
                formData,
                {
                    headers:{"Content-Type" : "application/x-www-form-urlencoded"},
                    withCredentials:true
                }
            );
            
            const access_token = response?.data?.access_token;
            const role = response?.data?.role; 
            setAuth({user, pwd,access_token, role});
            setUser('');
            setPwd('');
            navigate(from, {replace: true});

        }catch(err){
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 409) {
                setErrMsg('Username Taken');
            } else {
                setErrMsg('Registration Failed')
            }
            errRef.current.focus();
        }

        setUser('');
        setPwd('');
        
    }
    return(
       <section>
            <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertlive">{errMsg}</p>

            <form onSubmit={handleSubmit}>
                <h1>Sign In</h1>
                <label htmlFor="username">Username:</label>
                <input type="text"
                        autoComplete="off"
                        id="username"
                        ref={userRef}
                        onChange={(e) => setUser(e.target.value)}
                        value= {user}
                        required />

                <h1>Password:</h1>
                <label htmlFor="password">Password:</label>
                <input type="password"
                        id="password"
                        onChange={(e) => setPwd(e.target.value)}
                        value= {pwd}
                        required />
                <button disabled= {user && pwd ? false : true}>Sign In</button>
            </form>
            <p>Need an account?<br/> </p>
            <Link to={'/register'}>
                <p>Sign up</p>
            </Link>
       </section>

    );
}

export default Login