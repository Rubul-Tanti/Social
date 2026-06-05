import { useEffect, useState } from "react";
import usePost from "../hooks/usePost";
import PostCard from "./postCard";
import {
  Box,
  Button,
  Skeleton,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const AllPost = () => {
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
  });

  const { getAllPost } = usePost();

  const { data, isLoading } = getAllPost({
    page: pagination.page,
    limit: pagination.limit,
  });
const queryClient=useQueryClient()
  useEffect(()=>{
queryClient.invalidateQueries({queryKey:['posts']})
  },[pagination])

  return (
    <div style={{ padding: "0 5px" ,marginTop:10 }}>
      {isLoading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <Box key={i} sx={{ mb: 2 }}>
            <Skeleton
            className="container-custom"
              variant="rectangular"
              height={250}
              sx={{ borderRadius: 2 }}
              style={{backgroundColor:"#3f3f46",maxWidth:600}}
            />
          </Box>
        ))
      ) : (
        <>
          {data?.data?.posts?.map((post: any) => (
            <PostCard
              key={post._id}
              post={post}
            />
          ))}
<Box
  sx={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    mt: 3,
    mb: 3,
    flexWrap: "wrap",
  }}
>
  <Button
    variant="outlined"
    style={{color:'white'}}
    startIcon={<ChevronLeft size={16} />}
    disabled={pagination.page === 1}
    onClick={() =>
      setPagination((prev) => ({
        ...prev,
        page: prev.page - 1,
      }))
    }
        sx={{
      borderColor: "#333",
      color: "#fff",

      "&:hover": {
        borderColor: "#60a5fa",
        backgroundColor: "rgba(96,165,250,0.08)",
      },
    }}
  >
  </Button>

  <Box
    sx={{
      fontWeight: 700,
      minWidth: 40,
      textAlign: "center",
      color: "#fff",
      backgroundColor: "#1e1e1e",
      border: "1px solid #333",
      borderRadius: 2,
      py: 1,
      px: 2,
    }}
  >
    {pagination.page}
  </Box>

  <Button
    style={{ cursor:"pointer", color:'white'}}
variant="outlined"
    endIcon={<ChevronRight size={16} />}
    disabled={
      (data?.data?.total || 0) <=
      pagination.page * pagination.limit
    }
    onClick={() =>
      setPagination((prev) => ({
        ...prev,
        page: prev.page + 1,
      }))
    }
    sx={{
      borderColor: "#333",
      color: "#fff",

      "&:hover": {
        borderColor: "#60a5fa",
        backgroundColor: "rgba(96,165,250,0.08)",
      },
    }}
  >
  </Button>

  <input
    type="number"
    min={1}
    value={pagination.limit}
    onChange={(e) =>
      setPagination({
        page: 1,
        limit: Number(e.target.value) || 20,
      })
    }
    style={{
      width: "70px",
      height: "40px",
      borderRadius: "10px",
      border: "1px solid #333",
      background: "#1e1e1e",
      color: "#fff",
      textAlign: "center",
      outline: "none",
    }}
  />
</Box>
        </>
      )}
    </div>
  );
};

export default AllPost;