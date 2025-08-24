import { UploadWidget } from "./components/upload-widget";

export function App() {
  return (
    // Why dvh? https://web.dev/blog/viewport-units?hl=pt-br
    <main className="h-dvh flex flex-col justify-center items-center p-10">
      <UploadWidget />
    </main>
  )
}
