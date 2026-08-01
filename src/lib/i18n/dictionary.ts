import type { Locale } from './locales'

/**
 * DICCIONARIO
 *
 * El español es la fuente de verdad. `pt` está tipado como `Record<DictKey, string>`,
 * así que el compilador exige que exista TODA clave en portugués: ningún texto de
 * la interfaz puede quedar en un solo idioma sin que falle `tsc`.
 */

const es = {
  // ─────────────────────────────────────────────────────────────── estructura
  'skip.toContent': 'Saltar al contenido',
  'brand.role': 'Componentes para PC',
  'brand.place': 'Ciudad del Este · Paraguay',

  'nav.catalog': 'Catálogo',
  'nav.build': 'Arma tu PC',
  'nav.guides': 'Guías',
  'nav.cart': 'Carrito',
  'nav.openMenu': 'Abrir menú',
  'nav.closeMenu': 'Cerrar menú',
  'nav.openCart': 'Abrir carrito',
  'nav.closeCart': 'Cerrar carrito',
  'nav.menu': 'Menú',

  'lang.label': 'Idioma',
  'currency.label': 'Moneda',
  'currency.reference': 'referencial',
  'currency.note':
    'Guaraníes y reales son una conversión referencial a tasa fija; la operación se cierra en dólares.',

  // ────────────────────────────────────────────────────────────────── acciones
  'cta.catalog': 'Ver catálogo',
  'cta.build': 'Arma tu PC',
  'cta.add': 'Agregar al carrito',
  'cta.added': 'Agregado',
  'cta.view': 'Ver',
  'cta.viewAll': 'Ver todo el catálogo',
  'cta.whatsapp': 'Consultar por WhatsApp',
  'cta.backToStore': 'Volver a la tienda',
  'cta.reviewCart': 'Revisar el carrito',
  'cta.restart': 'Empezar de nuevo',
  'cta.continue': 'Continuar',
  'cta.back': 'Atrás',
  'cta.close': 'Cerrar',
  'cta.undo': 'Deshacer',

  // ────────────────────────────────────────────────────────────────────── home
  'home.hero.eyebrow': 'Ciudad del Este · Paraguay',
  'home.hero.title1': 'Cada pieza',
  'home.hero.title2': 'con su ficha',
  'home.hero.title3': 'delante.',
  'home.hero.lede':
    'Importamos componentes para armar, mejorar y personalizar computadoras. Publicamos zócalo, vataje y milímetros antes que el precio, para que sepas si la pieza entra antes de preguntar cuánto cuesta.',
  'home.hero.figureAlt':
    'Render técnico de una tarjeta gráfica de tres ventiladores con sus cotas de longitud y altura anotadas.',

  'home.manifest.pieces': 'Piezas en catálogo',
  'home.manifest.categories': 'Categorías',
  'home.manifest.currencies': 'Monedas',
  'home.manifest.check': 'Compatibilidad',
  'home.manifest.checkValue': 'Verificada',

  'home.categories.eyebrow': 'Índice',
  'home.categories.title': 'Qué decide cada pieza',
  'home.categories.lede':
    'Un armado se rompe siempre en el mismo sitio: una pieza que no entra en otra. Éste es el orden en que conviene decidir.',
  'home.categories.count': 'piezas',

  'home.featured.eyebrow': 'Selección',
  'home.featured.title': 'Lo que estamos moviendo',
  'home.featured.lede':
    'Las piezas con más salida del mes, con su ficha completa y su código de referencia.',

  'home.builder.eyebrow': 'Herramienta',
  'home.builder.title': 'Arma tu PC y verificá que todo entre',
  'home.builder.lede':
    'Elegí procesador, placa, memoria, video, fuente, refrigeración y gabinete. El configurador compara zócalos, generación de memoria, vataje y milímetros, y te avisa en castellano llano qué no encaja.',
  'home.builder.cta': 'Abrir el configurador',

  'home.guides.eyebrow': 'Cómo se elige',
  'home.guides.title': 'Cuatro decisiones que definen el armado',
  'home.guides.lede':
    'No es una lista de recomendaciones. Es el orden real en que una pieza condiciona a la siguiente.',

  'home.benefits.eyebrow': 'Cómo trabajamos',
  'home.benefits.title': 'Lo que sí podemos afirmar',
  'home.benefit1.title': 'Ficha técnica completa en cada pieza',
  'home.benefit1.body':
    'Zócalo, generación de memoria, consumo, fuente recomendada y longitud en milímetros. Verificados contra la ficha del fabricante antes de publicarlos.',
  'home.benefit2.title': 'Compatibilidad comprobable antes de comprar',
  'home.benefit2.body':
    'El configurador compara las piezas entre sí y explica el problema en lenguaje llano. Son comprobaciones fundamentales, no una validación exhaustiva.',
  'home.benefit3.title': 'Precio en tres monedas y atención en dos idiomas',
  'home.benefit3.body':
    'Dólar como referencia de la operación, guaraní y real convertidos a tasa fija para comparar del otro lado de la frontera. Español y portugués.',
  'home.benefit4.title': 'La consulta se cierra por WhatsApp',
  'home.benefit4.body':
    'El carrito arma el mensaje con los modelos, las cantidades y los totales. No hay formularios ni cuentas que crear.',


  // ───────────────────────────────────────────────────────────── ensamblaje
  'assembly.eyebrow': 'RTX 5090 · Ensamblaje interactivo',
  'assembly.title': 'Mirá cómo nace una RTX 5090.',
  'assembly.lede':
    'La escena mantiene la pantalla mientras cada módulo encuentra su lugar. Cuando la Founders Edition queda completa, la página vuelve a liberarte el recorrido.',
  'assembly.note':
    'Representación 3D aproximada construida desde una sola vista visible; sirve para mostrar arquitectura, movimiento y montaje, no geometría de fabricación.',
  'assembly.part1': 'Chasis, backplate y PCB',
  'assembly.part2': 'Dos módulos térmicos',
  'assembly.part3': 'Aletas diagonales de flujo',
  'assembly.part4': 'Ventiladores de doble paso',
  'assembly.part5': 'Marco de aluminio en X',
  'assembly.part6': 'Puente, puertos y energía',
  'assembly.part7': 'Contactos e identidad luminosa',
  'assembly.hint': 'Seguí bajando para ensamblar',
  'assembly.hint.complete': 'Ensamblaje completo · ya podés continuar',
  'assembly.stage.chassis': '01 · Activando chasis',
  'assembly.stage.thermal': '02 · Acoplando refrigeración',
  'assembly.stage.frame': '03 · Cerrando marco estructural',
  'assembly.stage.details': '04 · Instalando conexiones',
  'assembly.stage.power': '05 · Sistema listo',

  // ─────────────────────────────────────────────────────────────────── catálogo
  'catalog.title': 'Catálogo',
  'catalog.eyebrow': 'Manifiesto de piezas',
  'catalog.lede':
    'Todo el inventario, con su ficha y su código. Filtrá por lo que de verdad decide: categoría, marca, precio y disponibilidad.',
  'catalog.search': 'Buscar por modelo, marca o código',
  'catalog.searchLabel': 'Buscar en el catálogo',
  'catalog.results': 'piezas',
  'catalog.result': 'pieza',
  'catalog.filters': 'Filtros',
  'catalog.openFilters': 'Filtrar y ordenar',
  'catalog.applyFilters': 'Ver resultados',
  'catalog.reset': 'Restablecer filtros',
  'catalog.category': 'Categoría',
  'catalog.brand': 'Marca',
  'catalog.price': 'Precio máximo',
  'catalog.availability': 'Disponibilidad',
  'catalog.onlyAvailable': 'Solo lo que está en depósito',
  'catalog.sort': 'Ordenar',
  'catalog.sort.relevance': 'Sugerido',
  'catalog.sort.priceAsc': 'Precio: de menor a mayor',
  'catalog.sort.priceDesc': 'Precio: de mayor a menor',
  'catalog.sort.name': 'Nombre A–Z',
  'catalog.empty.title': 'Ninguna pieza coincide',
  'catalog.empty.body':
    'Probá con menos filtros, o buscá por el código de referencia si lo tenés a mano.',
  'catalog.all': 'Todas',
  'catalog.activeFilters': 'Filtros activos',

  // ────────────────────────────────────────────────────────────────── producto
  'product.ref': 'Referencia',
  'product.specs': 'Ficha técnica',
  'product.compat': 'Qué condiciona esta pieza',
  'product.related': 'De la misma categoría',
  'product.qty': 'Cantidad',
  'product.decrease': 'Quitar una unidad',
  'product.increase': 'Sumar una unidad',
  'product.gallery.front': 'Vista frontal',
  'product.gallery.annotated': 'Vista con cotas',
  'product.gallery.hint': 'Pasá el puntero para ver las cotas',
  'product.priceNote':
    'Precio y disponibilidad son datos de esta tienda, no información oficial del fabricante.',
  'product.specsNote':
    'Especificaciones verificadas contra la ficha del fabricante. Los datos comerciales son nuestros.',
  'product.availability.disponible': 'En depósito',
  'product.availability.ultimas-unidades': 'Últimas unidades',
  'product.availability.agotado': 'Sin stock',
  'product.units': 'unidades',
  'product.unit': 'unidad',
  'product.tag.new': 'Llegada reciente',
  'product.tag.off': 'menos',
  'product.was': 'antes',
  'product.notFound': 'Esa pieza no está en el catálogo',
  'product.notFoundBody': 'Puede que haya cambiado de código. Buscala en el catálogo completo.',
  'product.addedToCart': 'agregado al carrito',
  'product.soldOut': 'Sin stock — consultá por WhatsApp',

  // ────────────────────────────────────────────────────────────── configurador
  'build.title': 'Arma tu PC',
  'build.eyebrow': 'Tablero de compatibilidad',
  'build.lede':
    'Elegí una pieza por ranura. A medida que elegís, el tablero compara zócalos, generación de memoria, vataje y milímetros.',
  'build.slot.cpu': 'Procesador',
  'build.slot.motherboard': 'Placa madre',
  'build.slot.ram': 'Memoria RAM',
  'build.slot.gpu': 'Tarjeta gráfica',
  'build.slot.storage': 'Almacenamiento',
  'build.slot.psu': 'Fuente',
  'build.slot.cooling': 'Refrigeración',
  'build.slot.case': 'Gabinete',
  'build.choose': 'Elegir',
  'build.change': 'Cambiar',
  'build.clearSlot': 'Quitar',
  'build.empty': 'Sin elegir',
  'build.status.vacio': 'Elegí la primera pieza',
  'build.status.ok': 'Todo lo comprobado encaja',
  'build.status.aviso': 'Hay algo que conviene revisar',
  'build.status.bloqueo': 'Hay piezas que no encajan',
  'build.issues': 'Advertencias',
  'build.noIssues': 'Sin advertencias por ahora.',
  'build.draw': 'Consumo estimado',
  'build.suggestedPsu': 'Fuente sugerida',
  'build.total': 'Total del armado',
  'build.addAll': 'Agregar el armado al carrito',
  'build.reset': 'Vaciar el armado',
  'build.disclaimer':
    'Estas son comprobaciones fundamentales, no una validación exhaustiva de todas las combinaciones posibles. No verificamos perfiles de memoria validados por la placa, altura de los disipadores de la RAM ni versiones de BIOS.',
  'build.pickTitle': 'Elegir',
  'build.pickEmpty': 'No hay piezas de esta categoría en el catálogo.',
  'build.addedAll': 'Armado agregado al carrito',
  'build.level.bloqueo': 'No encaja',
  'build.level.aviso': 'Revisar',
  'build.level.nota': 'Nota',

  // ─────────────────────────────────────────────────────────────────── carrito
  'cart.title': 'Carrito',
  'cart.empty.title': 'El carrito está vacío',
  'cart.empty.body': 'Empezá por el catálogo, o armá el equipo completo en el configurador.',
  'cart.subtotal': 'Subtotal',
  'cart.shipping': 'Envío',
  'cart.shipping.free': 'Bonificado',
  'cart.shipping.toFree': 'Te faltan {amount} para el envío bonificado',
  'cart.shipping.qualified': 'Envío bonificado aplicado',
  'cart.total': 'Total',
  'cart.remove': 'Quitar',
  'cart.removed': 'quitado del carrito',
  'cart.clear': 'Vaciar el carrito',
  'cart.cleared': 'Carrito vaciado',
  'cart.checkout': 'Finalizar compra',
  'cart.continue': 'Seguir comprando',
  'cart.lines': 'artículos',
  'cart.line': 'artículo',
  'cart.loading': 'Cargando el carrito',

  // ────────────────────────────────────────────────────────────────── checkout
  'checkout.title': 'Finalizar compra',
  'checkout.step': 'Paso',
  'checkout.of': 'de',
  'checkout.step1': 'Resumen del pedido',
  'checkout.step2': 'Entrega y pago',
  'checkout.step3': 'Confirmación',
  'checkout.step1.lede': 'Revisá que estén las piezas correctas antes de seguir.',
  'checkout.step2.lede':
    'Elegí cómo querés recibirlo y con qué método vas a pagar. No pedimos ningún dato de tarjeta.',
  'checkout.step3.lede': 'Este es el resumen final. Al confirmar se cierra el pedido.',
  'checkout.delivery': 'Entrega',
  'checkout.delivery.pickup': 'Retiro en Ciudad del Este',
  'checkout.delivery.pickup.note': 'Coordinamos el punto y el horario por WhatsApp.',
  'checkout.delivery.national': 'Envío dentro de Paraguay',
  'checkout.delivery.national.note': 'Encomienda a la terminal o dirección que indiques.',
  'checkout.delivery.border': 'Entrega en zona de frontera',
  'checkout.delivery.border.note': 'Para compradores que cruzan desde Foz do Iguaçu.',
  'checkout.payment': 'Método de pago',
  'checkout.payment.transfer': 'Transferencia bancaria',
  'checkout.payment.transfer.note': 'Se coordinan los datos por WhatsApp al confirmar.',
  'checkout.payment.cash': 'Efectivo al retirar',
  'checkout.payment.cash.note': 'Dólares o guaraníes en el punto de entrega.',
  'checkout.payment.card': 'Tarjeta en el local',
  'checkout.payment.card.note': 'La tarjeta se pasa presencialmente. Acá no pedimos números.',
  'checkout.noDataNote':
    'No pedimos número de tarjeta, documento ni dirección en esta pantalla. Nada de lo que elegís acá sale de tu navegador.',
  'checkout.orderSummary': 'Resumen',
  'checkout.finalize': 'Procesar pago',
  'checkout.processing': 'Procesando',
  'checkout.emptyTitle': 'No hay nada para finalizar',
  'checkout.emptyBody': 'Agregá al menos una pieza al carrito para continuar.',

  // La única aparición pública del carácter demostrativo del proyecto.
  'reveal.title': 'Alto ahí',
  'reveal.message':
    'Esta es una experiencia demostrativa. No se procesó ningún pago ni se almacenaron datos.',
  'reveal.detail':
    'Sky Import es una pieza de portafolio: el catálogo, los precios y la disponibilidad son datos de ejemplo. En ningún momento se solicitaron ni se enviaron datos de pago, y tu carrito sigue intacto.',
  'reveal.backToStore': 'Volver a la tienda',
  'reveal.reviewCart': 'Revisar el carrito',
  'reveal.restart': 'Empezar de nuevo',

  // ────────────────────────────────────────────────────────────────────── guías
  'guides.title': 'Guías',
  'guides.eyebrow': 'Cómo se elige',
  'guides.lede':
    'Cuatro decisiones, en el orden en que una condiciona a la siguiente. Sin recomendaciones de modelo: criterios.',
  'guides.read': 'Leer',
  'guides.back': 'Volver a las guías',
  'guides.notFound': 'Esa guía no existe',

  // ───────────────────────────────────────────────────────────────────── varios
  'footer.rights': 'Todos los derechos reservados.',
  'footer.explore': 'Tienda',
  'footer.help': 'Cómo elegir',
  'footer.contact': 'Contacto',
  'footer.legal': 'Precios y disponibilidad',
  'footer.legalNote':
    'Los precios están expresados en dólares estadounidenses. Las conversiones a guaraníes y reales son referenciales, a tasa fija, y no constituyen una cotización. La disponibilidad puede cambiar sin aviso.',
  'footer.whatsapp': 'Escribinos',

  'notFound.title': 'Esta dirección no existe',
  'notFound.body': 'Puede que la pieza haya cambiado de código o que el enlace esté cortado.',
  'error.title': 'Algo se cortó de este lado',
  'error.body': 'Recargá la página. Si vuelve a pasar, escribinos y lo miramos.',
  'error.retry': 'Reintentar',

  'intro.skip': 'Omitir',
  'intro.label': 'Sky Import — animación de entrada',

  'wa.productMessage': 'Hola, quiero consultar por',
  'wa.cartIntro': 'Hola, quiero consultar por este pedido:',
  'wa.cartTotal': 'Total',
  'wa.generic': 'Hola, quiero hacer una consulta sobre componentes.',
} as const

export type DictKey = keyof typeof es

const pt: Record<DictKey, string> = {
  'skip.toContent': 'Pular para o conteúdo',
  'brand.role': 'Componentes para PC',
  'brand.place': 'Ciudad del Este · Paraguai',

  'nav.catalog': 'Catálogo',
  'nav.build': 'Monte seu PC',
  'nav.guides': 'Guias',
  'nav.cart': 'Carrinho',
  'nav.openMenu': 'Abrir menu',
  'nav.closeMenu': 'Fechar menu',
  'nav.openCart': 'Abrir carrinho',
  'nav.closeCart': 'Fechar carrinho',
  'nav.menu': 'Menu',

  'lang.label': 'Idioma',
  'currency.label': 'Moeda',
  'currency.reference': 'referencial',
  'currency.note':
    'Guaranis e reais são uma conversão referencial a taxa fixa; a operação é fechada em dólares.',

  'cta.catalog': 'Ver catálogo',
  'cta.build': 'Monte seu PC',
  'cta.add': 'Adicionar ao carrinho',
  'cta.added': 'Adicionado',
  'cta.view': 'Ver',
  'cta.viewAll': 'Ver todo o catálogo',
  'cta.whatsapp': 'Falar no WhatsApp',
  'cta.backToStore': 'Voltar à loja',
  'cta.reviewCart': 'Revisar o carrinho',
  'cta.restart': 'Começar de novo',
  'cta.continue': 'Continuar',
  'cta.back': 'Voltar',
  'cta.close': 'Fechar',
  'cta.undo': 'Desfazer',

  'home.hero.eyebrow': 'Ciudad del Este · Paraguai',
  'home.hero.title1': 'Cada peça',
  'home.hero.title2': 'com a ficha',
  'home.hero.title3': 'na frente.',
  'home.hero.lede':
    'Importamos componentes para montar, melhorar e personalizar computadores. Publicamos soquete, potência e milímetros antes do preço, para você saber se a peça cabe antes de perguntar quanto custa.',
  'home.hero.figureAlt':
    'Render técnico de uma placa de vídeo de três ventiladores com as cotas de comprimento e altura anotadas.',

  'home.manifest.pieces': 'Peças no catálogo',
  'home.manifest.categories': 'Categorias',
  'home.manifest.currencies': 'Moedas',
  'home.manifest.check': 'Compatibilidade',
  'home.manifest.checkValue': 'Verificada',

  'home.categories.eyebrow': 'Índice',
  'home.categories.title': 'O que cada peça decide',
  'home.categories.lede':
    'Uma montagem quebra sempre no mesmo ponto: uma peça que não cabe na outra. Esta é a ordem em que convém decidir.',
  'home.categories.count': 'peças',

  'home.featured.eyebrow': 'Seleção',
  'home.featured.title': 'O que está saindo',
  'home.featured.lede':
    'As peças com mais saída no mês, com a ficha completa e o código de referência.',

  'home.builder.eyebrow': 'Ferramenta',
  'home.builder.title': 'Monte seu PC e confirme que tudo cabe',
  'home.builder.lede':
    'Escolha processador, placa, memória, vídeo, fonte, refrigeração e gabinete. O configurador compara soquetes, geração de memória, potência e milímetros, e avisa em português claro o que não encaixa.',
  'home.builder.cta': 'Abrir o configurador',

  'home.guides.eyebrow': 'Como escolher',
  'home.guides.title': 'Quatro decisões que definem a montagem',
  'home.guides.lede':
    'Não é uma lista de recomendações. É a ordem real em que uma peça condiciona a seguinte.',

  'home.benefits.eyebrow': 'Como trabalhamos',
  'home.benefits.title': 'O que podemos afirmar',
  'home.benefit1.title': 'Ficha técnica completa em cada peça',
  'home.benefit1.body':
    'Soquete, geração de memória, consumo, fonte recomendada e comprimento em milímetros. Verificados contra a ficha do fabricante antes de publicar.',
  'home.benefit2.title': 'Compatibilidade verificável antes de comprar',
  'home.benefit2.body':
    'O configurador compara as peças entre si e explica o problema em linguagem simples. São verificações fundamentais, não uma validação exaustiva.',
  'home.benefit3.title': 'Preço em três moedas e atendimento em dois idiomas',
  'home.benefit3.body':
    'Dólar como referência da operação, guarani e real convertidos a taxa fixa para comparar do outro lado da fronteira. Espanhol e português.',
  'home.benefit4.title': 'A consulta é fechada pelo WhatsApp',
  'home.benefit4.body':
    'O carrinho monta a mensagem com os modelos, as quantidades e os totais. Não há formulários nem contas para criar.',


  'assembly.eyebrow': 'RTX 5090 · Montagem interativa',
  'assembly.title': 'Veja como nasce uma RTX 5090.',
  'assembly.lede':
    'A cena mantém a tela enquanto cada módulo encontra seu lugar. Quando a Founders Edition fica completa, a página libera novamente o percurso.',
  'assembly.note':
    'Representação 3D aproximada construída a partir de uma única vista; mostra arquitetura, movimento e montagem, não geometria de fabricação.',
  'assembly.part1': 'Chassi, backplate e PCB',
  'assembly.part2': 'Dois módulos térmicos',
  'assembly.part3': 'Aletas diagonais de fluxo',
  'assembly.part4': 'Ventoinhas de fluxo duplo',
  'assembly.part5': 'Estrutura de alumínio em X',
  'assembly.part6': 'Ponte, portas e energia',
  'assembly.part7': 'Contatos e identidade luminosa',
  'assembly.hint': 'Continue rolando para montar',
  'assembly.hint.complete': 'Montagem completa · pode continuar',
  'assembly.stage.chassis': '01 · Ativando chassi',
  'assembly.stage.thermal': '02 · Acoplando refrigeração',
  'assembly.stage.frame': '03 · Fechando estrutura',
  'assembly.stage.details': '04 · Instalando conexões',
  'assembly.stage.power': '05 · Sistema pronto',

  'catalog.title': 'Catálogo',
  'catalog.eyebrow': 'Manifesto de peças',
  'catalog.lede':
    'Todo o estoque, com ficha e código. Filtre pelo que realmente decide: categoria, marca, preço e disponibilidade.',
  'catalog.search': 'Buscar por modelo, marca ou código',
  'catalog.searchLabel': 'Buscar no catálogo',
  'catalog.results': 'peças',
  'catalog.result': 'peça',
  'catalog.filters': 'Filtros',
  'catalog.openFilters': 'Filtrar e ordenar',
  'catalog.applyFilters': 'Ver resultados',
  'catalog.reset': 'Limpar filtros',
  'catalog.category': 'Categoria',
  'catalog.brand': 'Marca',
  'catalog.price': 'Preço máximo',
  'catalog.availability': 'Disponibilidade',
  'catalog.onlyAvailable': 'Somente o que está em estoque',
  'catalog.sort': 'Ordenar',
  'catalog.sort.relevance': 'Sugerido',
  'catalog.sort.priceAsc': 'Preço: do menor ao maior',
  'catalog.sort.priceDesc': 'Preço: do maior ao menor',
  'catalog.sort.name': 'Nome A–Z',
  'catalog.empty.title': 'Nenhuma peça corresponde',
  'catalog.empty.body': 'Tente com menos filtros, ou busque pelo código de referência.',
  'catalog.all': 'Todas',
  'catalog.activeFilters': 'Filtros ativos',

  'product.ref': 'Referência',
  'product.specs': 'Ficha técnica',
  'product.compat': 'O que esta peça condiciona',
  'product.related': 'Da mesma categoria',
  'product.qty': 'Quantidade',
  'product.decrease': 'Remover uma unidade',
  'product.increase': 'Somar uma unidade',
  'product.gallery.front': 'Vista frontal',
  'product.gallery.annotated': 'Vista com cotas',
  'product.gallery.hint': 'Passe o cursor para ver as cotas',
  'product.priceNote':
    'Preço e disponibilidade são dados desta loja, não informação oficial do fabricante.',
  'product.specsNote':
    'Especificações verificadas contra a ficha do fabricante. Os dados comerciais são nossos.',
  'product.availability.disponible': 'Em estoque',
  'product.availability.ultimas-unidades': 'Últimas unidades',
  'product.availability.agotado': 'Sem estoque',
  'product.units': 'unidades',
  'product.unit': 'unidade',
  'product.tag.new': 'Chegada recente',
  'product.tag.off': 'menos',
  'product.was': 'antes',
  'product.notFound': 'Essa peça não está no catálogo',
  'product.notFoundBody': 'Pode ter mudado de código. Procure no catálogo completo.',
  'product.addedToCart': 'adicionado ao carrinho',
  'product.soldOut': 'Sem estoque — fale no WhatsApp',

  'build.title': 'Monte seu PC',
  'build.eyebrow': 'Painel de compatibilidade',
  'build.lede':
    'Escolha uma peça por slot. Conforme você escolhe, o painel compara soquetes, geração de memória, potência e milímetros.',
  'build.slot.cpu': 'Processador',
  'build.slot.motherboard': 'Placa-mãe',
  'build.slot.ram': 'Memória RAM',
  'build.slot.gpu': 'Placa de vídeo',
  'build.slot.storage': 'Armazenamento',
  'build.slot.psu': 'Fonte',
  'build.slot.cooling': 'Refrigeração',
  'build.slot.case': 'Gabinete',
  'build.choose': 'Escolher',
  'build.change': 'Trocar',
  'build.clearSlot': 'Remover',
  'build.empty': 'Sem escolha',
  'build.status.vacio': 'Escolha a primeira peça',
  'build.status.ok': 'Tudo o que foi verificado encaixa',
  'build.status.aviso': 'Há algo para revisar',
  'build.status.bloqueo': 'Há peças que não encaixam',
  'build.issues': 'Avisos',
  'build.noIssues': 'Sem avisos por enquanto.',
  'build.draw': 'Consumo estimado',
  'build.suggestedPsu': 'Fonte sugerida',
  'build.total': 'Total da montagem',
  'build.addAll': 'Adicionar a montagem ao carrinho',
  'build.reset': 'Limpar a montagem',
  'build.disclaimer':
    'São verificações fundamentais, não uma validação exaustiva de todas as combinações possíveis. Não verificamos perfis de memória validados pela placa, altura dos dissipadores da RAM nem versões de BIOS.',
  'build.pickTitle': 'Escolher',
  'build.pickEmpty': 'Não há peças desta categoria no catálogo.',
  'build.addedAll': 'Montagem adicionada ao carrinho',
  'build.level.bloqueo': 'Não encaixa',
  'build.level.aviso': 'Revisar',
  'build.level.nota': 'Nota',

  'cart.title': 'Carrinho',
  'cart.empty.title': 'O carrinho está vazio',
  'cart.empty.body': 'Comece pelo catálogo, ou monte o equipamento completo no configurador.',
  'cart.subtotal': 'Subtotal',
  'cart.shipping': 'Envio',
  'cart.shipping.free': 'Cortesia',
  'cart.shipping.toFree': 'Faltam {amount} para o envio cortesia',
  'cart.shipping.qualified': 'Envio cortesia aplicado',
  'cart.total': 'Total',
  'cart.remove': 'Remover',
  'cart.removed': 'removido do carrinho',
  'cart.clear': 'Esvaziar o carrinho',
  'cart.cleared': 'Carrinho esvaziado',
  'cart.checkout': 'Finalizar compra',
  'cart.continue': 'Continuar comprando',
  'cart.lines': 'itens',
  'cart.line': 'item',
  'cart.loading': 'Carregando o carrinho',

  'checkout.title': 'Finalizar compra',
  'checkout.step': 'Passo',
  'checkout.of': 'de',
  'checkout.step1': 'Resumo do pedido',
  'checkout.step2': 'Entrega e pagamento',
  'checkout.step3': 'Confirmação',
  'checkout.step1.lede': 'Confira se as peças estão certas antes de seguir.',
  'checkout.step2.lede':
    'Escolha como quer receber e com que método vai pagar. Não pedimos nenhum dado de cartão.',
  'checkout.step3.lede': 'Este é o resumo final. Ao confirmar, o pedido é fechado.',
  'checkout.delivery': 'Entrega',
  'checkout.delivery.pickup': 'Retirada em Ciudad del Este',
  'checkout.delivery.pickup.note': 'Combinamos o ponto e o horário pelo WhatsApp.',
  'checkout.delivery.national': 'Envio dentro do Paraguai',
  'checkout.delivery.national.note': 'Encomenda ao terminal ou endereço que você indicar.',
  'checkout.delivery.border': 'Entrega na zona de fronteira',
  'checkout.delivery.border.note': 'Para compradores que cruzam de Foz do Iguaçu.',
  'checkout.payment': 'Forma de pagamento',
  'checkout.payment.transfer': 'Transferência bancária',
  'checkout.payment.transfer.note': 'Os dados são combinados pelo WhatsApp ao confirmar.',
  'checkout.payment.cash': 'Dinheiro na retirada',
  'checkout.payment.cash.note': 'Dólares ou guaranis no ponto de entrega.',
  'checkout.payment.card': 'Cartão na loja',
  'checkout.payment.card.note': 'O cartão é passado presencialmente. Aqui não pedimos números.',
  'checkout.noDataNote':
    'Não pedimos número de cartão, documento nem endereço nesta tela. Nada do que você escolhe aqui sai do seu navegador.',
  'checkout.orderSummary': 'Resumo',
  'checkout.finalize': 'Processar pagamento',
  'checkout.processing': 'Processando',
  'checkout.emptyTitle': 'Não há nada para finalizar',
  'checkout.emptyBody': 'Adicione pelo menos uma peça ao carrinho para continuar.',

  'reveal.title': 'Um momento',
  'reveal.message':
    'Esta é uma experiência demonstrativa. Nenhum pagamento foi processado e nenhum dado foi armazenado.',
  'reveal.detail':
    'Sky Import é uma peça de portfólio: o catálogo, os preços e a disponibilidade são dados de exemplo. Em nenhum momento foram solicitados ou enviados dados de pagamento, e seu carrinho continua intacto.',
  'reveal.backToStore': 'Voltar à loja',
  'reveal.reviewCart': 'Revisar o carrinho',
  'reveal.restart': 'Começar de novo',

  'guides.title': 'Guias',
  'guides.eyebrow': 'Como escolher',
  'guides.lede':
    'Quatro decisões, na ordem em que uma condiciona a seguinte. Sem recomendações de modelo: critérios.',
  'guides.read': 'Ler',
  'guides.back': 'Voltar aos guias',
  'guides.notFound': 'Esse guia não existe',

  'footer.rights': 'Todos os direitos reservados.',
  'footer.explore': 'Loja',
  'footer.help': 'Como escolher',
  'footer.contact': 'Contato',
  'footer.legal': 'Preços e disponibilidade',
  'footer.legalNote':
    'Os preços estão expressos em dólares norte-americanos. As conversões para guaranis e reais são referenciais, a taxa fixa, e não constituem cotação. A disponibilidade pode mudar sem aviso.',
  'footer.whatsapp': 'Fale conosco',

  'notFound.title': 'Este endereço não existe',
  'notFound.body': 'Talvez a peça tenha mudado de código ou o link esteja cortado.',
  'error.title': 'Algo quebrou deste lado',
  'error.body': 'Recarregue a página. Se acontecer de novo, escreva para nós.',
  'error.retry': 'Tentar de novo',

  'intro.skip': 'Pular',
  'intro.label': 'Sky Import — animação de entrada',

  'wa.productMessage': 'Olá, quero consultar sobre',
  'wa.cartIntro': 'Olá, quero consultar sobre este pedido:',
  'wa.cartTotal': 'Total',
  'wa.generic': 'Olá, quero fazer uma consulta sobre componentes.',
}

export const DICTIONARY: Record<Locale, Record<DictKey, string>> = { es, pt }

export type Translate = (key: DictKey, vars?: Record<string, string>) => string

export function makeT(locale: Locale): Translate {
  const table = DICTIONARY[locale]
  return (key, vars) => {
    const raw = table[key]
    if (!vars) return raw
    return Object.entries(vars).reduce(
      (text, [name, value]) => text.split(`{${name}}`).join(value),
      raw,
    )
  }
}
