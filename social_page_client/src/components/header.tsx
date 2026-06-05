import { Link } from "react-router"
import { useUserContext } from "../contextProvider"
import {  Loader, LogOut, User } from "lucide-react"
import { Button } from "@mui/material"
import { useState } from "react";
import { useAuthentication } from "../hooks/useAuthentication";
import { toast } from "react-toastify";

// const nav = [{ name: "Profile", link: "/profile", icon: <User /> }, { name: "Settings", link: "/settings", icon: <Settings2 /> }]
const Header = () => {
    const { logout } = useAuthentication()
    const [dialogOpen, setDialogOpen] = useState(false)
    const { user, setUser } = useUserContext()
    return <header
  className=" container-custom  position-sticky "
  style={{
    backgroundColor:"#121212",
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 20px",
  }}
>
<Link
className="shadow-sm shadow-gray-400"
  to="/"
  style={{
    padding:"0px 4px",
    borderRadius:"8px",
    border:"1px solid #4ade80",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  }}
>


  <h1
    style={{
      fontSize: "28px",
      fontWeight: 700,
      fontFamily: "cursive",
      margin: 0,
      background: "linear-gradient(to right, #4ade80, #60a5fa)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    }}
  >
    R&P
  </h1>
</Link>

  {user.isAuthenticated ? (
    <div
        onClick={() => setDialogOpen(!dialogOpen)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
      }}
    >
      {user.profilePicture&&user.profilePicture!=='' ? (
        <img
          src={user.profilePicture}
          alt="profile"
          width={42}
          height={42}
          style={{
            borderRadius: "50%",
            objectFit: "cover",
            cursor: "pointer",
          }}
          onClick={() => setDialogOpen(!dialogOpen)}
        />
      ) : (
        <User size={38} />
      )}

      <p
      className="text-zinc-400"
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: "13px",
          margin: 0,
          fontWeight: 500,
        }}
      >
        {user.userName}
      </p>
    </div>
  ) : (
    <Link to="/signin">
      <Button
        variant="contained"
        sx={{
          borderRadius: "8px",
          textTransform: "none",
        }}
      >
        Sign In
      </Button>
    </Link>
  )}

  {dialogOpen && (
    <div
      style={{
        position: "absolute",
        top: "70px",
        right: "20px",
        width: "180px",
        background: "#1e1e1e",
        border: "1px solid #404040",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        overflow: "hidden",
      }}
    >
      <Button
        fullWidth
        variant="text"
        onClick={() =>
          logout.mutate(undefined, {
            onSuccess: () => {
              setUser({
                userName: null,
                profilePicture: null,
                isAuthenticated: false,
                role: null,
                email: null,
              });
              setDialogOpen(false);
              toast.success("Logged out successfully");
            },
            onError: () => {
              toast.error("Failed to Logout");
            },
          })
        }
        sx={{
          color: "#ed4956",
          justifyContent: "flex-start",
          padding: "12px 16px",
          textTransform: "none",
          "&:hover": {
            backgroundColor: "#fafafa",
          },
        }}
      >
        {!logout.isPending ? (
          <>
            <LogOut size={16} style={{ marginRight: 8 }} />
            Logout
          </>
        ) : (
          <Loader
            size={16}
            style={{
              animation: "spin 1s linear infinite",
            }}
          />
        )}
      </Button>
    </div>
  )}
</header>
}
export default Header