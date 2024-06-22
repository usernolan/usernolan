import fs from "node:fs"
import { imageSizeFromFile } from 'image-size/fromFile'
import sharp from "sharp"
import { imageItems } from "../static/markup.js"

const inputRoot = './images'
const outputRoot = './public'

const dropExtension = (s: string) => {
  const i = s.lastIndexOf('.')
  return i < 0 ? s : s.substring(0, i)
}

const tiffNames =
  fs.readdirSync(`${inputRoot}/tiff`)
    .filter((x) => !x.startsWith("."))
    .map(dropExtension)

tiffNames.forEach((x) => {
  const outputPath = `${outputRoot}/avif/${x}.avif`
  if (!fs.existsSync(outputPath)) {
    console.log(`\tWriting ${outputPath}`)
    sharp(`${inputRoot}/tiff/${x}.tiff`)
      .resize(800)
      .avif({ quality: 64, effort: 9 })
      .toFile(outputPath)
  }
})

tiffNames.forEach((x) => {
  const outputPath = `${outputRoot}/webp/${x}.webp`
  if (!fs.existsSync(outputPath)) {
    console.log(`\tWriting ${outputPath}`)
    sharp(`${inputRoot}/tiff/${x}.tiff`)
      .resize(800)
      .webp({ quality: 82, effort: 6 })
      .toFile(outputPath)
  }
})

tiffNames.forEach((x) => {
  const outputPath = `${outputRoot}/jpeg/${x}.jpeg`
  if (!fs.existsSync(outputPath)) {
    console.log(`\tWriting ${outputPath}`)
    sharp(`${inputRoot}/tiff/${x}.tiff`)
      .resize(800)
      .jpeg()
      .toFile(outputPath)
  }
})

const jpgNames =
  fs.readdirSync(`${inputRoot}/jpg`)
    .filter((x) => !x.startsWith("."))
    .map(dropExtension)

jpgNames.forEach((x) => {
  const outputPath = `${outputRoot}/avif/${x}.avif`
  if (!fs.existsSync(outputPath)) {
    console.log(`\tWriting ${outputPath}`)
    sharp(`${inputRoot}/jpg/${x}.jpg`)
      .resize(800)
      .avif({ quality: 64, effort: 9 })
      .toFile(outputPath)
  }
})

jpgNames.forEach((x) => {
  const outputPath = `${outputRoot}/webp/${x}.webp`
  if (!fs.existsSync(outputPath)) {
    console.log(`\tWriting ${outputPath}`)
    sharp(`${inputRoot}/jpg/${x}.jpg`)
      .resize(800)
      .webp({ quality: 82, effort: 6 })
      .toFile(outputPath)
  }
})

jpgNames.forEach((x) => {
  const outputPath = `${outputRoot}/jpeg/${x}.jpeg`
  if (!fs.existsSync(outputPath)) {
    console.log(`\tWriting ${outputPath}`)
    sharp(`${inputRoot}/jpg/${x}.jpg`)
      .resize(800)
      .jpeg()
      .toFile(outputPath)
  }
})

const wrongSize: string[] = []
await Promise.all(imageItems.map(async (x) => {
  const y = await imageSizeFromFile(`${outputRoot}${x.src}`)
  if (x.width !== y.width || x.height !== y.height)
    wrongSize.push(`\t${x.id} should be { width: ${y.width}, height: ${y.height} }`)
}))

if (wrongSize.length)
  throw new Error(`Images have wrong size:\n${wrongSize.join('\n')}`)
