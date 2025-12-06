"use client";
import React, { useState } from "react";
import { MoreVertical, Trash2, ArrowUp, ArrowDown, Plus, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import CustomizeItinerary from "./CustomizeItinerary";

interface ItemMenuProps {
  itemId: string;
  itemType: "flight" | "accommodation" | "food" | "tourist_site";
  dayNumber: number;
  isFirst: boolean;
  isLast: boolean;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddBefore: () => void;
  onAddAfter: () => void;
  onReplace: () => void;
}

function ItemMenu({
  itemId,
  itemType,
  dayNumber,
  isFirst,
  isLast,
  onDelete,
  onMoveUp,
  onMoveDown,
}: ItemMenuProps) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showAddBeforeDialog, setShowAddBeforeDialog] = useState(false);
  const [showAddAfterDialog, setShowAddAfterDialog] = useState(false);
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const isMobile = useIsMobile();

  const handleDelete = () => {
    onDelete();
    setShowDeleteAlert(false);
  };

  const AddDialogContent = ({ type }: { type: "before" | "after" }) => (
    <CustomizeItinerary
      dayNumber={dayNumber}
      insertPosition={type}
      relativeToItemId={itemId}
      onClose={() => {
        if (type === "before") {
          setShowAddBeforeDialog(false);
        } else {
          setShowAddAfterDialog(false);
        }
      }}
    />
  );

  const ReplaceDialogContent = () => (
    <CustomizeItinerary
      dayNumber={dayNumber}
      insertPosition="replace"
      relativeToItemId={itemId}
      itemTypeToReplace={itemType}
      onClose={() => setShowReplaceDialog(false)}
    />
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-muted-200 transition-colors z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-5 h-5 text-muted-600" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {!isFirst && (
            <DropdownMenuItem onClick={onMoveUp} className="cursor-pointer">
              <ArrowUp className="w-4 h-4 mr-2" />
              Subir item
            </DropdownMenuItem>
          )}
          {!isLast && (
            <DropdownMenuItem onClick={onMoveDown} className="cursor-pointer">
              <ArrowDown className="w-4 h-4 mr-2" />
              Bajar item
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowReplaceDialog(true)}
            className="cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reemplazar item
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowAddBeforeDialog(true)}
            className="cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Añadir antes
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowAddAfterDialog(true)}
            className="cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Añadir después
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteAlert(true)}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El item será eliminado
              permanentemente del itinerario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isMobile ? (
        <Drawer
          open={showAddBeforeDialog}
          onOpenChange={setShowAddBeforeDialog}
        >
          <DrawerContent className="bg-secondary-100 custom-ph pb-6 pt-4">
            <DrawerHeader className="hidden">
              <DrawerTitle>Añadir item antes</DrawerTitle>
              <DrawerDescription>
                Selecciona el tipo de item que deseas añadir
              </DrawerDescription>
            </DrawerHeader>
            <AddDialogContent type="before" />
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog
          open={showAddBeforeDialog}
          onOpenChange={setShowAddBeforeDialog}
        >
          <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Añadir item antes</DialogTitle>
              <DialogDescription>
                Selecciona el tipo de item que deseas añadir
              </DialogDescription>
            </DialogHeader>
            <AddDialogContent type="before" />
          </DialogContent>
        </Dialog>
      )}

      {isMobile ? (
        <Drawer open={showAddAfterDialog} onOpenChange={setShowAddAfterDialog}>
          <DrawerContent className="bg-secondary-100 custom-ph pb-6 pt-4">
            <DrawerHeader className="hidden">
              <DrawerTitle>Añadir item después</DrawerTitle>
              <DrawerDescription>
                Selecciona el tipo de item que deseas añadir
              </DrawerDescription>
            </DrawerHeader>
            <AddDialogContent type="after" />
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={showAddAfterDialog} onOpenChange={setShowAddAfterDialog}>
          <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Añadir item después</DialogTitle>
              <DialogDescription>
                Selecciona el tipo de item que deseas añadir
              </DialogDescription>
            </DialogHeader>
            <AddDialogContent type="after" />
          </DialogContent>
        </Dialog>
      )}

      {isMobile ? (
        <Drawer open={showReplaceDialog} onOpenChange={setShowReplaceDialog}>
          <DrawerContent className="bg-secondary-100 custom-ph pb-6 pt-4">
            <DrawerHeader className="hidden">
              <DrawerTitle>Reemplazar item</DrawerTitle>
              <DrawerDescription>
                Selecciona el nuevo item que reemplazará al actual
              </DrawerDescription>
            </DrawerHeader>
            <ReplaceDialogContent />
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={showReplaceDialog} onOpenChange={setShowReplaceDialog}>
          <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Reemplazar item</DialogTitle>
              <DialogDescription>
                Selecciona el nuevo item que reemplazará al actual
              </DialogDescription>
            </DialogHeader>
            <ReplaceDialogContent />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export default ItemMenu;