import api from "../../lib/axios"
export const handleEmailVerifation=(data:{userName:string,password:string,email:string})=>{
const res=api.post('/api/auth/email-verification',data)
return res
}
export const handleOtpVerification=(data:{otp:string,email:string,password:string,userName:string})=>{
    const res=api.post('/api/auth/register',data)
return res
}
export const handleGoogleRegistration=(token:string)=>{
    const res=api.post('/api/auth/register-with-google',{token})
    return res
}
export const handleLoginWithAccessToken=()=>{
    const res=api.post('/api/auth/login')
    return res
}
export const handleRefreshAccessToken=async()=>{
    try{

        const res=await api.get('/api/auth/refresh')
        if(res.status==200){
            localStorage.setItem('access_token',res.data.access_token)
            window.location.reload()
        }
    }catch(e:any){
        if(e.response.status===401||e.response.status===500){
            localStorage.removeItem('access_token')
        }
        console.log(e.response)

    }
}
export const handleLogout=async()=>{
    const res=await api.get('/api/auth/logout')
    if(res.status===200){
        localStorage.removeItem('access_token')
    }

    return res
}


export const handleLoginWithEmail=async(data:{email:string,password:string})=>{
const res=await api.post('/api/auth/login',data)
return res
}
