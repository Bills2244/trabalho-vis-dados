# Redesign crítico de visualizações

Trabalho de Visualização de Dados: crítica e redesign de três gráficos do Makeover Monday, "UFO Sightings over Time" (2026 W25), "Songs with Cowbell" (2026 W40) e "What are the world’s deadliest animals?" (2026 W37), feitos com D3.js e DuckDB-wasm.

## Como executar

O projeto precisa rodar em um servidor local, abrir o index.html direto no navegador não carrega os dados.

Dentro da pasta do projeto, rode:

```bash
npx serve .
```

No PowerShell do Windows, se aparecer erro de "execução de scripts foi desabilitada", use:

```powershell
npx.cmd serve .
```

ou

```bash
python -m http.server 8000
```

Também dá pra usar a extensão Live Server do VS Code.

Depois é só abrir o endereço que aparecer no terminal. Precisa de internet, porque as bibliotecas vêm de CDN.

## Arquivos

- `index.html`: página principal
- `RELATORIO.md` e `RELATORIO.pdf`: relatório do trabalho
- `app.js`: carrega os casos e chama os gráficos
- `db.js`: inicia o DuckDB e funções para carregar CSV e fazer consultas
- `tooltip.js`: tooltip usado nos gráficos
- `casos/ufo.js`, `casos/cowbell.js` e `casos/animals.js`: carregam e limpam os dados de cada caso no DuckDB
- `redesigns/ufo-a.js`: série temporal por mês
- `redesigns/ufo-b.js`: heatmap por dia da semana e hora do dia
- `redesigns/cowbell-a.js`: um quadrado por música dos artistas com 4 ou mais
- `redesigns/cowbell-b.js`: histograma de músicas por artista
- `redesigns/animals-a.js`: barras com escala logarítmica de todos os animais
- `redesigns/animals-b.js`: waffle com a porcentagem das mortes por tipo de animal
- `img/`: imagens dos gráficos originais
- `data/ufo_dataset.csv`: dados do NUFORC (Kaggle)
- `data/cowbell.csv`: lista de músicas com cowbell (convertida do xlsx do Makeover Monday)
- `data/animals.csv`: mortes causadas por animais por ano (Our World in Data)
