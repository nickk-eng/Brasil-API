const campoAno = document.getElementById('ano')
const tabela = document.getElementById('tabelaFeriados')
const mensagem = document.getElementById('mensagem')
const total = document.getElementById('total')
const proximo = document.getElementById('proximo')
const botao = document.getElementById('btnConsultar')
const diasDaSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
campoAno.value = new Date().getFullYear()

// UTC aqui serve apenas para contar dias do calendário, sem efeitos do horário de verão.
function diaDoCalendario(data) {
    return Date.UTC(data.getFullYear(), data.getMonth(), data.getDate())
}
function mostrarProximo(feriados) {
    const hoje = diaDoCalendario(new Date())
    const futuro = feriados.find(item => diaDoCalendario(new Date(item.date + 'T12:00:00')) >= hoje)
    if (!futuro) {
        proximo.textContent = 'Não há mais feriados a partir de hoje no ano consultado.'
        return
    }
    const data = new Date(futuro.date + 'T12:00:00')
    const dias = Math.round((diaDoCalendario(data) - hoje) / 86400000)
    const prazo = dias === 0 ? 'É hoje!' : `Faltam ${dias} ${dias === 1 ? 'dia' : 'dias'}.`
    proximo.textContent = `Próximo feriado no ano consultado: ${futuro.name} — ${data.toLocaleDateString('pt-BR')}. ${prazo}`
}
function consultarFeriados() {
    const ano = campoAno.value.trim()
    tabela.replaceChildren()
    total.textContent = ''
    proximo.textContent = ''
    mensagem.className = ''
    if (!/^\d{4}$/.test(ano)) {
        mensagem.className = 'erro'
        mensagem.textContent = 'Digite um ano válido com quatro dígitos.'
        return
    }
    botao.disabled = true
    campoAno.disabled = true
    mensagem.textContent = 'Consultando feriados…'
    return fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`)
        .then(response => {
            if (!response.ok) throw new Error(`Não foi possível consultar o ano ${ano}. Verifique o ano e tente novamente.`)
            return response.json()
        })
        .then(feriados => {
            if (!Array.isArray(feriados)) throw new Error('A API retornou uma resposta inesperada.')
            feriados.sort((a, b) => a.date.localeCompare(b.date))
            total.textContent = `Total de feriados em ${ano}: ${feriados.length}`
            feriados.forEach(feriado => {
                const data = new Date(feriado.date + 'T12:00:00')
                const dia = data.getDay()
                const linha = document.createElement('tr')
                if (dia === 0 || dia === 6) linha.classList.add('fim-de-semana')
                const valores = [data.toLocaleDateString('pt-BR'), diasDaSemana[dia], feriado.name]
                valores.forEach(valor => {
                    const celula = document.createElement('td')
                    celula.textContent = valor
                    linha.appendChild(celula)
                })
                tabela.appendChild(linha)
            })
            mostrarProximo(feriados)
            mensagem.textContent = feriados.length ? '' : 'Nenhum feriado encontrado.'
        })
        .catch(erro => {
            tabela.replaceChildren()
            total.textContent = ''
            proximo.textContent = ''
            mensagem.className = 'erro'
            mensagem.textContent = erro instanceof TypeError
                ? 'Não foi possível acessar a BrasilAPI. Verifique sua conexão e tente novamente.'
                : erro.message
        })
        .finally(() => {
            botao.disabled = false
            campoAno.disabled = false
        })
}
document.getElementById('btnConsultar').addEventListener('click', consultarFeriados)
campoAno.addEventListener('keydown', evento => {
    if (evento.key === 'Enter') consultarFeriados()
})
consultarFeriados()
