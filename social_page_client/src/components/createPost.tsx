import { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import {
  Image as ImageIcon,
  Close as CloseIcon,
  EmojiEmotions,
} from "@mui/icons-material";
import usePost from "../hooks/usePost";
import { toast } from "react-toastify";
import { useUserContext } from "../contextProvider";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const {createPost}=usePost()
  const {user}=useUserContext()
  const queryClient=useQueryClient()
  const navigate=useNavigate()
  const emojis = [
    "😀",
    "😂",
    "😍",
    "😊",
    "🔥",
    "❤️",
    "👍",
    "🎉",
    "🚀",
    "😎",
    "🥳",
    "🤩",
  ];

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  const addEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji);
    setShowEmojis(false);
  };

  const handleSubmit = () => {
    const formData=new FormData()
    if(!user.isAuthenticated){
      return navigate("signin")
    }
    formData.append("content",content)
    if(image){
      formData.append("file",image)
    }

    createPost.mutate(formData,{onSuccess:()=>{
         setContent("");
    setImage(null);
    setShowEmojis(false);
    queryClient.invalidateQueries({queryKey:['posts']})
      toast.success("Post created successfully")
    },onError:()=>{
      toast.error("Failed to create post")
    }})

  };

  return (
    <section className="container-custom" >
      <Paper
      style={{boxShadow:"0 1px 2px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1)" }}
        sx={{
            padding:"10px",
          p: 3,
          mt: 3,
          width: "100%",

          borderRadius: 3,
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 600,
            mb: 2,
          }}
        >
          Create Post
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={4}
          variant="standard"
          label="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "16px",
            position: "relative",
          }}
        >
          {/* Image Upload */}
          <Button
            component="label"
            variant="outlined"
            startIcon={<ImageIcon />}
            sx={{
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
            }}
          >

            <input
              hidden
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </Button>

          {/* Emoji Picker */}
          <div style={{ position: "relative" }}>
            <Button
              variant="outlined"
              startIcon={<EmojiEmotions />}
              onClick={() =>
                setShowEmojis((prev) => !prev)
              }
              sx={{
                borderColor: "var(--border)",
                color: "var(--text-secondary)",
              }}
            >
            </Button>

            {showEmojis && (
              <Paper
                elevation={4}
                sx={{
                  position: "absolute",
                  top: "50px",
                  left: 0,
                  zIndex: 100,
                  p: 1.5,
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(4, 1fr)",
                  gap: 1,
                  borderRadius: 2,
                  minWidth: "200px",
                }}
              >
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => addEmoji(emoji)}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontSize: "24px",
                      padding: "6px",
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </Paper>
            )}
          </div>
        </div>

        {/* Image Preview */}
        {image && (
          <Box
            sx={{
              mt: 2,
              position: "relative",
            }}
          >
            <IconButton
              size="small"
              onClick={() => setImage(null)}
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                backgroundColor: "#fff",
                color: "#000",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.15)",
                zIndex: 2,

                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            <Typography
              variant="body2"
              sx={{
                mb: 1,
                color: "text.secondary",
              }}
            >
              {image.name}
            </Typography>

            <img
              src={URL.createObjectURL(image)}
              alt="Preview"
              style={{
                maxWidth:"350px",
                width: "auto",
                height:"auto",
                maxHeight: "350px",
                objectFit: "contain",
                borderRadius: "12px",
                display: "block",
              }}
            />
          </Box>
        )}

        <Box
          sx={{
            mt: 3,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="contained"
            disabled={
              !content.trim() && !image
            }
            onClick={handleSubmit}
          >{
            createPost.isPending ? "Posting..." :"Post"
          }
          </Button>
        </Box>
      </Paper>
    </section>
  );
};

export default CreatePost;