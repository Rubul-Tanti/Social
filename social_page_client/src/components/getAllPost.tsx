import { useEffect, useState } from "react"
import usePost from "../hooks/usePost"
import PostCard from "./postCard"
import { Box, Button, Skeleton} from "@mui/material"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

const AllPost=()=>{
    const [pagination,setPagination]=useState<{page:number,limit:number}>({page:1,limit:20})
   const {getAllPost}=usePost()
   const queryClient=useQueryClient()
   const {data,isLoading}=getAllPost({page:pagination.page,limit:pagination.limit})
   useEffect(()=>{
    queryClient.invalidateQueries({queryKey:['posts']})
   },[pagination])
   return <section style={{backgroundColor: "#f5f5f5"}} className="container-custom ">
    <div style={{padding:"0px 5px"}}>
    {isLoading? Array.from({length:5}).map((s,i)=>
    <div
    key={i}
    >
        <Skeleton variant="text" sx={{ fontSize: '1rem' }} />

{/* For other variants, adjust the size with `width` and `height` */}
<Skeleton variant="circular" width={40} height={40} />
<Skeleton variant="rectangular" width={350} height={200} />
<Skeleton variant="rounded" width={350} height={200} />
    </div>):
    data?.data.posts.length===0?<></>:
    data?.data.posts.map((p=><PostCard post={p}/>))}
    <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}><Button variant="text"
    disabled={pagination.page===1}
    onClick={()=>{setPagination(prev=>({...prev,page:prev.page-1}))}}
    ><ChevronLeft/></Button>
        <Box>{pagination.page}</Box>
    <Button
      onClick={()=>{setPagination(prev=>({...prev,page:prev.page+1}))}}
    variant="text" disabled={(data?.data?.total || 0) < pagination.limit * pagination.page} ><ChevronRight/></Button>

    <input
    style={{width:"40px",height:"40px",borderRadius:"8px",textAlign:"center",outline:"none"}}
    onChange={(e)=>setPagination(prev=>({...prev,limit:Number(e.target.value)}))}
    defaultValue={pagination.limit}  />
 </div>
    </div >
    </section>
}
export default AllPost