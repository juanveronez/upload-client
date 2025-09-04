function extractFilenameFromUrl(url: string) {
  const { pathname } = new URL(url)
  const segments = pathname.split('/').filter(segment => segment !== '')
  const filename = segments.length > 0 ? segments.at(-1) : null

  if (!filename) {
    throw new Error('URL does not contain a valid filename')
  }

  return filename
}

export async function downloadUrl(url: string) {
  try {
    const response = await fetch(url, { mode: 'cors' })
    const blob = await response.blob()
    const link = document.createElement('a')
    const filename = extractFilenameFromUrl(url)

    link.href = window.URL.createObjectURL(blob)
    link.download = filename

    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error downloading the file', error)
  }
}
