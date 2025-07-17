import { useState } from 'react';
import Navbar from '../components/navbar.components';
import Filter from '../components/filter.component';
import LockIcon from '@mui/icons-material/Lock';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Modal, Box, Typography, IconButton, Divider, Button, TextField, MenuItem } from '@mui/material';

import users from '../data/userData';
import initialLockers from '../data/initialLockers';
import bookings from '../data/booking';

function Home() {
    const [lockers, setLockers] = useState(initialLockers);
    const [filters, setFilters] = useState({ taille: '', prix: '', statut: '', numéro: '' });
    const [selectedLocker, setSelectedLocker] = useState(null);
    const [editingLocker, setEditingLocker] = useState(null);
    const [deletingLocker, setDeletingLocker] = useState(null);

    const currentUserId = 101;
    const currentUser = users.find((u) => u.id === currentUserId);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const getLockerStatus = (locker) => {
        const now = new Date();
        const relevantBookings = bookings.filter((b) => b.lockerId === locker.id);

        for (const booking of relevantBookings) {
            const start = new Date(booking.startDate);
            const end = new Date(booking.endDate);
            if (now >= start && now <= end) {
                return 'reserved';
            }
        }

        if (locker.status === "unavailable") {
            return 'unavailable';
        }

        return 'available';
    };

    const getColorClass = (status) => {
        switch (status) {
            case 'available':
                return 'border-green-500 hover:bg-green-100';
            case 'reserved':
                return 'border-red-500 hover:bg-red-100';
            case 'unavailable':
                return 'border-gray-400 text-gray-400 hover:bg-gray-100';
            default:
                return 'border-gray-300';
        }
    };

    const filteredLockers = lockers.filter((locker) => {
        const { taille, prix, statut, numéro } = filters;
        const dynamicStatus = getLockerStatus(locker);
        return (
            (!taille || locker.size === taille) &&
            (!prix || locker.price === Number(prix)) &&
            (!statut || dynamicStatus === statut) &&
            (!numéro || locker.number === parseInt(numéro))
        );
    });

    // Modal édition : handler champs
    const handleEditChange = (field, value) => {
        setEditingLocker((prev) => ({ ...prev, [field]: value }));
    };

    // Confirmer édition
    const confirmEdit = () => {
        setLockers((prev) =>
            prev.map((locker) => (locker.id === editingLocker.id ? editingLocker : locker))
        );
        setEditingLocker(null);
    };

    // Confirmer suppression
    const confirmDelete = () => {
        setLockers((prev) => prev.filter((locker) => locker.id !== deletingLocker.id));
        setDeletingLocker(null);
        if (selectedLocker?.id === deletingLocker.id) setSelectedLocker(null);
    };

    return (
        <>
            <Navbar />
            <div className="container mx-auto p-6">
                <h2 className="text-2xl font-semibold mb-4">Réservation de Casiers</h2>
                <Filter onFilterChange={handleFilterChange} />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredLockers.map((locker) => {
                        const status = getLockerStatus(locker);
                        return (
                            <div
                                key={locker.id}
                                onClick={() => setSelectedLocker(locker)}
                                className={`p-4 border-2 rounded-lg text-center transition font-medium relative cursor-pointer ${getColorClass(
                                    status
                                )}`}
                            >
                                {currentUser?.role === 'admin' && (
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
                    {currentUser?.role === 'admin' && (
                        <div className={`p-4 border-2 rounded-lg text-center transition font-medium cursor-pointer`}>
                            <div className="flex justify-center items-center mb-2">
                                <AddIcon className="mr-1" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal détails casier */}
            {selectedLocker && (
                <Modal open={true} onClose={() => setSelectedLocker(null)}>
                    <Box
                        className="bg-white p-8 rounded-2xl shadow-2xl"
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 400,
                            outline: 'none',
                        }}
                    >
                        <Typography variant="h6" className="text-center font-bold mb-4 text-gray-800">
                            Casier n°{selectedLocker.number}
                        </Typography>

                        <Divider sx={{ my: 3 }} />

                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Taille :</span>
                                <span className="text-gray-800 font-medium">{selectedLocker.size}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">Prix :</span>
                                <span className="text-gray-800 font-medium">{selectedLocker.price}€</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Statut :</span>
                                <span
                                    className={`font-semibold px-3 py-1 rounded-full text-xs ${
                                        getLockerStatus(selectedLocker) === 'available'
                                            ? 'bg-green-100 text-green-700'
                                            : getLockerStatus(selectedLocker) === 'reserved'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-gray-200 text-gray-600'
                                    }`}
                                >
                                    {getLockerStatus(selectedLocker)}
                                </span>
                            </div>
                        </div>

                        <Divider sx={{ my: 3 }} />

                        <Box display="flex" justifyContent="flex-end" gap={2}>
                            {getLockerStatus(selectedLocker) === 'available' ? (
                                <>
                                    <button
                                        onClick={() => setSelectedLocker({ ...selectedLocker })}
                                        className="bg-green-500 hover:bg-green-600 text-white text-sm px-5 py-2 rounded-md transition-all"
                                    >
                                        Réserver
                                    </button>
                                    <button
                                        onClick={() => setSelectedLocker(null)}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm px-5 py-2 rounded-md transition-all"
                                    >
                                        Annuler
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setSelectedLocker(null)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm px-5 py-2 rounded-md transition-all"
                                >
                                    Fermer
                                </button>
                            )}
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
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 400,
                            outline: 'none',
                        }}
                    >
                        <Typography variant="h6" className="text-center font-bold mb-4 text-gray-800">
                            Modifier Casier n°{editingLocker.number}
                        </Typography>

                        <Divider sx={{ my: 3 }} />

                        <TextField
                            select
                            label="Taille"
                            fullWidth
                            margin="normal"
                            value={editingLocker.size}
                            onChange={(e) => handleEditChange('size', e.target.value)}
                        >
                            <MenuItem value="small">Petit</MenuItem>
                            <MenuItem value="medium">Moyen</MenuItem>
                            <MenuItem value="large">Grand</MenuItem>
                        </TextField>

                        <TextField
                            type="number"
                            label="Prix (€)"
                            fullWidth
                            margin="normal"
                            value={editingLocker.price}
                            onChange={(e) => handleEditChange('price', Number(e.target.value))}
                        />

                        <TextField
                            select
                            label="Statut"
                            fullWidth
                            margin="normal"
                            value={editingLocker.status}
                            onChange={(e) => handleEditChange('status', e.target.value)}
                        >
                            <MenuItem value="available">Disponible</MenuItem>
                            <MenuItem value="reserved">Réservé</MenuItem>
                            <MenuItem value="unavailable">Indisponible</MenuItem>
                        </TextField>

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
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 320,
                            outline: 'none',
                        }}
                    >
                        <Typography variant="h6" className="text-center font-bold mb-4 text-gray-800">
                            Supprimer Casier n°{deletingLocker.number} ?
                        </Typography>

                        <Divider sx={{ my: 3 }} />

                        <Box display="flex" justifyContent="center" gap={4}>
                            <Button variant="outlined" onClick={() => setDeletingLocker(null)}>
                                Annuler
                            </Button>
                            <Button variant="contained" color="error" onClick={confirmDelete}>
                                Supprimer
                            </Button>
                        </Box>
                    </Box>
                </Modal>
            )}
        </>
    );
}

export default Home;
