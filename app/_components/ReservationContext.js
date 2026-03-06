"use client";

import { createContext, useContext, useState } from "react";

const initialState = { from: undefined, to: undefined };

const ReseravationContext = createContext(initialState);

function ReservationProvider({ children }) {
  const [range, setRange] = useState(initialState);

  const resetRange = () => {
    setRange(initialState);
  };

  return (
    <ReseravationContext.Provider value={{ range, setRange, resetRange }}>
      {children}
    </ReseravationContext.Provider>
  );
}

function useReservation() {
  const context = useContext(ReseravationContext);

  if (context === undefined) {
    throw new Error("Context was used outside the provider");
  }

  return context;
}

export { useReservation, ReservationProvider };
