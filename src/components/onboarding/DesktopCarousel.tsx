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

interface SlideData {
  image: string
  title: string
  subtitle: string
}

interface DesktopCarouselProps {
  slides: SlideData[]
}

// OnboardingSlide component inline
function OnboardingSlide({ image, title, subtitle }: SlideData) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center py-16">
      <img
        src={image}
        alt={title}
        className="w-auto max-h-[30vh] mb-6 object-contain"
      />
      <h2 className="text-2xl font-semibold text-gray-900 mb-3">{title}</h2>
      <p className="text-base text-gray-600 max-w-lg">{subtitle}</p>
    </div>
  )
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
    <div className="relative h-full w-full flex items-center justify-center">
      <Carousel
        setApi={setCarouselApi}
        className="h-full w-full"
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: true,
          }),
        ]}
      >
        <CarouselContent className="h-full ml-0">
          {slides.map((slide, index) => (
            <CarouselItem key={index} className="h-full pl-0">
              <div className="h-full w-full flex items-center justify-center">
                <OnboardingSlide {...slide} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Carousel Controls */}
        <div className="absolute bottom-16 left-0 right-0 flex items-center justify-center gap-3 px-8 z-10">
          <button
            onClick={handlePrevious}
            className="p-1.5 rounded-full bg-white/70 hover:bg-white/90 shadow-sm transition-colors"
            aria-label="Slide anterior"
          >
            <IoChevronBack className="w-4 h-4 text-gray-600" />
          </button>

          {/* Dots */}
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => carouselApi?.scrollTo(index)}
                className={`h-1.5 rounded-full transition-all ${
                  currentSlide === index ? 'bg-primary w-6' : 'bg-gray-300 w-1.5'
                }`}
                aria-label={`Ir a slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="p-1.5 rounded-full bg-white/70 hover:bg-white/90 shadow-sm transition-colors"
            aria-label="Siguiente slide"
          >
            <IoChevronForward className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </Carousel>
    </div>
  )
}