import fs from "node:fs"
import imageSize from "image-size"
import sharp from "sharp"
import { items, ImageItem } from "./markup.js"

const inputRoot = './images'
const outputRoot = './public'

const missized: string[] = []
items.forEach((x) => {
  if (x.types && x.types.indexOf("image") > -1) {
    const y = x as ImageItem
    const s = imageSize(`${outputRoot}${y.src}`)
    if (y.width !== s.width || y.height !== s.height)
      missized.push(`\t${y.id} should be { width: ${s.width}, height: ${s.height} }`)
  }
})

if (missized.length)
  throw new Error(`Missized images:\n${missized.join('\n')}`)

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
