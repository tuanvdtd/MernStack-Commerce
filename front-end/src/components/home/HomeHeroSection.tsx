import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router"
import { ArrowUpRight } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "~/components/ui/carousel"
import { cn } from "~/lib/utils"

type HeroSlide = {
  id: string
  image: string
  imageAlt: string
  headline: [string, string]
  tagline: string
  subtext: string
  highlights: [string, string, string]
  cta: { label: string; href: string }
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "dong-ho",
    image: "/hero/dongho1.png",
    imageAlt: "Smartwatch",
    headline: ["Smart", "watches"],
    tagline: "Track your health anytime, anywhere",
    subtext:
      "Official VN/A Apple Watch and Galaxy Watch. 12-month warranty with 2-hour city delivery.",
    highlights: ["Official VN/A", "2-hour delivery", "12-month warranty"],
    cta: { label: "Buy now", href: "/category/dong-ho" },
  },
  {
    id: "dien-thoai",
    image: "/hero/phone1.png",
    imageAlt: "Flagship phone",
    headline: ["Flagship", "phones"],
    tagline: "Peak performance and outstanding cameras",
    subtext:
      "Great prices on iPhone and Samsung Galaxy. 0% installment plans and trade-in support.",
    highlights: ["0% installments", "Trade-in support", "Free shipping"],
    cta: { label: "Explore", href: "/category/dien-thoai" },
  },
  {
    id: "laptop",
    image: "/hero/laptop1.png",
    imageAlt: "Premium laptop",
    headline: ["Premium", "laptops"],
    tagline: "Work, create, and unwind",
    subtext:
      "Official MacBook and Dell XPS models. Save up to 20% during tech week.",
    highlights: ["Save 20%", "Free backpack", "24-month warranty"],
    cta: { label: "View deals", href: "/category/laptop" },
  },
  {
    id: "tai-nghe",
    image: "/hero/tainghe1.png",
    imageAlt: "Noise-cancelling headphones",
    headline: ["Noise-cancelling", "headphones"],
    tagline: "Immersive sound and deep focus",
    subtext:
      "Official AirPods and Sony WH-1000XM5. Nationwide free shipping with 7-day returns.",
    highlights: ["ANC noise cancelling", "7-day returns", "Free shipping"],
    cta: { label: "Buy now", href: "/category/tai-nghe" },
  },
]

const AUTOPLAY_MS = 3000

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

type HomeHeroSectionProps = {
  variant: "guest" | "member"
  userName?: string
}

type HeroSlideContentProps = {
  slide: HeroSlide
  isPrimary?: boolean
  showGreeting?: boolean
  userName?: string
}

const HeroSlideContent = ({
  slide,
  isPrimary = false,
  showGreeting,
  userName,
}: HeroSlideContentProps) => {
  const HeadingTag = isPrimary ? "h1" : "h2"

  return (
    <div className="hero-slide__grid">
      <div className="hero-slide__copy">
        {showGreeting && (
          <p className="text-sm text-[#757575] sm:text-base">
            {getGreeting()},{" "}
            <span className="font-semibold text-[#2b2f32]">{userName || "there"}</span>
          </p>
        )}

        <HeadingTag className="hero-slide__title">
          {slide.headline[0]}{" "}
          <span className="text-[#00cbfd]">{slide.headline[1]}</span>
        </HeadingTag>

        <hr className="hero-slide__divider" />

        <p className="hero-slide__tagline">{slide.tagline}</p>

        <p className="hero-slide__body">{slide.subtext}</p>

        <ul className="hero-slide__chips" aria-label="Featured offers">
          {slide.highlights.map((item) => (
            <li key={item} className="hero-slide__chip">
              {item}
            </li>
          ))}
        </ul>

        <div>
          <Link to={slide.cta.href} className="hero-slide__cta">
            {slide.cta.label}
            <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="hero-slide__visual">
        <div className="hero-slide__image-frame">
          <img
            src={slide.image}
            alt={slide.imageAlt}
            width={480}
            height={480}
            fetchPriority={isPrimary ? "high" : "auto"}
            loading={isPrimary ? "eager" : "lazy"}
            decoding={isPrimary ? "sync" : "async"}
          />
        </div>
      </div>
    </div>
  )
}

export const HomeHeroSection = ({ variant, userName }: HomeHeroSectionProps) => {
  const [api, setApi] = useState<CarouselApi>()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const onSelect = useCallback(() => {
    if (!api) return
    setActiveIndex(api.selectedScrollSnap())
  }, [api])

  useEffect(() => {
    if (!api) return
    onSelect()
    api.on("select", onSelect)
    return () => {
      api.off("select", onSelect)
    }
  }, [api, onSelect])

  useEffect(() => {
    if (!api || isPaused) return

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) return

    const timer = window.setInterval(() => {
      api.scrollNext()
    }, AUTOPLAY_MS)

    return () => window.clearInterval(timer)
  }, [api, isPaused])

  const scrollTo = (index: number) => api?.scrollTo(index)

  return (
    <section
      className="hero-apple hero-gradient relative isolate w-full overflow-x-clip"
      aria-label="Promotional banner"
      aria-roledescription="carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsPaused(false)
        }
      }}
    >
      <Carousel setApi={setApi} opts={{ loop: true, duration: 30 }} className="w-full">
        <CarouselContent className="-ml-0">
          {HERO_SLIDES.map((slide, index) => (
            <CarouselItem key={slide.id} className="basis-full pl-0">
              <div className="hero-slide">
                <HeroSlideContent
                  slide={slide}
                  isPrimary={index === 0}
                  showGreeting={variant === "member" && index === 0}
                  userName={userName}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="hero-slide__dots">
        {HERO_SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Slide ${index + 1}: ${slide.imageAlt}`}
            aria-current={activeIndex === index ? "true" : undefined}
            onClick={() => scrollTo(index)}
            className="flex size-4 items-center justify-center"
          >
            <span
              className={cn(
                "block size-2 rounded-full transition-[transform,background-color] duration-300",
                activeIndex === index
                  ? "scale-125 bg-[#00cbfd]"
                  : "bg-[#00cbfd]/35 hover:bg-[#00cbfd]/55"
              )}
            />
          </button>
        ))}
      </div>
    </section>
  )
}
