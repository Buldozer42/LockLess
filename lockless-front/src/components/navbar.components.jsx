import { useState } from 'react';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import IconButton from '@mui/material/IconButton';
import SideDrawer from './sidedrawer.components';
import { useNavigate } from 'react-router-dom';


function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState('');
  const navigate = useNavigate();

  const openDrawer = (content) => {
    setDrawerContent(content);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setDrawerContent('');
  };

  return (
    <>
      <nav className="bg-gray-800 px-6 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-white text-lg font-bold">Lockless</div>
          <div className="flex space-x-4">
            <IconButton onClick={() => openDrawer('account')}>
              <AccountCircleIcon className="text-white" />
            </IconButton>
            <IconButton onClick={() => navigate('/')}>
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


