import { enableMapSet } from "immer";
import { create } from "zustand";
import { immer } from 'zustand/middleware/immer'
import { uploadFileToStorage } from "../http/upload-file-to-storage";
import { CanceledError } from "axios";
import { calcProgress } from "../utils/calc-progress";
import { useShallow } from "zustand/shallow";
import { compressImage } from "../utils/compress-image";

export type Upload = {
  name: string
  file: File
  abortController: AbortController
  status: 'progress' | 'success' | 'error' | 'canceled',
  originalSizeInBytes: number
  compressedSizeInBytes?: number
  uploadSizeInBytes: number
  remoteUrl?: string
}

type UploadState = {
  uploads: Map<string, Upload>
  addUploads: (files: File[]) => void
  cancelUpload: (uploadId: string) => void
}

enableMapSet()

export const useUploads = create<UploadState, [["zustand/immer", never]]>(
  immer((set, get) => {
    function updateUpload(uploadId: string, data: Partial<Upload>) {
      const upload = get().uploads.get(uploadId)
      if (!upload) return

      set(state => {
        state.uploads.set(uploadId, { ...upload, ...data })
      })
    }

    async function processUpload(uploadId: string) {
      const upload = get().uploads.get(uploadId)
      if (!upload) return

      try {
        const compressedFile = await compressImage({
          file: upload.file,
          quality: 0.9,
          maxHeight: 1000,
          maxWidth: 1000,
        })

        updateUpload(uploadId, { compressedSizeInBytes: compressedFile.size })

        const { url } = await uploadFileToStorage(
          {
            file: compressedFile,
            onProgress(sizeInBytes) {
              updateUpload(uploadId, { uploadSizeInBytes: sizeInBytes })
            },
          },
          { signal: upload.abortController.signal },
        )

        updateUpload(uploadId, { status: 'success', remoteUrl: url })
      } catch (err) {
        const isCanceled = err instanceof CanceledError
        updateUpload(uploadId, { status: isCanceled ? 'canceled' : 'error' })
      }
    }

    function cancelUpload(uploadId: string) {
      const upload = get().uploads.get(uploadId)
      if (!upload) return

      upload.abortController.abort('canceled')
    }

    function addUploads(files: File[]) {
      for (const file of files) {
        const uploadId = crypto.randomUUID();
        const abortController = new AbortController()

        const upload: Upload = {
          name: file.name,
          file,
          abortController,
          status: 'progress',
          originalSizeInBytes: file.size,
          uploadSizeInBytes: 0,
        };

        set((state) => {
          state.uploads.set(uploadId, upload);
        });

        processUpload(uploadId)
      }
    }


    return {
      uploads: new Map(),
      addUploads,
      cancelUpload,
    };
  })
);

export const usePendingUploads = () => {
  return useUploads(useShallow(store => {
    const isThereAnyPendingUploads = Array.from(store.uploads.values()).some(
      (upload) => upload.status === "progress"
    );

    if (!isThereAnyPendingUploads) {
      return { isThereAnyPendingUploads, globalPercentage: 100 }
    }

    const globalPercentage = calcProgress(Array.from(store.uploads.values()).reduce<{
      compressedSizeInBytes: number
      uploadSizeInBytes: number
    }>(
      (acc, { compressedSizeInBytes, uploadSizeInBytes }) => {
        acc.compressedSizeInBytes += (compressedSizeInBytes ?? 0)
        acc.uploadSizeInBytes += uploadSizeInBytes

        return acc
      }, { compressedSizeInBytes: 0, uploadSizeInBytes: 0 }
    ))

    return { isThereAnyPendingUploads, globalPercentage }
  }))


}
