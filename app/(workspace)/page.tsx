import HeroSection from "@/components/home/HeroSection"
import Footer from "@/components/home/Footer"

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col justify-between px-4 sm:px-6">
      <div className="flex-1 flex items-center justify-center">
        <HeroSection />
      </div>
      <Footer />
    </div>
  )
}


