import Link from "next/link"

function Banner() {
  return (
    <div className="w-full p-8 bg-white rounded-lg flex flex-col justify-center items-start gap-4">
        <h2 className="text-4xl mb-4 font-semibold">Ready to discover a <b className="text-primary font-semibold">new</b> destination?</h2>
        <Link className="primary-btn w-auto" href="/dashboard/new-trip">Create itinerary</Link>
    </div>
  )
}

export default Banner