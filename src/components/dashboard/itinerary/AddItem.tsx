"use client";
import React from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { useIsMobile } from "@/hooks/use-mobile";
import CustomizeItinerary from "@/components/dashboard/itinerary/CustomizeItinerary";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

interface AddItemProps {
  dayNumber: number;
}

const AddItem: React.FC<AddItemProps> = ({ dayNumber }) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const trigger = (
    <div className="itinerary-icon-circle-add cursor-pointer">
      <AiOutlinePlus className="text-primary text-2xl" />
    </div>
  );
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="bg-secondary-100 custom-ph pb-6 pt-4">
          <DrawerHeader className="hidden">
            <DrawerTitle></DrawerTitle>
            <DrawerDescription></DrawerDescription>
          </DrawerHeader>
          <CustomizeItinerary dayNumber={dayNumber} onClose={handleClose} />
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir item al día {dayNumber}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <CustomizeItinerary dayNumber={dayNumber} onClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
};
export default AddItem;
