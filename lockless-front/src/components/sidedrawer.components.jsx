import { useEffect, useState } from "react";
import { Drawer, Box, Typography, Avatar, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";

function SideDrawer({ isOpen, onClose, content, lockers, onBookingChange }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userBooking, setUserBooking] = useState([]);
  const token = localStorage.getItem("token");
  console.log(token);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      setUser(userObj);

      // Appeler getUserBookings uniquement si l'user existe
      getUserBookings(userObj);
    } else {
      navigate("/"); // Redirection si pas d'user
    }
  }, [navigate, lockers]);

  const getUserBookings = async () => {
    try {
      const raw = await fetch("http://localhost:3000/booking/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!raw.ok) {
        throw new Error(`Erreur serveur : ${raw.status}`);
      }

      const response = await raw.json();
      console.log(response);
      setUserBooking(response);
    } catch (error) {
      console.error("Erreur lors de la récupération des réservations :", error);
    }
  };

  const getBookingStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return "planifiée";
    if (now > end) return "terminée";
    return "en cours";
  };

  const handleCancel = async (bookingId) => {
    try {
      // Appel API pour annuler la réservation
      await fetch(`http://localhost:3000/booking/${bookingId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      // Mettre à jour la liste localement
      setUserBooking((prev) => prev.filter((b) => b._id !== bookingId));
      onBookingChange();
    } catch (error) {
      console.error("Erreur lors de l'annulation :", error);
    }
  };

  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose}>
      <Box sx={{ width: 280 }} className="p-5 space-y-4">
        {content === "account" && user && (
          <div className="flex flex-col items-center">
            <Avatar sx={{ bgcolor: "#3b82f6", width: 64, height: 64 }}>
              {user.firstName?.[0]?.toUpperCase() || "U"}
            </Avatar>
            <Typography variant="h6" className="mt-3 font-bold text-center">
              {user.firstName}
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              {user.email}
            </Typography>

            <Typography
              variant="caption"
              sx={{ mt: 1, mb: 1 }}
              className={`px-2 py-1 rounded-full text-xs ${
                user.roles.includes("admin")
                  ? "bg-red-100 text-red-600"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              {user.roles.includes("admin")
                ? "ADMIN"
                : user.roles[0]?.toUpperCase()}
            </Typography>

            <Divider className="w-full my-4" />

            <Typography
              variant="subtitle1"
              className="w-full text-left font-semibold"
            >
              Réservations
            </Typography>
            {userBooking.length > 0 ? (
              <ul className="w-full space-y-2 cursor-pointer">
                {userBooking.map((resa) => {
                  const statut = getBookingStatus(resa.startDate, resa.endDate);
                  return (
                    <li
                      key={resa.id || resa._id} // ⚠️ Prend _id si pas de id
                      className="border border-gray-200 rounded-lg px-3 py-2 bg-white shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <Typography variant="body2" className="font-medium">
                          Casier #{resa.lockerId.number}
                        </Typography>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            statut === "en cours"
                              ? "bg-green-100 text-green-700"
                              : statut === "planifiée"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {statut}
                        </span>
                      </div>
                      <Typography variant="caption" className="text-gray-600">
                        Du {new Date(resa.startDate).toLocaleDateString()} au{" "}
                        {new Date(resa.endDate).toLocaleDateString()}
                      </Typography>
                      {(statut === "planifiée" || statut === "en cours") && (
                        <button
                          onClick={() => handleCancel(resa._id)}
                          className="flex text-xs text-red-600 border border-red-300 rounded px-2 py-0.5 hover:bg-red-50 transition ml-auto mt-2"
                        >
                          Annuler
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic mt-2">
                Aucune réservation
              </p>
            )}
          </div>
        )}
      </Box>
    </Drawer>
  );
}

export default SideDrawer;
