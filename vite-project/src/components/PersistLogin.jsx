import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import useRefreshToken from "../hooks/useRefresh";
import useAuth from "../hooks/useAuth";


const PersistLogin = () =>{
    const [isLoading, setIsLoading] = useState(true);
    const refresh = useRefreshToken();
    const {auth} = useAuth();

    useEffect(()=>{
        const verifyRefreshToken = async () =>{
            try{
                await refresh();
            }catch(error){
                console.error(error);
            }
            finally{
                setIsLoading(false);
            }
        }
        !auth?.access_token ? verifyRefreshToken() : setIsLoading(false); 
    },[]);

    useEffect(()=>{
        console.log(`IsLoading = ${isLoading}`);
        console.log(`auth = ${JSON.stringify(auth?.access_token)}`);
    },[isLoading]);

    return(
        <>
            {isLoading
            ? <p>Loading...</p>
            : <Outlet/>}
        </>
    );
}

export default PersistLogin;