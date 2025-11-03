'use client'

import { useState, useEffect } from 'react'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from '@/components/ui/carousel'
import Autoplay from 'embla-carousel-autoplay'
import { OnboardingSlide } from './OnboardingSlide'

interface SlideData {
  image: string
  title: string
  subtitle: string
}

interface DesktopCarouselProps {
  slides: SlideData[]
}

export function DesktopCarousel({ slides }: DesktopCarouselProps) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (!carouselApi) return

    carouselApi.on('select', () => {
      setCurrentSlide(carouselApi.selectedScrollSnap())
    })
  }, [carouselApi])

  const handlePrevious = () => {
    carouselApi?.scrollPrev()
  }

  const handleNext = () => {
    carouselApi?.scrollNext()
  }

  return (
    <div className="relative h-full w-full">
      <Carousel
        setApi={setCarouselApi}
        opts={{
          loop: true,
          align: 'center',
        }}
        plugins={[
          Autoplay({
            delay: 7000,
          }),
        ]}
        className="h-full w-full"
      >
        <CarouselContent className="h-screen">
          {slides.map((slide, index) => (
            <CarouselItem key={index} className="h-full">
              <OnboardingSlide {...slide} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Carousel Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
        <button
          onClick={handlePrevious}
          className="w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors shadow-md"
          aria-label="Anterior"
        >
          <IoChevronBack className="text-gray-900" size={20} />
        </button>

        {/* Dots */}
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => carouselApi?.scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSlide === index ? 'bg-primary w-8' : 'bg-gray-400'
              }`}
              aria-label={`Ir a slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors shadow-md"
          aria-label="Siguiente"
        >
          <IoChevronForward className="text-gray-900" size={20} />
        </button>
      </div>
    </div>
  )
}