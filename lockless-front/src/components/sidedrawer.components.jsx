import { Drawer, Box, Typography, Avatar, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import users from '../data/userData';
import bookings from '../data/booking';

function SideDrawer({ isOpen, onClose, content }) {
  const navigate = useNavigate();

  // 🔐 Utilisateur courant : Léa
  const currentUserId = 101;
  const user = users.find((u) => u.id === currentUserId);

  const userBookings = bookings.filter((b) => b.ownerId === currentUserId);

  const getBookingStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return 'planifiée';
    if (now > end) return 'terminée';
    return 'en cours';
  };

  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose}>
      <Box sx={{ width: 280 }} className="p-5 space-y-4">
        {content === 'account' && user && (
          <div className="flex flex-col items-center">
            <Avatar sx={{ bgcolor: '#3b82f6', width: 64, height: 64 }}>
              {user.prenom?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Typography variant="h6" className="mt-3 font-bold text-center">
              {user.prenom}
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              {user.email}
            </Typography>
            <Typography
              variant="caption"
              sx={{ mt: 1, mb: 1 }}
              className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin'
                ? 'bg-red-100 text-red-600'
                : 'bg-blue-100 text-blue-600'
                }`}
            >
              {user.role.toUpperCase()}
            </Typography>

            <Divider className="w-full my-4" />

            <Typography variant="subtitle1" className="w-full text-left font-semibold">
              Réservations
            </Typography>

            {userBookings.length > 0 ? (
              <ul className="w-full space-y-2">
                {userBookings.map((resa) => {
                  const statut = getBookingStatus(resa.startDate, resa.endDate);

                  return (
                    <li
                      key={resa.id}
                      className="border border-gray-200 rounded-lg px-3 py-2 bg-white shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <Typography variant="body2" className="font-medium">
                          Casier #{resa.lockerId}
                        </Typography>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${statut === 'en cours'
                              ? 'bg-green-100 text-green-700'
                              : statut === 'planifiée'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                        >
                          {statut}
                        </span>
                      </div>
                      <Typography variant="caption" className="text-gray-600">
                        Du {resa.startDate} au {resa.endDate}
                      </Typography>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic mt-2">Aucune réservation</p>
            )}
          </div>
        )}
      </Box>
    </Drawer>
  );
}

export default SideDrawer;
