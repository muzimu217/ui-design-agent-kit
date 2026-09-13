import { MotionConfig } from 'motion/react'
import { AppProvider } from './store'
import { LangProvider } from './i18n'
import { SmoothScroll } from './components/SmoothScroll'
import { BackgroundLayer } from './components/BackgroundLayer'
import { RingTransition } from './components/RingTransition'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { ColorTheater } from './components/ColorTheater'
import { Features } from './components/Features'
import { ProcessSection } from './components/ProcessSection'
import { Pricing } from './components/Pricing'
import { Footer } from './components/Footer'
import { ProductCanvas } from './three/ProductCanvas'

export default function App() {
  return (
    <AppProvider>
      <LangProvider>
        <MotionConfig reducedMotion="user">
          <SmoothScroll />
          <BackgroundLayer />
          <ProductCanvas />
          <RingTransition />
          <div className="relative z-20">
            <Nav />
            <main>
              <Hero />
              <ColorTheater />
              <Features />
              <ProcessSection />
              <Pricing />
            </main>
            <Footer />
          </div>
        </MotionConfig>
      </LangProvider>
    </AppProvider>
  )
}
