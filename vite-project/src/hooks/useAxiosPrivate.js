import { axiosPrivate } from "../api/axios";
import { useEffect } from "react";
import useRefreshToken from "./useRefresh";
import useAuth from "./useAuth";

const useAxiosPrivate = () =>{
    const refresh = useRefreshToken();
    const {auth} = useAuth();

    useEffect(()=>{
        const request_intercept = axiosPrivate.interceptors.request.use(
            (config) =>{
                if(!config.headers['Authorization']){
                    config.headers['Authorization'] = `Bearer ${auth?.access_token}`;
                }
                return config;
            },(error) => Promise.reject(error)
        );

        const responseIntercept = axiosPrivate.interceptors.response.use(
            response => response,
            async (error)=>{
                const prev_request = error?.config;
                if(error?.response?.status==403 && !prev_request?.sent){
                    prev_request.sent = true;
                    const new_access_token = await refresh();
                    prev_request.headers['Authorization'] = `Bearer ${new_access_token}`;
                    return axiosPrivate(prev_request);
                }
                return Promise.reject(error);
            }
        );
        return () =>{
            axiosPrivate.interceptors.request.eject(request_intercept); 
            axiosPrivate.interceptors.response.eject(responseIntercept); 
        }
    },[auth,refresh]);
    return axiosPrivate;
}

export default useAxiosPrivate;