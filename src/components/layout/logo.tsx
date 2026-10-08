import logoDark from "@/assets/logo-dark.png"
import logoLight from "@/assets/logo-light.png"

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <>
      <img src={logoDark} alt="Grada Pixel" className={`hidden dark:block ${className}`} />
      <img src={logoLight} alt="Grada Pixel" className={`block dark:hidden ${className}`} />
    </>
  )
}