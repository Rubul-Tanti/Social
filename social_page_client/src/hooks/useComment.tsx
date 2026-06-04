import { useMutation, useQuery } from "@tanstack/react-query"
import { handleCreateComment, handleGetComment, handleLikeComment, handleUnlikeComment } from "../api-services/post"

const useComment=()=>{
    const createComment=useMutation({mutationFn:handleCreateComment})
   const getComments=(id:string)=>useQuery({queryKey:['comments',id],queryFn:()=>handleGetComment(id)})
        const unlikecomment=useMutation({mutationFn:handleUnlikeComment})
        const likeComment=useMutation({mutationFn:handleLikeComment})

   return{createComment,getComments,unlikecomment,likeComment}
}
export default useComment