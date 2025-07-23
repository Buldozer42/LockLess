import { useState, useEffect } from "react";

function Filter({ onFilterChange }) {
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("");
  const [number, setNumber] = useState("");

  // À chaque changement, on notifie le parent
  useEffect(() => {
    onFilterChange({
      taille: size,
      prix: price,
      statut: status,
      numéro: number,
    });
  }, [size, price, status, number, onFilterChange]);

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-white rounded-md shadow mb-6 bg-[#FDFFEF]">
      <select
        className="border rounded px-4 py-2"
        value={size}
        onChange={(e) => setSize(e.target.value)}
      >
        <option value="">Toutes les tailles</option>
        <option value="small">Petit</option>
        <option value="medium">Moyen</option>
        <option value="large">Grand</option>
      </select>

      <select
        className="border rounded px-4 py-2"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      >
        <option value="">Tous les prix</option>
        <option value="5">5€</option>
        <option value="7">7€</option>
        <option value="8">8€</option>
        <option value="10">10€</option>
        <option value="12">12€</option>
      </select>

      <select
        className="border rounded px-4 py-2"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="">Tous les statuts</option>
        <option value="available">Disponible</option>
        <option value="reserved">Réservé</option>
        <option value="unavailable">Indisponible</option>
      </select>

      <input
        type="number"
        className="border rounded px-4 py-2"
        placeholder="N° de casier"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
      />
    </div>
  );
}

export default Filter;
