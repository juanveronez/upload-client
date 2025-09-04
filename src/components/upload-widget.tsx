import * as Collapsible from "@radix-ui/react-collapsible";
import { UploadWidgetDropzone } from "./upload-widget-dropzone";
import { UploadWidgetHeader } from "./upload-widget-header";
import { UploadWidgetUploadList } from "./upload-widget-upload-list";
import { UploadWidgetMinimizedButton } from "./upload-widget-minimized-button";
import { motion, useCycle } from "motion/react";
import { usePendingUploads } from "../store/uploads";
import { useRef } from "react";

export function UploadWidget() {
  const contentRef = useRef<HTMLDivElement>(null)
  const { isThereAnyPendingUploads } = usePendingUploads()

  const [isWidgetOpen, toggleWidgetOpen] = useCycle(false, true)

  return (
    <Collapsible.Root onOpenChange={() => toggleWidgetOpen()} asChild>
      <motion.div
        data-progress={isThereAnyPendingUploads}
        animate={isWidgetOpen ? 'opened' : 'closed'}
        variants={{
          closed: {
            width: 'max-content',
            height: 44,
            transition: { duration: 0.1 }
          },
          opened: {
            width: 360,
            height: contentRef.current?.clientHeight,
            transition: { duration: 0.1 }
          }
        }}
        className={`
          bg-zinc-900 overflow-hidden rounded-xl data-[state=open]:shadow-shape border border-transparent animate-border
          data-[state=closed]:rounded-3xl data-[state=closed]:data-[progress=false]:shadow-shape data-[state=closed]:data-[progress=true]:[background:linear-gradient(45deg,#09090B,theme(colors.zinc.900)_50%,#09090B)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.zinc.700/.48)_80%,_theme(colors.indigo.500)_86%,_theme(colors.indigo.300)_90%,_theme(colors.indigo.500)_94%,_theme(colors.zinc.600/.48))_border-box]
        `}
      >
        {!isWidgetOpen && <UploadWidgetMinimizedButton />}

        <Collapsible.Content ref={contentRef}>
          <UploadWidgetHeader />

          <div className="flex flex-col gap-4 py-3">
            <UploadWidgetDropzone />

            <div className="h-px bg-zinc-800 border-t border-black/50 box-content" />

            <UploadWidgetUploadList />
          </div>
        </Collapsible.Content>
      </motion.div>
    </Collapsible.Root>
  )
}
