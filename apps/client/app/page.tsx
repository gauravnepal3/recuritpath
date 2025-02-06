import { Button } from "@repo/ui/components/button"

export default function Page() {
  return (
    <div className="max-w-screen-lg mx-auto  min-h-svh">
      <div className="flex items-center justify-between border-b py-3">
        <div className="">Organization Name</div>
        <Button>
          Subscribe
        </Button>
      </div>
    </div>
  )
}
