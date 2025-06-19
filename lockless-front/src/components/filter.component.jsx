import { useState } from 'react';

function Filter({ onFilterChange }) {
    const [size, setSize] = useState('');
    const [price, setPrice] = useState('');
    const [status, setStatus] = useState('');
    const [number, setNumber] = useState('');

    const handleChange = () => {
        onFilterChange({
            taille: size,
            prix: price,
            statut: status,
            numéro: number,
        });
    };

    return (
        <div className="flex flex-wrap gap-4 p-4 bg-white rounded-md shadow mb-6">
            <select
                className="border rounded px-4 py-2"
                value={size}
                onChange={(e) => {
                    setSize(e.target.value);
                    handleChange();
                }}
            >
                <option value="">Toutes les tailles</option>
                <option value="petit">Petit</option>
                <option value="moyen">Moyen</option>
                <option value="grand">Grand</option>
            </select>

            <select
                className="border rounded px-4 py-2"
                value={price}
                onChange={(e) => {
                    setPrice(e.target.value);
                    handleChange();
                }}
            >
                <option value="">Tous les prix</option>
                <option value="€">€</option>
                <option value="€€">€€</option>
                <option value="€€€">€€€</option>
            </select>

            <select
                className="border rounded px-4 py-2"
                value={status}
                onChange={(e) => {
                    setStatus(e.target.value);
                    handleChange();
                }}
            >
                <option value="">Tous les statuts</option>
                <option value="disponible">Disponible</option>
                <option value="réservé">Réservé</option>
            </select>

            <input
                type="number"
                className="border rounded px-4 py-2"
                placeholder="N° de casier"
                value={number}
                onChange={(e) => {
                    setNumber(e.target.value);
                    handleChange();
                }}
            />
        </div>
    );
}

export default Filter;
