import { useMutation, useQuery } from "@tanstack/react-query"
import { handleAsignRole, handleDeactivateUser, handleGetUsers } from "../api-services/user"

const useUser=()=>{
    const getUsers=({page,limit,userName}:{page:number,limit:number,userName?:string})=>useQuery({queryKey:["users",page,limit],queryFn:()=>handleGetUsers({page,limit,userName})})
    const asignUserRole=()=>useMutation({mutationFn:handleAsignRole})
    const deleteUser=()=>useMutation({mutationFn:handleDeactivateUser})
    return {getUsers,asignUserRole,deleteUser}
}
export default useUser