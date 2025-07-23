import { useState, useMemo, useCallback, useEffect } from "react";
import Navbar from "../components/navbar.components";
import Filter from "../components/filter.component";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Home() {
  const [lockers, setLockers] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [filters, setFilters] = useState({
    taille: "",
    prix: "",
    statut: "",
    numéro: "",
  });
  const [selectedLocker, setSelectedLocker] = useState(null);
  const [editingLocker, setEditingLocker] = useState(null);
  const [deletingLocker, setDeletingLocker] = useState(null);
  const [addingLocker, setAddingLocker] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    fetch("http://localhost:3000/locker/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setLockers(data))
      .catch((err) => console.error("Erreur chargement casiers", err));
  }, [navigate, token]);

  // Affiche le modal de confirmation si l'URL contient ?confirmation=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('confirmation') === 'true') {
      setShowConfirmation(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (params.get('pending') === 'true') {
      setShowPending(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    // Annulation de réservation si cancel=true et booking_id présent
    if (params.get('cancel') === 'true' && params.get('booking_id')) {
      const bookingId = params.get('booking_id');
      fetch(`http://localhost:3000/booking/${bookingId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(res => {
          if (!res.ok) throw new Error('Erreur lors de l\'annulation de la réservation');
          toast.success('Réservation annulée avec succès !');
          setLockers((prev) =>
            prev.map((locker) =>
              locker._id === bookingId ? { ...locker, state: "available" } : locker
            )
          );
        })
        .catch(err => {
          toast.error(err.message || 'Erreur inconnue lors de l\'annulation');
        })
        .finally(() => {
          window.history.replaceState({}, document.title, window.location.pathname);
        });
    }
  }, [token]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const getLockerState = (locker) => {
    return locker.state;
  };

  const filteredLockers = useMemo(() => {
    const { taille, prix, statut, numéro } = filters;
    return lockers.filter((locker) => {
      const state = getLockerState(locker);
      return (
        (!taille || locker.size === taille) &&
        (!prix || locker.price === Number(prix)) &&
        (!statut || state === statut) &&
        (!numéro || locker.number === parseInt(numéro))
      );
    });
  }, [lockers, filters]);

  const confirmEdit = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/locker/${editingLocker._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editingLocker),
        }
      );

      if (!response.ok)
        throw new Error("Erreur lors de la mise à jour du casier.");

      const updatedLocker = await response.json();

      setLockers((prev) =>
        prev.map((locker) =>
          locker._id === updatedLocker._id ? updatedLocker : locker
        )
      );
      toast.success("Casier mis à jour avec succès !");
      setEditingLocker(null);
    } catch (error) {
      toast.error(error.message || "Erreur inconnue lors de la modification");
    }
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/locker/${deletingLocker._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok)
        throw new Error("Erreur lors de la suppression du casier.");

      setLockers((prev) =>
        prev.filter((locker) => locker._id !== deletingLocker._id)
      );
      toast.success("Casier supprimé avec succès !");
      setDeletingLocker(null);
      if (selectedLocker?._id === deletingLocker._id) setSelectedLocker(null);
    } catch (error) {
      toast.error(error.message || "Erreur inconnue lors de la suppression");
    }
  };

  const [newLocker, setNewLocker] = useState({
    number: "",
    size: "small",
    price: 0,
    state: "available",
  });

  const handleAdd = async () => {
    if (!newLocker.number || !newLocker.state) {
      toast.error("Les champs numéro et statut sont requis.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/locker/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newLocker),
      });

      if (response.status === 409) {
        toast.error("Ce numéro de casier est déjà utilisé.");
        return;
      }

      if (!response.ok) throw new Error("Erreur lors de l'ajout du casier.");

      const addedLocker = await response.json();
      setLockers((prev) => [...prev, addedLocker]);
      toast.success("Casier ajouté avec succès !");
      setAddingLocker(false);
      setNewLocker({ number: "", size: "small", price: 0, state: "available" });
    } catch (error) {
        toast.error(error.message || "Erreur inconnue lors de l'ajout");
    }
  };

  const handleEditChange = (field, value) => {
    if (editingLocker) {
      setEditingLocker((prev) => ({ ...prev, [field]: value }));
    }
    if (addingLocker) {
      setNewLocker((prev) => ({ ...prev, [field]: value }));
    }
  };

  const getColorClass = (state) => {
    switch (state) {
      case "available":
        return "border-green-500 hover:bg-green-100";
      case "reserved":
        return "border-red-500 hover:bg-red-100";
      case "unavailable":
        return "border-gray-400 text-gray-400 hover:bg-gray-100";
      default:
        return "border-gray-300";
    }
  };

  const getStatusLabel = (state) => {
    switch (state) {
      case "available":
        return "Disponible";
      case "reserved":
        return "Réservé";
      case "unavailable":
        return "Indisponible";
      default:
        return state;
    }
  };

  const handleReserve = async () => {
    if (!startDate || !endDate) {
      toast.error("Veuillez choisir les deux dates");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/booking/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lockerId: selectedLocker._id,
          ownerId: user?._id,
          startDate,
          endDate,
        }),
      });

      let data;
      try {
        data = await response.json();
        const paymentResponse = await fetch(
          `http://localhost:3000/payment/create-session/${data.booking._id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!paymentResponse.ok) {
          throw new Error(
            `Erreur lors de la création de la session de paiement (code: ${paymentResponse.status})`
          );
        }
        const paymentData = await paymentResponse.json();
        window.location.href = paymentData.url;
      } catch (error) {
        console.log(error);
        data = null;
      }

      if (!response.ok) {
        const message =
          data?.message ||
          `Erreur lors de la réservation (code: ${response.status})`;
        throw new Error(message);
      }

      // toast.success("Casier réservé avec succès !");

      // ✅ Mettre à jour localement le locker en le passant en "reserved"
      setLockers((prevLockers) =>
        prevLockers.map((locker) =>
          locker._id === selectedLocker._id
            ? { ...locker, state: "reserved" }
            : locker
        )
      );

      // Réinitialiser
      setStartDate("");
      setEndDate("");
      setSelectedLocker(null);
    } catch (error) {
      toast.error(error.message || "Erreur inconnue lors de la réservation");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-4">Réservation de Casiers</h2>
        <Filter onFilterChange={handleFilterChange} />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredLockers.map((locker) => {
            const state = getLockerState(locker);
            return (
              <div
                key={locker._id}
                onClick={() => setSelectedLocker(locker)}
                className={`p-4 border-2 rounded-lg text-center transition font-medium relative cursor-pointer ${getColorClass(
                  state
                )}`}
              >
                {user?.roles?.includes("admin") && (
                  <div className="absolute top-0 right-0 flex flex-col z-10">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingLocker(locker);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingLocker(locker);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                )}
                <div className="flex justify-center items-center mb-2">
                  <LockIcon className="mr-1" /> Casier {locker.number}
                </div>
              </div>
            );
          })}
          {user?.roles?.includes("admin") && (
            <div
              onClick={() => setAddingLocker(true)}
              className="p-4 border-2 rounded-lg text-center transition font-medium cursor-pointer hover:bg-green-100"
            >
              <div className="flex justify-center items-center mb-2">
                <AddIcon className="mr-1" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal ajout casier */}
      {addingLocker && (
        <Modal open={true} onClose={() => setAddingLocker(false)}>
          <Box
            className="bg-white p-8 rounded-2xl shadow-2xl"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              outline: "none",
            }}
          >
            <Typography
              variant="h6"
              className="text-center font-bold mb-4 text-gray-800"
            >
              Ajouter un nouveau Casier
            </Typography>

            <Divider sx={{ my: 3 }} />

            <TextField
              type="number"
              label="Numéro"
              fullWidth
              margin="normal"
              value={newLocker.number}
              onChange={(e) =>
                handleEditChange("number", Number(e.target.value))
              }
            />

            <TextField
              select
              label="Taille"
              fullWidth
              margin="normal"
              value={newLocker.size}
              onChange={(e) => handleEditChange("size", e.target.value)}
            >
              <MenuItem value="small">Petit</MenuItem>
              <MenuItem value="medium">Moyen</MenuItem>
              <MenuItem value="large">Grand</MenuItem>
            </TextField>

            <TextField
              type="number"
              label="Prix par jour (€)"
              fullWidth
              margin="normal"
              value={newLocker.price}
              onChange={(e) =>
                handleEditChange("price", Number(e.target.value))
              }
            />

            <TextField
              select
              label="Statut"
              fullWidth
              margin="normal"
              value={newLocker.state}
              onChange={(e) => handleEditChange("state", e.target.value)}
            >
              <MenuItem value="available">Disponible</MenuItem>
              <MenuItem value="reserved">Réservé</MenuItem>
              <MenuItem value="unavailable">Indisponible</MenuItem>
            </TextField>

            <Divider sx={{ my: 3 }} />

            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button variant="outlined" onClick={() => setAddingLocker(false)}>
                Annuler
              </Button>
              <Button variant="contained" onClick={handleAdd}>
                Ajouter
              </Button>
            </Box>
          </Box>
        </Modal>
      )}

      {/* Modal édition casier */}
      {editingLocker && (
        <Modal open={true} onClose={() => setEditingLocker(null)}>
          <Box
            className="bg-white p-8 rounded-2xl shadow-2xl"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              outline: "none",
            }}
          >
            <Typography
              variant="h6"
              className="text-center font-bold mb-4 text-gray-800"
            >
              Modifier Casier n°{editingLocker.number}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <TextField
              select
              label="Taille"
              fullWidth
              margin="normal"
              value={editingLocker.size}
              onChange={(e) => handleEditChange("size", e.target.value)}
            >
              <MenuItem value="small">Petit</MenuItem>
              <MenuItem value="medium">Moyen</MenuItem>
              <MenuItem value="large">Grand</MenuItem>
            </TextField>

            <TextField
              type="number"
              label="Prix par jour (€)"
              fullWidth
              margin="normal"
              value={editingLocker.price}
              onChange={(e) =>
                handleEditChange("price", Number(e.target.value))
              }
            />
            <Divider sx={{ my: 3 }} />

            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button variant="outlined" onClick={() => setEditingLocker(null)}>
                Annuler
              </Button>
              <Button variant="contained" onClick={confirmEdit}>
                Confirmer
              </Button>
            </Box>
          </Box>
        </Modal>
      )}

      {/* Modal suppression casier */}
      {deletingLocker && (
        <Modal open={true} onClose={() => setDeletingLocker(null)}>
          <Box
            className="bg-white p-8 rounded-2xl shadow-2xl"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 320,
              outline: "none",
            }}
          >
            <Typography
              variant="h6"
              className="text-center font-bold mb-4 text-gray-800"
            >
              Supprimer Casier n°{deletingLocker.number} ?
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Box display="flex" justifyContent="center" gap={4}>
              <Button
                variant="outlined"
                onClick={() => setDeletingLocker(null)}
              >
                Annuler
              </Button>
              <Button variant="contained" color="error" onClick={confirmDelete}>
                Supprimer
              </Button>
            </Box>
          </Box>
        </Modal>
      )}

      {selectedLocker && (
        <Modal open={true} onClose={() => setSelectedLocker(null)}>
          <Box
            className="bg-white p-8 rounded-2xl shadow-2xl"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              outline: "none",
            }}
          >
            <Typography
              variant="h6"
              className="text-center font-bold mb-4 text-gray-800"
            >
              Détails du Casier n°{selectedLocker.number}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography className="mb-2">
              <strong>Taille :</strong> {selectedLocker.size}
            </Typography>
            <Typography className="mb-2">
              <strong>Prix par jour :</strong> {selectedLocker.price} €
            </Typography>
            <Typography className="mb-2">
              <strong>Statut :</strong>{" "}
              {getStatusLabel(getLockerState(selectedLocker))}
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* Afficher les date pickers et le bouton réserver seulement si le casier est disponible */}
            {getLockerState(selectedLocker) === "available" && (
              <>
                <TextField
                  label="Date de début"
                  type="date"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  value={startDate} // tu dois créer le state startDate
                  onChange={(e) => setStartDate(e.target.value)}
                />

                <TextField
                  label="Date de fin"
                  type="date"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  value={endDate} // tu dois créer le state endDate
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </>
            )}

            <Box display="flex" justifyContent="flex-end" gap={1}>
              {getLockerState(selectedLocker) === "available" && (
                <Button variant="contained" onClick={handleReserve}>
                  Réserver
                </Button>
              )}
              <Button onClick={() => setSelectedLocker(null)}>Fermer</Button>
            </Box>
          </Box>
        </Modal>
      )}
      {/* Modal confirmation réservation */}
      {showConfirmation && (
        <Modal open={true} onClose={() => setShowConfirmation(false)}>
          <Box
            className="bg-white p-8 rounded-2xl shadow-2xl"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              outline: "none",
            }}
          >
            <Typography
              variant="h6"
              className="text-center font-bold mb-4 text-green-700"
            >
              Réservation acceptée !
            </Typography>
            <Typography className="mb-4 text-center">
              Votre réservation a bien été prise en compte.
            </Typography>
            <Box display="flex" justifyContent="center">
              <Button variant="contained" onClick={() => setShowConfirmation(false)}>
                OK
              </Button>
            </Box>
          </Box>
        </Modal>
      )}
      {/* Modal échec réservation */}
      {showPending && (
        <Modal open={true} onClose={() => setShowPending(false)}>
          <Box
            className="bg-white p-8 rounded-2xl shadow-2xl"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              outline: "none",
            }}
          >
            <Typography
              variant="h6"
              className="text-center font-bold mb-4 text-red-700"
            >
              Réservation échouée
            </Typography>
            <Typography className="mb-4 text-center">
              Une erreur est survenue lors de la réservation. Veuillez réessayer ou contacter le support.
            </Typography>
            <Box display="flex" justifyContent="center">
              <Button variant="contained" color="error" onClick={() => setShowPending(false)}>
                OK
              </Button>
            </Box>
          </Box>
        </Modal>
      )}
      <ToastContainer position="bottom-right" />
    </>
  );
}

export default Home;
