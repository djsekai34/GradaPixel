import type { ContentBlock } from "@/types/article"
import Credit from "./credits"
import RichText from "./RichText"
import VideoEmbed from "./videoEmbed"

export default function ArticleBody({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p key={i} className="font-serif text-lg leading-8">
                {block.text}
              </p>
            )

          case "richtext":
            return <RichText key={i} html={block.html} />

          case "heading":
            return (
              <h2
                key={i}
                className="pt-4 font-display text-3xl font-bold italic uppercase leading-tight"
              >
                {block.text}
              </h2>
            )

          case "image": {
            const hasCredit = Boolean(block.credit?.trim() || block.creditUrl)
            return (
              <figure key={i} className="my-8">
                <img
                  src={block.src}
                  alt={block.alt}
                  width={1200}
                  height={675}
                  loading="lazy"
                  className="h-auto w-full"
                />
                {(block.caption || hasCredit) && (
                  <figcaption className="mt-2 space-y-0.5 text-sm text-muted-foreground">
                    {block.caption && <p>{block.caption}</p>}
                    {hasCredit && (
                      <p>
                        <Credit
                          text={block.credit}
                          url={block.creditUrl}
                          platform={block.creditPlatform}
                        />
                      </p>
                    )}
                  </figcaption>
                )}
              </figure>
            )
          }

          case "video":
            return (
              <figure key={i} className="my-8">
                <VideoEmbed youtubeId={block.youtubeId} title={block.title} />
                {block.caption && (
                  <figcaption className="mt-2 text-sm text-muted-foreground">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            )

          case "upload-video":
            return (
              <figure key={i} className="my-8">
                <video
                  src={block.src}
                  controls
                  preload="metadata"
                  playsInline
                  aria-label={block.title}
                  className="aspect-video w-full bg-black"
                />
                {block.caption && (
                  <figcaption className="mt-2 text-sm text-muted-foreground">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            )

          case "quote":
            return (
              <blockquote key={i} className="my-8 border-l-4 border-azul pl-5">
                <p className="font-serif text-2xl italic leading-9">“{block.text}”</p>
                {block.author && (
                  <footer className="mt-2 font-display text-lg font-bold uppercase italic text-muted-foreground">
                    {block.author}
                  </footer>
                )}
              </blockquote>
            )
        }
      })}
    </div>
  )
}
