import { useRef } from "react"
import { useMutation } from "@tanstack/react-query"
import { errorMessage, uploadMedia } from "@/lib/api"
import { buttonClass } from "./ui"

const ACCEPT = {
  image: "image/jpeg,image/png,image/webp",
  video: "video/mp4,video/webm",
}

export default function MediaUpload({
  kind,
  onUploaded,
}: {
  kind: "image" | "video"
  onUploaded: (url: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const mutation = useMutation({
    mutationFn: (file: File) => uploadMedia(file, kind),
    onSuccess: (url) => onUploaded(url),
  })

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT[kind]}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ""
          if (file) mutation.mutate(file)
        }}
      />
      <button
        type="button"
        disabled={mutation.isPending}
        onClick={() => inputRef.current?.click()}
        className={buttonClass}
      >
        {mutation.isPending
          ? "Subiendo…"
          : kind === "image"
            ? "Subir imagen"
            : "Subir vídeo"}
      </button>
      <p className="mt-1 text-xs text-muted-foreground">
        {kind === "image"
          ? "JPG, PNG o WebP, máximo 10 MB."
          : "MP4 o WebM, máximo 50 MB."}
      </p>
      {mutation.isError && (
        <p role="alert" className="mt-1 text-sm text-destructive">
          {errorMessage(mutation.error)}
        </p>
      )}
    </div>
  )
}