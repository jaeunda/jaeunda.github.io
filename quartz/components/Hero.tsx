import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

interface Options {
  greeting: string
  accent: string
  subtitle: string
}

const defaultOptions: Options = {
  greeting: "",
  accent: "",
  subtitle:
    "공부하면서 이해한 것들을 제 언어로 기록합니다.",
}

export default ((opts?: Partial<Options>) => {
  const options = { ...defaultOptions, ...opts }

  const Hero: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    if (fileData.slug !== "index") return null

    const parts = options.greeting.split("{accent}")
    return (
      <section class={`hero ${displayClass ?? ""}`}>
        <h1 class="hero-greeting">
          {parts[0]}
          <em class="accent">{options.accent}</em>
          {parts[1]}
        </h1>
        <p class="hero-sub">{options.subtitle}</p>
      </section>
    )
  }

  return Hero
}) satisfies QuartzComponentConstructor
