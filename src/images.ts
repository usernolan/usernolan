import fs from "node:fs"
import sharp from "sharp"

const inputRoot = './images'
const outputRoot = './public'

const dropExtension = (s: string) => {
  const i = s.lastIndexOf('.')
  return i < 0 ? s : s.substring(0, i)
}

const tiffNames =
  fs.readdirSync(`${inputRoot}/tiff`)
    .map(dropExtension)

tiffNames.forEach((x) => {
  sharp(`${inputRoot}/tiff/${x}.tiff`)
    .resize(800)
    .avif({ quality: 64, effort: 9 })
    .toFile(`${outputRoot}/avif/${x}.avif`)
})

tiffNames.forEach((x) => {
  sharp(`${inputRoot}/tiff/${x}.tiff`)
    .resize(800)
    .webp({ quality: 82, effort: 6 })
    .toFile(`${outputRoot}/webp/${x}.webp`)
})

tiffNames.forEach((x) => {
  sharp(`${inputRoot}/tiff/${x}.tiff`)
    .resize(800)
    .jpeg()
    .toFile(`${outputRoot}/jpeg/${x}.jpeg`)
})
