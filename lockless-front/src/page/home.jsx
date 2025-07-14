import { useState } from 'react';
import Navbar from '../components/navbar.components';
import Filter from '../components/filter.component';
import LockIcon from '@mui/icons-material/Lock';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Modal, Box, Typography, IconButton, Divider } from '@mui/material';

import users from '../data/userData';
import initialLockers from '../data/initialLockers';
import bookings from '../data/booking';

function Home() {
    const [lockers] = useState(initialLockers);
    const [filters, setFilters] = useState({ taille: '', prix: '', statut: '', numéro: '' });
    const [selectedLocker, setSelectedLocker] = useState(null);

    const currentUserId = 101;
    const currentUser = users.find((u) => u.id === currentUserId);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const getLockerStatus = (locker) => {
        if (locker.disabled) return 'unavailable';

        const now = new Date();
        const relevantBookings = bookings.filter((b) => b.lockerId === locker.id);

        for (const booking of relevantBookings) {
            const start = new Date(booking.startDate);
            const end = new Date(booking.endDate);
            if (now >= start && now <= end) {
                return 'reserved';
            }
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
            (!prix || locker.price === prix) &&
            (!statut || dynamicStatus === statut) &&
            (!numéro || locker.number === parseInt(numéro))
        );
    });

    const matchingBooking = bookings.find((b) => b.lockerId === selectedLocker?.id);
    const owner = users.find((u) => u.id === matchingBooking?.ownerId);

    const now = new Date();
    const activeBooking = bookings.find((b) => {
        if (b.lockerId !== selectedLocker?.id) return false;
        const start = new Date(b.startDate);
        const end = new Date(b.endDate);
        return now >= start && now <= end;
    });

    const activeOwner = users.find((u) => u.id === activeBooking?.ownerId);

    return (
        <>
            <Navbar />
            <div className="container mx-auto p-6 bg-[#FDFFEF] ">
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
                                        <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={(e) => e.stopPropagation()}>
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
                        <div
                            className={`p-4 border-2 rounded-lg text-center transition font-medium relative cursor-pointers`}
                        >
                            <div className="flex justify-center items-center mb-2">
                                <AddIcon className="mr-1" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

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
                            outline: 'none'
                        }}
                    >
                        <Typography variant="h6" className="text-center font-bold mb-4 text-gray-800">
                            Casier n°{selectedLocker.number}
                        </Typography>

                        <Divider sx={{ my: 3 }} />

                        <div className="space-y-4 text-sm">
                            {currentUser?.role === 'admin' && activeOwner && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Propriétaire :</span>
                                    <span className="text-gray-800 font-medium">{activeOwner.prenom}</span>
                                </div>
                            )}

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
                                    className={`font-semibold px-3 py-1 rounded-full text-xs ${getLockerStatus(selectedLocker) === 'available'
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
        </>
    );
}

export default Home;
