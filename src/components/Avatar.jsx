// Foto do franqueado; sem foto, as iniciais do nome.
export default function Avatar({ nome = '', foto, className = 'av', ...resto }) {
  const iniciais = nome.split(' ').filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase()
  return foto
    ? <span className={`${className} com-foto`} {...resto}><img src={foto} alt="" /></span>
    : <span className={className} {...resto}>{iniciais}</span>
}

// Recorta a imagem no centro (quadrado), reduz para 256 px e devolve um JPEG pequeno (data URL).
// O tamanho final fica abaixo de ~45 mil caracteres para caber numa célula da planilha.
export const prepararFoto = arquivo => prepararImagem(arquivo, 1, 256)

// Recorta no centro na proporção largura/altura "prop" e reduz até caber numa célula da planilha.
export function prepararImagem(arquivo, prop = 1, largura = 256) {
  return new Promise((ok, falha) => {
    if (!arquivo || !arquivo.type.startsWith('image/')) return falha(new Error('Escolha um arquivo de imagem (JPG ou PNG).'))
    const url = URL.createObjectURL(arquivo)
    const img = new Image()
    img.onload = () => {
      // área de corte no centro, na proporção pedida
      let cw = img.width, ch = img.width / prop
      if (ch > img.height) { ch = img.height; cw = ch * prop }
      let tam = largura
      let saida = ''
      for (let tentativa = 0; tentativa < 6; tentativa++) {
        const c = document.createElement('canvas')
        c.width = tam
        c.height = Math.round(tam / prop)
        const g = c.getContext('2d')
        g.fillStyle = '#fff'
        g.fillRect(0, 0, c.width, c.height)
        g.drawImage(img, (img.width - cw) / 2, (img.height - ch) / 2, cw, ch, 0, 0, c.width, c.height)
        saida = c.toDataURL('image/jpeg', tentativa < 3 ? 0.82 - tentativa * 0.12 : 0.6)
        if (saida.length < 45000) break
        if (tentativa >= 2) tam = Math.round(tam * 0.8)
      }
      URL.revokeObjectURL(url)
      saida.length < 45000 ? ok(saida) : falha(new Error('Não consegui reduzir essa imagem. Tente outra foto.'))
    }
    img.onerror = () => { URL.revokeObjectURL(url); falha(new Error('Não consegui abrir essa imagem. Tente outra foto.')) }
    img.src = url
  })
}
