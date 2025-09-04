interface CompressImageParams {
  file: File
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

function convertToWebp(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.')

  if (lastDotIndex === -1) {
    return `${filename}.webp`
  }

  const extensionlessName = filename.substring(0, lastDotIndex)
  return `${extensionlessName}.webp`
}

export function compressImage({
  file,
  maxHeight = Number.POSITIVE_INFINITY,
  maxWidth = Number.POSITIVE_INFINITY,
  quality = 1,
}: CompressImageParams) {
  const allowedFileTypes = [
    'image/jpg',
    'image/jpeg',
    'image/png',
    'image/webp',
  ]

  if (!allowedFileTypes.includes(file.type))
    throw new Error('Image format not supported')


  return new Promise<File>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = event => {
      const compressed = new Image()

      compressed.onload = () => {
        const canvas = document.createElement('canvas')

        let width = compressed.width
        let height = compressed.height

        if (width > height) {
          if (width > maxWidth) {
            const proportionalHeight = height * maxWidth / width
            width = maxWidth
            height = proportionalHeight
          }
        } else {
          if (height > maxHeight) {
            const proportionalWidth = width * maxHeight / height
            height = maxHeight
            width = proportionalWidth
          }
        }

        canvas.width = width
        canvas.height = height

        const context = canvas.getContext('2d')

        if (!context) {
          return reject(new Error('Failed to get canvas context'))
        }

        context.drawImage(compressed, 0, 0, width, height)

        canvas.toBlob(
          blob => {
            if (!blob) {
              return reject(new Error('Failed to compress image.'))
            }

            const convertedFile = convertToWebp(file.name)
            const compressedFile = new File(
              [blob],
              convertedFile,
              {
                type: 'image/webp',
                lastModified: Date.now(),
              }
            )

            resolve(compressedFile)
          },
          'image/webp',
          quality
        )
      }

      compressed.src = event.target?.result as string
    }

    reader.readAsDataURL(file)
  })
}
