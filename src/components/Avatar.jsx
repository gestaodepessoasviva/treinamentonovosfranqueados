// Foto do franqueado; sem foto, as iniciais do nome.
export default function Avatar({ nome = '', foto, className = 'av', ...resto }) {
  const iniciais = nome.split(' ').filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase()
  return foto
    ? <span className={`${className} com-foto`} {...resto}><img src={foto} alt="" /></span>
    : <span className={className} {...resto}>{iniciais}</span>
}

// Recorta a imagem no centro (quadrado), reduz para 256 px e devolve um JPEG pequeno (data URL).
// O tamanho final fica abaixo de ~45 mil caracteres para caber numa célula da planilha.
export function prepararFoto(arquivo) {
  return new Promise((ok, falha) => {
    if (!arquivo || !arquivo.type.startsWith('image/')) return falha(new Error('Escolha um arquivo de imagem (JPG ou PNG).'))
    const url = URL.createObjectURL(arquivo)
    const img = new Image()
    img.onload = () => {
      const lado = Math.min(img.width, img.height)
      let tam = 256
      let saida = ''
      for (let tentativa = 0; tentativa < 6; tentativa++) {
        const c = document.createElement('canvas')
        c.width = c.height = tam
        const g = c.getContext('2d')
        g.fillStyle = '#fff'
        g.fillRect(0, 0, tam, tam)
        g.drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, tam, tam)
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
