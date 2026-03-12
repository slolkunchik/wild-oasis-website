"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth, signIn, signOut } from "./auth";
import { supabase } from "./supabase";
import { getBooking, getBookings } from "./data-service";

export async function updateGuest(formData) {
  const session = await auth();

  if (!session) {
    throw new Error("You must be logged in");
  }

  const nationalID = formData.get("nationalID");
  const [nationality, countryFlag] = formData.get("nationality").split("%");

  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID)) {
    throw new Error("Please provide a valid national ID");
  }

  const updateData = { nationalID, countryFlag, nationality };

  const { error } = await supabase
    .from("guests")
    .update(updateData)
    .eq("id", session.user.guestId);

  if (error) {
    throw new Error("Guest could not be updated");
  }

  revalidatePath("/account/profile");
}

export async function deleteReservation(bookingId) {
  const session = await auth();

  if (!session) {
    throw new Error("You must be logged in");
  }

  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingIds = guestBookings.map((booking) => booking.id);

  if (!guestBookingIds.includes(bookingId)) {
    throw new Error("You are not allowed to delete this booking");
  }

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) {
    throw new Error("Booking could not be deleted");
  }

  revalidatePath("/account/reservations");
}

export async function updateReservation(reservationId, formData) {
  // 1)Authentication
  const session = await auth();

  if (!session) {
    throw new Error("You must be logged in");
  }
  // 2)Authorization
  const booking = await getBooking(reservationId);

  if (booking.guestId !== session.user.guestId) {
    throw new Error("You are not allowed to update this reservation");
  }

  // 3)Building update data
  const observations = formData.get("observations").slice(0, 1000);
  const numGuests = Number(formData.get("numGuests"));

  const updateData = { observations, numGuests };

  // 4)Mutation
  const { error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", reservationId)
    .select()
    .single();

  // 5)Error handling
  if (error) {
    throw new Error("Reservation could not be updated");
  }

  // 6)Revalidation
  revalidatePath(`/account/reservations/edit/${reservationId}`);
  revalidatePath("/account/reservations");

  // 7)Redirecting
  redirect("/account/reservations");
}

export async function singInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function singOutAction() {
  await signOut("google", { redirectTo: "/" });
}
