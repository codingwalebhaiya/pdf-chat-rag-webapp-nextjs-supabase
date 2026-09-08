import HeroSection from "@/components/home/HeroSection"
import Footer from "@/components/home/Footer"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <HeroSection />
      <Footer />
    </div>
  )
}

