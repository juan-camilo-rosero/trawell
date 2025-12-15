"use client";

import Link from "next/link";
import { ItineraryLean } from "@/models/itinerary/Itinerary";
import { Calendar, Users, DollarSign, MoreVertical } from "lucide-react";
import { FaTrash } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";

interface ItineraryCardProps {
  itinerary: ItineraryLean;
  onDelete: (id: string) => void;
}

export function ItineraryCard({ itinerary, onDelete }: ItineraryCardProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { userData } = useUser();

  const startDate = new Date(itinerary.searchParams.departureDate);
  const endDate = new Date(itinerary.searchParams.returnDate);
  const durationInDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const totalTravelers =
    itinerary.searchParams.travelers.adults +
    itinerary.searchParams.travelers.children +
    itinerary.searchParams.travelers.babies;

  const formattedPrice = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: itinerary.currency || "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(itinerary.totalPrice);

  const handleDelete = async () => {
    if (userData?.firebaseUid !== itinerary.userId) {
      alert("You do not have permission to delete this itinerary");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(
        `https://trawell-yuxn.vercel.app/api/itineraries/${itinerary._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error deleting itinerary");
      }

      onDelete(itinerary._id.toString());
      setIsAlertOpen(false);
    } catch (error) {
      console.error("Error deleting itinerary:", error);
      alert("Error deleting itinerary. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg p-6 flex flex-col justify-between h-full">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
              {itinerary.title}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setIsAlertOpen(true)}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <FaTrash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {durationInDays} {durationInDays === 1 ? "day" : "days"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span className="text-sm">
                {totalTravelers} {totalTravelers === 1 ? "person" : "people"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-900">
              <DollarSign className="w-4 h-4" />
              <span className="text-lg font-bold">{formattedPrice}</span>
            </div>
          </div>
        </div>

        <Link
          href={`/dashboard/itinerary/${itinerary._id}`}
          className="primary-btn block w-full text-center mt-4"
        >
          View itinerary
        </Link>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              itinerary &quot;{itinerary.title}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="bg-secondary-200 hover:bg-secondary-300 transition-all"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-primary hover:bg-primary-600 transition-all text-secondary-100"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
