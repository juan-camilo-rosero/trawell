import NewTripForm from "@/components/dashboard/NewTripForm"

interface PageProps {
  params: { id: string }
}

function Page({ params }: PageProps) {
  const itineraryId = params.id
  console.log('itineraryId desde params:', itineraryId)
  
  return (
    <div className="w-full h-full">
      <NewTripForm itineraryId={itineraryId} />
    </div>
  )
}

export default Page