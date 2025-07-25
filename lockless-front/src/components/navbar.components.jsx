import { useState } from "react";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import SideDrawer from "./sidedrawer.components";
import SideBookingDrawer from "./sideBookingDrawer.component";
import { useNavigate } from "react-router-dom";
import logo from "../assets/LockLess__1_-removebg-preview.png";
import { Box, IconButton } from "@mui/material";

function Navbar({ lockers, onBookingChange }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerBookingOpen, setIsDrawerBookingOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState("");
  const [drawerBookingContent, setDrawerBookingContent] = useState("");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const openDrawer = (content) => {
    setDrawerContent(content);
    setIsDrawerOpen(true);
  };

  const openDrawerBooking = (content) => {
    setDrawerBookingContent(content);
    setIsDrawerBookingOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setDrawerContent("");
  };

  const closeDrawerBooking = () => {
    setIsDrawerBookingOpen(false);
    setDrawerBookingContent("");
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
            {user?.roles?.includes("admin") && (
              <IconButton onClick={() => openDrawerBooking("account")}>
                <LibraryBooksIcon className="text-white" />
              </IconButton>
            )}
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
        lockers={lockers}
        onBookingChange={onBookingChange}
      />
      <SideBookingDrawer
        isOpen={isDrawerBookingOpen}
        onClose={closeDrawerBooking}
        content={drawerBookingContent}
        lockers={lockers}
        onBookingChange={onBookingChange}
      />
    </>
  );
}

export default Navbar;
