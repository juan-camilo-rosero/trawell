'use client'
import React from 'react'
import { AiOutlinePlus } from 'react-icons/ai'
import { useIsMobile } from '@/hooks/use-mobile'
import CustomizeItinerary from '@/components/dashboard/itinerary/CustomizeItinerary'

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"

import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer"

const AddItem: React.FC = () => {
  const isMobile = useIsMobile()

  const trigger = (
    <div className="itinerary-icon-circle-add cursor-pointer">
      <AiOutlinePlus className="text-primary text-2xl" />
    </div>
  )

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          {trigger}
        </DrawerTrigger>

        <DrawerContent className='bg-secondary-100 custom-ph pb-6 pt-4'>
          <DrawerHeader className='hidden'>
            <DrawerTitle></DrawerTitle>
            <DrawerDescription></DrawerDescription>
          </DrawerHeader>

          <CustomizeItinerary />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir item</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <CustomizeItinerary />
      </DialogContent>
    </Dialog>
  )
}

export default AddItem
