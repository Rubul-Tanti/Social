import { Link } from "react-router"
import { useUserContext } from "../contextProvider"
import { ChevronDownIcon, Loader, LogOut, User } from "lucide-react"
import { Button } from "@mui/material"
import InterestsIcon from '@mui/icons-material/Interests';
import { useState } from "react";
import { useAuthentication } from "../hooks/useAuthentication";
import { toast } from "react-toastify";

// const nav = [{ name: "Profile", link: "/profile", icon: <User /> }, { name: "Settings", link: "/settings", icon: <Settings2 /> }]
const Header = () => {
    const { logout } = useAuthentication()
    const [dialogOpen, setDialogOpen] = useState(false)
    const { user, setUser } = useUserContext()
    return <header className="container-custom " style={{ display: "flex",backgroundColor:"white", position: "relative", justifyContent: "space-between", alignItems: "center", padding: "20px 10px" }}>
        <h1 style={{ fontSize: "24px" }}><InterestsIcon />SOCIAL</h1>
        {user.isAuthenticated ? <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>{user.profilePicture ? <img src={user.profilePicture} width="40" height="40" style={{ borderRadius: "50%" }} /> : <User />}<p onClick={() => { setDialogOpen(!dialogOpen) }} style={{ display: "flex", alignItems: "center", fontSize: "14px", color: "gray" }}>{user.userName} <ChevronDownIcon size={16} /></p></div> :
            <Link to="/signin">
                <Button variant="outlined">Sign In</Button></Link>}
        {dialogOpen && <div style={{ position: "absolute", top: "90px", right: "10px", background: "white", boxShadow: "0 1px 2px rgba(0,0,0,0.1)", borderRadius: "8px", padding: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* {nav.map((item)=><div style={{display:"flex",alignItems:"center",gap:"5px",fontSize:"14px"}} onClick={()=>setDialogOpen(false)}>{item.icon} {item.name}</div>)} */}
            <Button onClick={() => logout.mutate(undefined, { onSuccess: () => { setUser({ userName: null, profilePicture: null, isAuthenticated: false, role: null, email: null }); setDialogOpen(false); toast("Logged out successfully") }, onError: () => { toast.error("Failed to Logout") } })} style={{ color: "red", fontSize: "12px", padding: "2px", cursor: "pointer" }} variant="text">{!logout.isPending ? <LogOut size={14} style={{ marginRight: "5px" }} /> : <Loader
                style={{
                    animation: "spin 1s linear infinite",
                }}
            />} Logout</Button>
        </div>}
    </header>
}
export default Header