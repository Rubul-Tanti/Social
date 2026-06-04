import { useMutation, useQuery } from "@tanstack/react-query"
import { handleCreatePost, handleDeletePost, handleGetAllPosts, handleGetPost, handleLikePost, handleUnlikePost, handleUpdatePost, handleUpdatePostImage } from "../api-services/post"

const usePost=()=>{
    const createPost=useMutation({mutationFn:handleCreatePost})
    const updatePostImage=()=>useMutation({mutationFn:handleUpdatePostImage})
    const updatePost=()=>useMutation({mutationFn:handleUpdatePost})
    const deletePost=()=>useMutation({mutationFn:handleDeletePost})
    const getAllPost=({page,limit}:{page:number,limit:number})=>useQuery({
        queryKey:["posts"],
        queryFn:()=>handleGetAllPosts({page,limit})
    })
    const getPost=(id:string)=>useQuery({
        queryKey:["post",id],
        queryFn:()=>handleGetPost(id)
    })
    const unlikePost=useMutation({mutationFn:handleUnlikePost})
    const likePost=useMutation({mutationFn:handleLikePost})
    return {createPost,likePost,updatePostImage,updatePost,unlikePost,deletePost,getAllPost,getPost}
}
export default usePost