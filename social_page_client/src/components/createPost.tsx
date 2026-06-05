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

  const { createPost } = usePost();
  const { user } = useUserContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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
    if (!user.isAuthenticated) {
      return navigate("/signin");
    }

    const formData = new FormData();

    formData.append("content", content);

    if (image) {
      formData.append("file", image);
    }

    createPost.mutate(formData, {
      onSuccess: () => {
        setContent("");
        setImage(null);
        setShowEmojis(false);

        queryClient.invalidateQueries({
          queryKey: ["posts"],
        });

        toast.success("Post created successfully");
      },
      onError: () => {
        toast.error("Failed to create post");
      },
    });
  };

  return (
    <section>
      <Paper
        elevation={0}
        sx={{
          mt: 2,
          width: "95%",
          maxWidth: "600px",
          mx: "auto",
          border: "1px solid #262626",
          borderRadius: "16px",
          backgroundColor: "#121212",
          overflow: "hidden",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.03), 0 8px 30px rgba(0,0,0,0.4)",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 2,
            borderBottom: "1px solid #262626",
          }}
        >
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              width={42}
              height={42}
              style={{
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                backgroundColor: "#2a2a2a",
              }}
            />
          )}

          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "15px",
              color: "#fff",
            }}
          >
            {user.userName || "Guest"}
          </Typography>
        </Box>

        {/* Content */}
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            variant="outlined"
            sx={{
              "& .MuiInputBase-input": {
                color: "#fff",
                fontSize: "15px",
              },

              "& .MuiInputBase-input::placeholder": {
                color: "#888",
                opacity: 1,
              },

              "& fieldset": {
                border: "none",
              },

              "& .MuiOutlinedInput-root": {
                padding: 0,
              },
            }}
          />

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
                  backgroundColor: "#1f1f1f",
                  color: "#fff",
                  zIndex: 2,

                  "&:hover": {
                    backgroundColor: "#2a2a2a",
                  },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>

              <img
                src={URL.createObjectURL(image)}
                alt="Preview"
                style={{
                  width: "100%",
                  maxHeight: "500px",
                  objectFit: "cover",
                  borderRadius: "12px",
                }}
              />
            </Box>
          )}

          {/* Actions */}
          <Box
            sx={{
              mt: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 1,
                position: "relative",
              }}
            >
              {/* Image Upload */}
              <IconButton
                component="label"
                sx={{
                  color: "#bdbdbd",
                }}
              >
                <ImageIcon />
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </IconButton>

              {/* Emoji Picker */}
              <Box sx={{ position: "relative" }}>
                <IconButton
                  sx={{
                    color: "#bdbdbd",
                  }}
                  onClick={() =>
                    setShowEmojis((prev) => !prev)
                  }
                >
                  <EmojiEmotions />
                </IconButton>

                {showEmojis && (
                  <Paper
                    elevation={4}
                    sx={{
                      position: "absolute",
                      bottom: "50px",
                      left: 0,
                      zIndex: 100,
                      p: 1.5,
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(4, 1fr)",
                      gap: 1,
                      borderRadius: 2,
                      minWidth: "220px",
                      backgroundColor: "#1b1b1b",
                      border: "1px solid #333",
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
              </Box>
            </Box>

            {/* Share Button */}
            <Button
              variant="contained"
              disabled={!content.trim() && !image}
              onClick={handleSubmit}
              sx={{
                background:
                  "linear-gradient(135deg, #4ade80 0%, #60a5fa 100%)",
                textTransform: "none",
                borderRadius: "10px",
                px: 4,
                fontWeight: 700,
                color: "#fff",

                "&:hover": {
                  background:
                    "linear-gradient(135deg, #22c55e 0%, #3b82f6 100%)",
                },

                "&.Mui-disabled": {
                  background: "#2d3748",
                  color: "#777",
                },
              }}
            >
              {createPost.isPending ? "Posting..." : "Share"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </section>
  );
};

export default CreatePost;