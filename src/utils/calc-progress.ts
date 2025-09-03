interface ProgressParams {
  uploadSizeInBytes: number
  originalSizeInBytes: number
}

export function calcProgress(
  { uploadSizeInBytes, originalSizeInBytes }: ProgressParams
) {
  return Math.min(
    Math.round(uploadSizeInBytes / originalSizeInBytes * 100),
    100,
  )
}
