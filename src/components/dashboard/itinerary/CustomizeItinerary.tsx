"use client";

import React from "react";
import ItemTypeSelector, { ItemType } from "./ItemTypeSelector";

function CustomizeItinerary() {
  const [itemType, setItemType] = React.useState<ItemType | null>(null);

  if (itemType !== null) {
    return (
      <div className="p-2">
        <h3 className="text-xl font-semibold mb-3">
          Tipo seleccionado: {itemType}
        </h3>

        <p className="text-muted-500 mb-6">
          Aquí aparecerá el formulario/opciones para {itemType}.
        </p>

        <button
          className="third-btn w-full !py-3"
          type="button"
          onClick={() => setItemType(null)}
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div>
      <ItemTypeSelector value={itemType} onChange={setItemType} />
    </div>
  );
}

export default CustomizeItinerary;
