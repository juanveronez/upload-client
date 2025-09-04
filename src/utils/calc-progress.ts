interface ProgressParams {
  uploadSizeInBytes: number
  compressedSizeInBytes?: number
}

export function calcProgress(
  { uploadSizeInBytes, compressedSizeInBytes }: ProgressParams
) {
  if (!compressedSizeInBytes) return 0

  return Math.min(
    Math.round(uploadSizeInBytes / compressedSizeInBytes * 100),
    100,
  )
}
