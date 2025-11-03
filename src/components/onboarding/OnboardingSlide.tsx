'use client'

interface OnboardingSlideProps {
  image: string
  title: string
  subtitle: string
}

export function OnboardingSlide({ image, title, subtitle }: OnboardingSlideProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Image - más pequeña en desktop */}
      <div className="flex-1 md:flex-[1.2] flex items-center justify-center overflow-hidden bg-secondary-200">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Text - centrado en desktop */}
      <div className="flex-1 bg-secondary-100 custom-ph flex flex-col justify-center py-6 md:text-center">
        <h2 className="text-2xl md:text-xl lg:text-2xl font-bold text-gray-900 mb-3">
          {title}
        </h2>
        <p className="text-base md:text-sm lg:text-base text-gray-600">{subtitle}</p>
      </div>
    </div>
  )
}