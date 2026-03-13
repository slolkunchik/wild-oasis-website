import { getBookedDatesByCabinId, getSettings } from "@/app/_lib/data-service";
import DateSelector from "./DateSelector";
import ReservationForm from "./ReservationForm";
import LoginMessage from "./LoginMessage";
import { auth } from "../_lib/auth";

async function Reservation({ cabin }) {
  const [bookedDates, settings] = await Promise.all([
    getBookedDatesByCabinId(cabin.id),
    getSettings(),
  ]);
  const session = await auth();

  return (
    <div className="grid grid-cols-[minmax(700px,_1fr)_minmax(430px,_1fr)] border border-bs-primary-800 min-h-[400px]">
      <DateSelector
        bookedDates={bookedDates}
        settings={settings}
        cabin={cabin}
      />
      {session?.user ? (
        <ReservationForm cabin={cabin} user={session.user} />
      ) : (
        <LoginMessage />
      )}
    </div>
  );
}

export default Reservation;
