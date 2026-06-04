import api from "../../lib/axios"
import type { CommentsResponse, PostsResponse } from "./types"

export const handleCreatePost=async(data:FormData)=>{
    const res=await api.post('/api/post/',data)
    return res.data
}
export const handleUpdatePost=async({id,data}:{id:string,data:{content:string}})=>{
    const res=await api.put(`/api/post/${id}/`,data)
    return res.data
}
export const handleDeletePost=async(id:string)=>{
    const res=await api.delete(`/api/post/${id}/`)
    return res.data
}
export const handleGetAllPosts=async({page,limit}:{page:number,limit:number,})=>{
    const res=await api.get('/api/post/',{params:{page,limit}})
    return res.data as PostsResponse
}
export const handleGetPost=async(id:string)=>{
    const res=await api.get(`/api/post/${id}/`)
    return res.data
}
export const handleUpdatePostImage=async({id,file}:{id:string,file:File})=>{
    const formData=new FormData()
    formData.append("file",file)
    const res=await api.put(`/api/post/${id}/post-image`,formData)
    return res.data
}
export const handleLikePost=async(id:string)=>{
    const res=await api.post(`/api/post/${id}/like`)
    return res.data
}
export const handleUnlikePost=async(id:string)=>{
    const res=await api.delete(`/api/post/${id}/like`)
    return res.data
}
export const handleLikeComment=async(id:string)=>{
    const res=await api.post(`/api/post/comments/${id}/like`)
    return res.data
}
export const handleUnlikeComment=async(id:string)=>{
    const res=await api.delete(`/api/post/comments/${id}/like`)
    return res.data
}
export const handleCreateComment=async({id,content}:{id:string,content:string})=>{
const res=await api.post(`/api/post/${id}/comments`,{content})
return res.data
}
export const handleGetComment=async(id:string)=>{
const res=await api.get(`/api/post/${id}/comments`)
return res.data as CommentsResponse
}