import { createContext, useContext, useState, type SetStateAction
 } from "react";
 type UserType= {
    isAuthenticated:boolean
    role:'ADMIN'|'USER'|null,
         userName:string|null,
        email:string|null,
        profilePicture:string|null,
 }
 type userContextType={
    user:UserType,
    setUser:React.Dispatch<SetStateAction<UserType>>
 }
 const UserContext=createContext<userContextType>({
    user:{
        isAuthenticated:false,
        role:null,
        userName:null,
        email:null,
        profilePicture:null,
        },
    setUser:()=>{}
 })

export  const ContextProvider=({children}:{children:React.ReactNode})=>{
    const [user,setUser]=useState<UserType>({isAuthenticated:false,role:null,userName:null,
        email:null,
        profilePicture:null,})




    return <UserContext value={{user,setUser}}>{children}</UserContext>

}

export const useUserContext=()=>{
   return useContext(UserContext)}
