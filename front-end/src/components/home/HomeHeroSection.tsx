import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router"
import { ArrowUpRight } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "~/components/ui/carousel"
import { categories } from "~/mock/productData"
import { cn } from "~/lib/utils"

type HeroSlide = {
  id: string
  image: string
  imageAlt: string
  headline: [string, string]
  tagline: string
  subtext: string
  cta: { label: string; href: string }
}

const HERO_SLIDE_META: Omit<HeroSlide, "image" | "imageAlt">[] = [
  {
    id: "dong-ho",
    headline: ["Đồng hồ", "thông minh"],
    tagline: "Luôn kết nối mọi lúc",
    subtext:
      "Apple Watch, Galaxy Watch chính hãng. Bảo hành 12 tháng, giao nhanh 2h nội thành.",
    cta: { label: "Mua ngay", href: "/category/dong-ho" },
  },
  {
    id: "dien-thoai",
    headline: ["Điện thoại", "flagship"],
    tagline: "Hiệu năng đỉnh cao",
    subtext:
      "iPhone, Samsung Galaxy giá tốt. Trả góp 0%, đổi cũ lấy mới hỗ trợ tận nơi.",
    cta: { label: "Khám phá", href: "/category/dien-thoai" },
  },
  {
    id: "laptop",
    headline: ["Laptop", "cao cấp"],
    tagline: "Làm việc và sáng tạo",
    subtext:
      "MacBook, Dell XPS chính hãng. Giảm đến 20% trong tuần lễ công nghệ.",
    cta: { label: "Xem ưu đãi", href: "/category/laptop" },
  },
  {
    id: "tai-nghe",
    headline: ["Tai nghe", "chống ồn"],
    tagline: "Âm thanh sống động",
    subtext:
      "AirPods, Sony WH-1000XM5 chính hãng. Freeship toàn quốc, đổi trả 7 ngày.",
    cta: { label: "Mua ngay", href: "/category/tai-nghe" },
  },
]

const HERO_SLIDES: HeroSlide[] = HERO_SLIDE_META.map((slide) => {
  const category = categories.find((cat) => cat.id === slide.id)
  return {
    ...slide,
    image: category?.image ?? "/categories/dong-ho.png",
    imageAlt: category?.name ?? slide.headline.join(" "),
  }
})

const AUTOPLAY_MS = 2000

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return "Chào buổi sáng"
  if (hour < 18) return "Chào buổi chiều"
  return "Chào buổi tối"
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
    <div className="relative mx-auto grid h-full w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12">
      <div
        className="pointer-events-none absolute -left-20 top-1/4 size-64 rounded-full bg-[#00cbfd]/12 blur-3xl lg:size-80"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-1/4 size-56 rounded-full bg-[#ee4d2d]/10 blur-3xl lg:size-72"
        aria-hidden="true"
      />

      <div className="relative z-10 order-2 lg:order-1">
        {showGreeting && (
          <p className="mb-3 text-sm text-[#94a3b8]">
            {getGreeting()},{" "}
            <span className="font-semibold text-[#f1f5f9]">{userName || "bạn"}</span>
          </p>
        )}

        <HeadingTag className="text-[clamp(1.875rem,4.5vw,3rem)] font-bold leading-[1.1] tracking-tight text-[#f1f5f9]">
          {slide.headline[0]}{" "}
          <span className="text-[#00cbfd]">{slide.headline[1]}</span>
        </HeadingTag>

        <div className="my-4 h-px w-12 bg-white/20" aria-hidden="true" />

        <p className="text-lg font-semibold text-[#e2e8f0] sm:text-xl">{slide.tagline}</p>

        <p className="mt-3 max-w-md text-base leading-relaxed text-[#94a3b8]">
          {slide.subtext}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to={slide.cta.href}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#00cbfd] px-6 text-sm font-semibold text-[#003e4f] transition-transform active:scale-[0.98] hover:bg-[#00b5e5]"
          >
            {slide.cta.label}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            to={slide.cta.href}
            className="inline-flex h-11 items-center rounded-full border border-white/25 bg-white/5 px-6 text-sm font-medium text-[#f1f5f9] transition-colors hover:border-[#00cbfd] hover:text-[#00cbfd]"
          >
            Xem thêm
          </Link>
        </div>
      </div>

      <div className="relative z-10 order-1 flex min-h-0 items-center justify-center lg:order-2 lg:justify-end">
        <div className="relative flex items-center justify-center">
          <div
            className="absolute bottom-[6%] left-1/2 h-8 w-[75%] -translate-x-1/2 rounded-[50%] bg-[#00cbfd]/20 blur-2xl sm:h-10"
            aria-hidden="true"
          />
          <img
            src={slide.image}
            alt={slide.imageAlt}
            width={512}
            height={512}
            fetchPriority={isPrimary ? "high" : "auto"}
            loading={isPrimary ? "eager" : "lazy"}
            decoding={isPrimary ? "sync" : "async"}
            className="relative z-10 h-auto max-h-[clamp(11rem,38vh,26rem)] w-auto max-w-[min(85vw,26rem)] object-contain drop-shadow-[0_24px_56px_rgba(0,203,253,0.18)] motion-safe:animate-[hero-float_6s_ease-in-out_infinite] sm:max-h-[clamp(13rem,42vh,28rem)] lg:max-w-[28rem]"
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
      className="hero-apple hero-gradient relative isolate w-full overflow-hidden"
      aria-label="Banner khuyến mãi"
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
      <Carousel setApi={setApi} opts={{ loop: true, duration: 30 }} className="h-full min-h-[inherit] w-full">
        <CarouselContent className="-ml-0 h-full min-h-[inherit]">
          {HERO_SLIDES.map((slide, index) => (
            <CarouselItem key={slide.id} className="h-full min-h-[inherit] basis-full pl-0">
              <div className="flex h-full min-h-[inherit] items-center py-10 sm:py-12 lg:py-14">
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

      <div className="absolute inset-x-0 bottom-6 z-20 flex items-center justify-center gap-2.5">
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
                "block size-2 origin-center rounded-full transition-[transform,background-color] duration-300 ease-out",
                activeIndex === index
                  ? "scale-125 bg-[#00cbfd]"
                  : "scale-100 bg-white/30 hover:bg-white/50"
              )}
            />
          </button>
        ))}
      </div>
    </section>
  )
}
