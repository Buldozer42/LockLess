import { useState } from "react";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SideDrawer from "./sidedrawer.components";
import { useNavigate } from "react-router-dom";
import logo from "../assets/LockLess__1_-removebg-preview.png";
import { Box, IconButton } from "@mui/material";

function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState("");
  const navigate = useNavigate();

  const openDrawer = (content) => {
    setDrawerContent(content);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setDrawerContent("");
  };

  const handleLogout = () => {
    // ✅ Vider le token du localStorage
    localStorage.removeItem("token");
    // ✅ Rediriger vers "/"
    navigate("/");
  };

  return (
    <>
      <nav className="bg-[#7ED956] px-6 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-white text-lg font-bold flex flex-row items-center">
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{
                width: 60,
                height: "auto",
                mb: 2,
                display: "block",
                mx: "auto",
                my: "auto",
              }}
            />
            Lockless
          </div>
          <div className="flex space-x-4">
            <IconButton onClick={() => openDrawer("account")}>
              <AccountCircleIcon className="text-white" />
            </IconButton>
            <IconButton onClick={handleLogout}>
              <LogoutIcon className="text-white" />
            </IconButton>
          </div>
        </div>
      </nav>

      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        content={drawerContent}
      />
    </>
  );
}

export default Navbar;
