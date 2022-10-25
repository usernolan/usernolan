import './style.css'
import typescriptLogo from './typescript.svg'
import { setupCounter } from './counter'

interface SvgHrefParams {
  href: string;
  src: string;
  cls: string;
  alt: string;
}

const svgHref = ({ href, src, cls, alt }: SvgHrefParams) => {
  return `
  <a href="${href}" target="_blank">
    <img src="${src}" class="${cls}" alt="${alt}" />
  </a>`
};

const viteSvg = svgHref({
  href: "https://vitejs.dev",
  src: "/vite.svg",
  cls: "logo",
  alt: "Vite logo"
});

const typescriptSvg = svgHref({
  href: "https://www.typescriptlang.org/",
  src: typescriptLogo,
  cls: "logo vanilla",
  alt: "TypeScript logo"
});

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    ${viteSvg}
    ${typescriptSvg}
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
