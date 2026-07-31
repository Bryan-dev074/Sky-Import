import type { L10n } from '@/lib/i18n/locales'
import type { RenderSpec } from '@/lib/catalog/types'

const L = (es: string, pt: string): L10n => ({ es, pt })

export interface GuideSection {
  heading: L10n
  body: L10n[]
}

export interface Guide {
  slug: string
  /** Número de orden: las cuatro decisiones van en el orden en que se toman. */
  index: string
  title: L10n
  standfirst: L10n
  shape: RenderSpec['shape']
  sections: GuideSection[]
}

/**
 * Sección editorial. No es una lista de recomendaciones de modelo: es el orden
 * real en que una pieza condiciona a la siguiente. Nada de cifras de mercado ni
 * de afirmaciones que no se puedan sostener con la ficha de un fabricante.
 */
export const GUIDES: Guide[] = [
  {
    slug: 'el-zocalo-decide',
    index: '01',
    shape: 'cpu',
    title: L('El zócalo decide todo lo demás', 'O soquete decide todo o resto'),
    standfirst: L(
      'Elegir procesador no es elegir una pieza: es elegir una plataforma. Después de esa decisión, la placa madre y la generación de memoria ya están medio decididas.',
      'Escolher processador não é escolher uma peça: é escolher uma plataforma. Depois dessa decisão, a placa-mãe e a geração de memória já estão meio decididas.',
    ),
    sections: [
      {
        heading: L('Qué es el zócalo', 'O que é o soquete'),
        body: [
          L(
            'El zócalo es el conector físico donde se apoya el procesador. AM5 tiene una distribución de contactos; LGA1700 tiene otra; LGA1851 otra distinta. No son compatibles entre sí y no existe ningún adaptador: si el procesador es AM5, la placa tiene que ser AM5.',
            'O soquete é o conector físico onde o processador se apoia. AM5 tem uma distribuição de contatos; LGA1700 tem outra; LGA1851 outra diferente. Não são compatíveis entre si e não existe adaptador: se o processador é AM5, a placa precisa ser AM5.',
          ),
          L(
            'Es la primera comprobación que hace el configurador y la que más armados frena, porque es la más fácil de pasar por alto cuando dos procesadores tienen nombres parecidos.',
            'É a primeira verificação que o configurador faz e a que mais trava montagens, porque é a mais fácil de passar despercebida quando dois processadores têm nomes parecidos.',
          ),
        ],
      },
      {
        heading: L('Por qué importa más allá de hoy', 'Por que importa além de hoje'),
        body: [
          L(
            'Un zócalo vivo, con procesadores nuevos saliendo para él, permite cambiar el procesador dentro de unos años sin cambiar la placa ni la memoria. Un zócalo al final de su vida obliga a cambiar las tres piezas a la vez.',
            'Um soquete vivo, com processadores novos saindo para ele, permite trocar o processador daqui a alguns anos sem trocar a placa nem a memória. Um soquete no fim da vida obriga a trocar as três peças de uma vez.',
          ),
          L(
            'No es una razón para pagar de más: es una razón para saber qué estás comprando cuando la diferencia de precio entre dos plataformas es chica.',
            'Não é motivo para pagar a mais: é motivo para saber o que você está comprando quando a diferença de preço entre duas plataformas é pequena.',
          ),
        ],
      },
      {
        heading: L('Lo que el chipset agrega', 'O que o chipset acrescenta'),
        body: [
          L(
            'Dentro de un mismo zócalo, el chipset de la placa cambia cuántas líneas PCIe hay disponibles, cuántos puertos rápidos trae y si se puede ajustar la memoria por encima del perfil de fábrica. Un chipset más caro no hace más rápido al procesador.',
            'Dentro de um mesmo soquete, o chipset da placa muda quantas linhas PCIe existem, quantas portas rápidas traz e se dá para ajustar a memória acima do perfil de fábrica. Um chipset mais caro não deixa o processador mais rápido.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'ddr4-o-ddr5',
    index: '02',
    shape: 'ram',
    title: L('DDR4 y DDR5 no se mezclan', 'DDR4 e DDR5 não se misturam'),
    standfirst: L(
      'No es una cuestión de rendimiento ni de configuración: la muesca del módulo está en otra posición y directamente no entra en la ranura.',
      'Não é questão de desempenho nem de configuração: o entalhe do módulo está em outra posição e simplesmente não entra no slot.',
    ),
    sections: [
      {
        heading: L('Lo que decide es la placa', 'Quem decide é a placa'),
        body: [
          L(
            'Una placa madre acepta DDR4 o DDR5, nunca las dos. Algunos procesadores tienen controladores capaces de manejar las dos generaciones, pero el zócalo físico del módulo lo impone la placa. Por eso la comprobación correcta es memoria contra placa, no memoria contra procesador.',
            'Uma placa-mãe aceita DDR4 ou DDR5, nunca as duas. Alguns processadores têm controladores capazes de lidar com as duas gerações, mas o encaixe físico do módulo é imposto pela placa. Por isso a verificação correta é memória contra placa, não memória contra processador.',
          ),
        ],
      },
      {
        heading: L('Dos módulos, no cuatro', 'Dois módulos, não quatro'),
        body: [
          L(
            'Un kit de dos módulos suele alcanzar velocidades más altas de forma estable que cuatro módulos del mismo total, porque el controlador de memoria trabaja con menos carga. Además deja dos ranuras libres para ampliar después sin tirar lo comprado.',
            'Um kit de dois módulos costuma atingir velocidades mais altas de forma estável do que quatro módulos do mesmo total, porque o controlador de memória trabalha com menos carga. Além disso deixa dois slots livres para ampliar depois sem descartar o que já foi comprado.',
          ),
          L(
            'Los kits se venden emparejados por una razón: los módulos fueron probados juntos. Comprar dos kits de dos módulos no es lo mismo que comprar un kit de cuatro.',
            'Os kits são vendidos emparelhados por um motivo: os módulos foram testados juntos. Comprar dois kits de dois módulos não é a mesma coisa que comprar um kit de quatro.',
          ),
        ],
      },
      {
        heading: L('El perfil no viene activado', 'O perfil não vem ativado'),
        body: [
          L(
            'Un kit que dice 6000 MT/s arranca de fábrica más lento. La velocidad publicada se obtiene activando su perfil (EXPO o XMP según la plataforma) en la BIOS: es una casilla, pero hay que marcarla. Si nunca se marca, se pagó por una velocidad que la máquina no está usando.',
            'Um kit que diz 6000 MT/s começa de fábrica mais devagar. A velocidade publicada se obtém ativando o perfil (EXPO ou XMP conforme a plataforma) na BIOS: é uma caixa de seleção, mas alguém precisa marcá-la. Se nunca for marcada, pagou-se por uma velocidade que a máquina não está usando.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'cuanta-fuente',
    index: '03',
    shape: 'psu',
    title: L('Cuánta fuente hace falta de verdad', 'Quanta fonte é realmente necessária'),
    standfirst: L(
      'El número que publica el fabricante de la placa de video no es el consumo de la placa: es el tamaño recomendado para el sistema completo, con margen para los picos.',
      'O número publicado pelo fabricante da placa de vídeo não é o consumo da placa: é o tamanho recomendado para o sistema completo, com margem para os picos.',
    ),
    sections: [
      {
        heading: L('Dos números distintos', 'Dois números diferentes'),
        body: [
          L(
            'Una placa de video declara su propio consumo —lo que la tarjeta pide para sí— y por separado una fuente recomendada. La segunda cifra ya incluye al procesador, los discos, los ventiladores y el margen para los picos de milisegundos que una fuente justa no aguanta.',
            'Uma placa de vídeo declara o próprio consumo — o que a placa pede para si — e, separadamente, uma fonte recomendada. O segundo número já inclui o processador, os discos, os ventiladores e a margem para os picos de milissegundos que uma fonte apertada não suporta.',
          ),
          L(
            'Por eso una tarjeta de 300 W pide una fuente de 750 W y no de 400. No es exceso de precaución del fabricante: es cómo se comportan los picos de una tarjeta moderna.',
            'Por isso uma placa de 300 W pede uma fonte de 750 W e não de 400. Não é excesso de precaução do fabricante: é como se comportam os picos de uma placa moderna.',
          ),
        ],
      },
      {
        heading: L('Qué pasa si queda corta', 'O que acontece se ficar curta'),
        body: [
          L(
            'Una fuente por debajo de lo recomendado suele funcionar en el escritorio y apagar el equipo bajo carga, sin pantalla azul ni aviso. El síntoma clásico es «se me reinicia solo cuando juego». Antes de cambiar la placa de video conviene mirar la fuente.',
            'Uma fonte abaixo do recomendado costuma funcionar na área de trabalho e desligar o equipamento sob carga, sem tela azul nem aviso. O sintoma clássico é «reinicia sozinho quando jogo». Antes de trocar a placa de vídeo, vale olhar a fonte.',
          ),
        ],
      },
      {
        heading: L('Certificación y cableado', 'Certificação e cabeamento'),
        body: [
          L(
            'La certificación 80 PLUS mide eficiencia, no calidad: dice cuánta energía se pierde en calor, no cuán estable es la salida. Aun así, en la práctica una fuente Gold suele traer mejores componentes internos que una Bronze del mismo fabricante.',
            'A certificação 80 PLUS mede eficiência, não qualidade: diz quanta energia se perde em calor, não quão estável é a saída. Ainda assim, na prática uma fonte Gold costuma trazer componentes internos melhores que uma Bronze do mesmo fabricante.',
          ),
          L(
            'El cableado modular no cambia el rendimiento; cambia cuántos cables sobran adentro del gabinete y, con eso, el flujo de aire y el tiempo de armado.',
            'O cabeamento modular não muda o desempenho; muda quantos cabos sobram dentro do gabinete e, com isso, o fluxo de ar e o tempo de montagem.',
          ),
        ],
      },
    ],
  },
  {
    slug: 'los-milimetros',
    index: '04',
    shape: 'case',
    title: L('Los milímetros que arruinan un armado', 'Os milímetros que arruínam uma montagem'),
    standfirst: L(
      'La compatibilidad eléctrica se resuelve leyendo. La compatibilidad física se resuelve midiendo, y es la que hace volver una caja al local.',
      'A compatibilidade elétrica se resolve lendo. A compatibilidade física se resolve medindo, e é a que faz uma caixa voltar para a loja.',
    ),
    sections: [
      {
        heading: L('Tres medidas y nada más', 'Três medidas e nada mais'),
        body: [
          L(
            'Longitud de la placa de video, altura del disipador y longitud del radiador. Con esas tres cifras y la ficha del gabinete se evita casi todo problema físico. Las tres están publicadas por los fabricantes y las tres están en la ficha de cada pieza de este catálogo.',
            'Comprimento da placa de vídeo, altura do cooler e comprimento do radiador. Com esses três números e a ficha do gabinete evita-se quase todo problema físico. Os três são publicados pelos fabricantes e estão na ficha de cada peça deste catálogo.',
          ),
        ],
      },
      {
        heading: L('El margen no es opcional', 'A folga não é opcional'),
        body: [
          L(
            'Que una tarjeta de 360 mm entre en un gabinete de 365 mm es cierto sobre el papel. En la práctica los cables de alimentación salen del canto superior o frontal de la tarjeta y necesitan lugar para curvarse sin forzar el conector. Menos de 15 mm de margen es entrar justo.',
            'Que uma placa de 360 mm caiba num gabinete de 365 mm é verdade no papel. Na prática os cabos de energia saem da borda superior ou frontal da placa e precisam de espaço para curvar sem forçar o conector. Menos de 15 mm de folga é entrar apertado.',
          ),
        ],
      },
      {
        heading: L('El formato de la placa', 'O formato da placa'),
        body: [
          L(
            'ATX, Micro-ATX y Mini-ITX no son tamaños aproximados: son distribuciones de puntos de anclaje. Un gabinete Micro-ATX no acepta una placa ATX aunque sobre espacio, porque los tornillos no coinciden. Al revés sí: un gabinete ATX casi siempre acepta placas más chicas.',
            'ATX, Micro-ATX e Mini-ITX não são tamanhos aproximados: são distribuições de pontos de fixação. Um gabinete Micro-ATX não aceita uma placa ATX mesmo com espaço sobrando, porque os parafusos não coincidem. O contrário sim: um gabinete ATX quase sempre aceita placas menores.',
          ),
        ],
      },
    ],
  },
]

export const GUIDE_BY_SLUG: ReadonlyMap<string, Guide> = new Map(
  GUIDES.map((guide) => [guide.slug, guide]),
)
