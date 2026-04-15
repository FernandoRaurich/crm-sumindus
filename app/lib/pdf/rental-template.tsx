import React from 'react'
import {
  Document, Page, Text, View, StyleSheet, Font,
} from '@react-pdf/renderer'
import type { Quote, QuoteItem, RentalFaena } from '../types'

// ── Estilos ──────────────────────────────────────────────────────────────────

const C = {
  black:   '#000000',
  white:   '#FFFFFF',
  yellow:  '#FFD700',
  gray1:   '#333333',
  gray2:   '#666666',
  gray3:   '#999999',
  gray4:   '#CCCCCC',
  gray5:   '#F5F5F5',
  border:  '#DDDDDD',
}

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: C.black,
    paddingTop: 28,
    paddingBottom: 36,
    paddingHorizontal: 36,
  },

  // ── Header ──
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  logoBox: {
    width: 64, height: 64,
    borderRadius: 32,
    border: '3pt solid #000',
    alignItems: 'center', justifyContent: 'center',
  },
  logoTextSP:     { fontSize: 18, fontFamily: 'Helvetica-Bold', letterSpacing: 1 },
  logoTextRENTAL: { fontSize: 6,  fontFamily: 'Helvetica-Bold', letterSpacing: 4 },
  companyInfo:    { textAlign: 'right', fontSize: 7.5, lineHeight: 1.6 },
  companyName:    { fontSize: 9, fontFamily: 'Helvetica-Bold' },

  // ── Título ──
  ofertaTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    textDecoration: 'underline',
    marginBottom: 8,
  },
  disclaimer: {
    fontSize: 6.5,
    color: C.gray2,
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
  },

  // ── Datos cliente ──
  clientGrid: { flexDirection: 'row', marginBottom: 4, gap: 6 },
  clientCol:  { flex: 1 },
  clientRow:  { flexDirection: 'row', marginBottom: 3 },
  clientLabel:{ fontFamily: 'Helvetica-Bold', fontSize: 7.5, width: 60 },
  clientValue:{ fontSize: 7.5, flex: 1 },
  clientRight:{ alignItems: 'flex-end', gap: 3 },
  cotizLabel: { fontFamily: 'Helvetica-Bold', fontSize: 7.5 },
  cotizValue: { fontSize: 9, fontFamily: 'Helvetica-Bold' },

  // ── Fila SR ──
  srRow: {
    backgroundColor: C.yellow,
    padding: 4,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  srLabel: { fontFamily: 'Helvetica-Bold', fontSize: 8 },
  srValue: { fontFamily: 'Helvetica-Bold', fontSize: 8 },

  // ── Tablas ──
  tableContainer: { marginBottom: 8 },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: C.black,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  tableHeadCell: { color: C.white, fontFamily: 'Helvetica-Bold', fontSize: 7 },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  tableRowAlt: { backgroundColor: C.gray5 },

  // Anchos columnas tabla UF/CLP
  colItem:  { width: 24 },
  colDesc:  { flex: 1 },
  colDisp:  { width: 52 },
  colUM:    { width: 36 },
  colCant:  { width: 32, textAlign: 'right' },
  colPUnit: { width: 44, textAlign: 'right' },
  colTotal: { width: 44, textAlign: 'right' },

  cellText: { fontSize: 7 },
  cellRight:{ fontSize: 7, textAlign: 'right' },

  // ── Totales ──
  totalsBox: {
    alignSelf: 'flex-end',
    width: 200,
    borderWidth: 0.5,
    borderColor: C.border,
    marginBottom: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  totalRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: C.gray5,
  },
  totalLabel:     { fontSize: 7.5 },
  totalValue:     { fontSize: 7.5, fontFamily: 'Helvetica-Bold' },
  totalLabelBold: { fontSize: 8, fontFamily: 'Helvetica-Bold' },
  totalValueBold: { fontSize: 8, fontFamily: 'Helvetica-Bold' },

  // ── Notas ──
  notasRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  notasLabel: { fontFamily: 'Helvetica-Bold', fontSize: 7.5, width: 36 },
  notasText:  { fontSize: 7, flex: 1, lineHeight: 1.5, color: C.gray1 },

  // ── Requerimientos ──
  sectionTitle:  { fontFamily: 'Helvetica-Bold', fontSize: 8, marginBottom: 4, marginTop: 8 },
  subTitle:      { fontFamily: 'Helvetica-Bold', fontSize: 7.5, marginBottom: 4 },
  faenaTable:    { borderWidth: 0.5, borderColor: C.border, marginBottom: 6 },
  faenaRow:      {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    minHeight: 18,
  },
  faenaKey: {
    width: 160,
    borderRightWidth: 0.5,
    borderRightColor: C.border,
    padding: 4,
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    backgroundColor: C.gray5,
  },
  faenaVal: { flex: 1, padding: 4, fontSize: 7, color: C.gray2, fontStyle: 'italic' },
  faenaValFilled: { flex: 1, padding: 4, fontSize: 7 },

  // ── Datos bancarios ──
  bankBox: {
    borderWidth: 0.5,
    borderColor: C.border,
    padding: 6,
    marginBottom: 8,
    flexDirection: 'row',
    gap: 12,
  },
  bankTitle: { fontFamily: 'Helvetica-Bold', fontSize: 7.5, marginBottom: 3 },
  bankText:  { fontSize: 7, lineHeight: 1.6 },

  // ── Alcances ──
  alcancesBox: {
    borderWidth: 0.5,
    borderColor: C.border,
    marginBottom: 12,
  },
  alcancesTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
    backgroundColor: C.black,
    color: C.white,
    padding: 4,
  },
  alcancesRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  alcancesKey: {
    width: 140,
    borderRightWidth: 0.5,
    borderRightColor: C.border,
    padding: 4,
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    backgroundColor: C.gray5,
  },
  alcancesVal: { flex: 1, padding: 4, fontSize: 7 },

  // ── Footer ──
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 36,
    right: 36,
    borderTopWidth: 0.5,
    borderTopColor: C.border,
    paddingTop: 4,
  },
  footerText: { fontSize: 6.5, color: C.gray2, textAlign: 'center', fontStyle: 'italic' },

  // ── Condiciones (páginas 2-5) ──
  condPage:   { paddingTop: 28, paddingBottom: 36, paddingHorizontal: 40, fontSize: 7.5 },
  condTitle:  { fontFamily: 'Helvetica-Bold', fontSize: 11, textAlign: 'center', textDecoration: 'underline', marginBottom: 10 },
  condSub:    { fontFamily: 'Helvetica-Bold', fontSize: 8, marginTop: 10, marginBottom: 4, textDecoration: 'underline' },
  condText:   { lineHeight: 1.6, marginBottom: 4, textAlign: 'justify', color: C.gray1 },
  condBold:   { fontFamily: 'Helvetica-Bold' },
  condSignBox:{ marginTop: 40, borderTopWidth: 0.5, borderTopColor: C.black, width: 200 },
  condSignLbl:{ fontSize: 7.5, marginTop: 4 },
  condSignSub:{ fontSize: 7, fontStyle: 'italic', color: C.gray2 },
})

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 0) {
  return n.toLocaleString('es-CL', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function fmtDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ── Componentes internos ──────────────────────────────────────────────────────

function PageFooter() {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>
        Esta cotización refleja oferta al momento de su emisión y puede variar en el tiempo.
      </Text>
    </View>
  )
}

function SpRentalLogo() {
  return (
    <View style={s.logoBox}>
      <Text style={s.logoTextSP}>SP</Text>
      <Text style={s.logoTextRENTAL}>RENTAL</Text>
    </View>
  )
}

interface ItemsTableProps {
  items: QuoteItem[]
  currency: 'UF' | 'CLP'
}

function ItemsTable({ items, currency }: ItemsTableProps) {
  const filtered = items.filter(i => i.currency === currency)
  if (filtered.length === 0) return null

  const subtotal   = filtered.reduce((s, i) => s + i.quantity * i.unit_price, 0)
  const decimals   = currency === 'UF' ? 2 : 0
  const unitLabel  = currency === 'UF' ? 'P. UNIT\n(UF)' : 'P. UNIT\n(CLP)'
  const totalLabel = currency === 'UF' ? 'TOTAL\n(UF)' : 'TOTAL\n(CLP)'

  return (
    <View style={s.tableContainer}>
      {/* Encabezado */}
      <View style={s.tableHead}>
        <Text style={[s.tableHeadCell, s.colItem]}>ITEM</Text>
        <Text style={[s.tableHeadCell, s.colDesc]}>DESCRIPCIÓN</Text>
        <Text style={[s.tableHeadCell, s.colDisp]}>DISP.</Text>
        <Text style={[s.tableHeadCell, s.colUM]}>UM</Text>
        <Text style={[s.tableHeadCell, s.colCant]}>CANT.</Text>
        <Text style={[s.tableHeadCell, s.colPUnit]}>{unitLabel}</Text>
        <Text style={[s.tableHeadCell, s.colTotal]}>{totalLabel}</Text>
      </View>

      {/* Filas */}
      {filtered.map((item, idx) => (
        <View key={item.id} style={[s.tableRow, idx % 2 === 1 ? s.tableRowAlt : {}]}>
          <Text style={[s.cellText, s.colItem]}>{item.item_order}</Text>
          <Text style={[s.cellText, s.colDesc]}>{item.description}</Text>
          <Text style={[s.cellText, s.colDisp]}>{item.availability}</Text>
          <Text style={[s.cellText, s.colUM]}>{item.unit ?? ''}</Text>
          <Text style={[s.cellRight, s.colCant]}>{fmt(item.quantity, item.quantity % 1 !== 0 ? 1 : 0)}</Text>
          <Text style={[s.cellRight, s.colPUnit]}>{fmt(item.unit_price, decimals)}</Text>
          <Text style={[s.cellRight, s.colTotal]}>{fmt(item.quantity * item.unit_price, decimals)}</Text>
        </View>
      ))}

      {/* Totales inline — se calculan desde items, discount del quote se aplica más abajo */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 2 }}>
        <View style={s.totalsBox}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Sub Total</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 7.5 }}>$</Text>
              <Text style={s.totalValue}>{fmt(subtotal, decimals)}</Text>
            </View>
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Descuento %</Text>
            <Text style={s.totalValue}></Text>
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>IVA (19%)</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 7.5 }}>$</Text>
              <Text style={s.totalValue}>{fmt(subtotal * 0.19, decimals)}</Text>
            </View>
          </View>
          <View style={s.totalRowLast}>
            <Text style={s.totalLabelBold}>{currency === 'UF' ? 'Total UF' : 'Total CLP'}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold' }}>$</Text>
              <Text style={s.totalValueBold}>{fmt(subtotal * 1.19, decimals)}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

function FaenaRow({ label, value, example }: { label: string; value?: string | null; example?: string }) {
  const filled = value && value.trim() !== ''
  return (
    <View style={s.faenaRow}>
      <Text style={s.faenaKey}>{label}</Text>
      <Text style={filled ? s.faenaValFilled : s.faenaVal}>
        {filled ? value : (example ? `( Ej: ${example} )` : '')}
      </Text>
    </View>
  )
}

// ── Páginas de condiciones ────────────────────────────────────────────────────

function CondicionesPages() {
  return (
    <>
      {/* Página 2 */}
      <Page size="Letter" style={s.condPage}>
        <Text style={s.ofertaTitle}>OFERTA DE ARRIENDO</Text>
        <Text style={s.disclaimer}>Esta cotización refleja oferta al momento de su emisión y puede variar en el tiempo.</Text>

        <Text style={s.condTitle}>CONDICIONES COMERCIALES GENERALES DE ARRIENDO DE MAQUINARIA</Text>
        <Text style={s.condText}>
          Las presentes Condiciones Comerciales Generales regulan en forma íntegra, obligatoria e irrevocable el arriendo de maquinaria efectuado por{' '}
          <Text style={s.condBold}>SP RENTAL / SYP INGENIERÍA Y CONSTRUCCIÓN SpA</Text>, en adelante el{' '}
          <Text style={s.condBold}>ARRENDADOR</Text>, a favor del cliente individualizado en la cotización aceptada, en adelante el{' '}
          <Text style={s.condBold}>ARRENDATARIO</Text>. Estas condiciones serán plenamente aplicables a todo arriendo pactado en modalidad diaria o mensual, y se entenderán incorporadas de pleno derecho al contrato por el solo hecho de la aceptación de la cotización, emisión de orden de compra, firma del presente documento, recepción del equipo o inicio de su utilización, sin que sea necesaria declaración adicional alguna.
        </Text>

        <Text style={s.condSub}>I. TARIFAS Y MODALIDADES DE ARRIENDO</Text>
        <Text style={s.condText}>
          El arriendo de los equipos podrá pactarse en modalidad diaria o mensual, según se indique expresamente en la cotización aceptada. Cada modalidad constituye una obligación mínima de pago, independiente del uso efectivo del equipo, continuidad operativa, condiciones climáticas, paralizaciones de faena, reprogramaciones, falta de personal, permisos, accesos o cualquier otra causa no imputable directa y exclusivamente al ARRENDADOR. El arriendo mensual contempla como base mínima obligatoria{' '}
          <Text style={s.condBold}>8 horas diarias</Text> y{' '}
          <Text style={s.condBold}>180 horas mensuales</Text>, salvo estipulación expresa en contrario, las cuales serán facturadas íntegramente aun cuando el equipo no sea utilizado total o parcialmente, no existiendo derecho a devolución, descuento, compensación ni prorrateo por devolución anticipada, término unilateral o menor uso. El arriendo diario o semanal considera jornadas mínimas obligatorias conforme a la cotización, las que se devengarán en su totalidad desde el momento en que el equipo quede a disposición del ARRENDATARIO en faena. Las horas mínimas no utilizadas no serán acumulables ni imputables a períodos posteriores, reconociendo expresamente el ARRENDATARIO que el arriendo corresponde a un servicio de{' '}
          <Text style={s.condBold}>disponibilidad del equipo</Text> y no a un servicio condicionado a producción, rendimiento, continuidad operativa o resultados específicos.
        </Text>

        <Text style={s.condSub}>II. EQUIPOS DISPONIBLES</Text>
        <Text style={s.condText}>
          Las presentes condiciones resultan plenamente aplicables a todos los equipos de la flota del ARRENDADOR destinados a arriendo, incluyendo, entre otros, los siguientes:{'\n'}
          • Excavadoras hidráulicas CAT – Tier 4{'\n'}
          • Retroexcavadoras CAT – Tier 4{'\n'}
          • Minicargador frontal CAT{'\n'}
          • Miniexcavadora CAT{'\n'}
          • Tracto camión <Text style={s.condBold}>International LT 625</Text>{'\n'}
          • Camión <Text style={s.condBold}>Volkswagen Constellation</Text>{'\n'}
          • Tracto camión con <Text style={s.condBold}>batea de 20 m³</Text>{'\n'}
          {'\n'}La enumeración anterior es meramente referencial y no excluye otros equipos que el ARRENDADOR incorpore a su flota y que sean objeto de cotización y arriendo bajo las presentes condiciones.
        </Text>

        <Text style={s.condSub}>III. CONDICIÓN, ENTREGA Y RECEPCIÓN DEL EQUIPO</Text>
        <Text style={s.condText}>
          Los equipos se entregan en condiciones operativas normales, revisados y con mantenciones vigentes conforme a las recomendaciones del fabricante, con el equipamiento estándar básico, a no ser que el ARRENDATARIO solicite kit específico el cual modifica el costo de arriendo, y póliza de seguro vigente cuando así se indique en la cotización. El ARRENDATARIO declara conocer la naturaleza, estado, características técnicas y limitaciones del equipo, aceptándolo a su entera y total conformidad, reconociendo que se trata de maquinaria de trabajo que puede presentar desgaste estético y marcas propias del uso normal, lo que no constituirá falla ni dará derecho a reclamo alguno. La entrega se entenderá efectuada desde el momento en que el equipo quede a disposición del ARRENDATARIO en la faena o punto acordado, iniciándose desde ese instante el cómputo del arriendo y traspasándose íntegramente al ARRENDATARIO la custodia, riesgo y responsabilidad del equipo. La permanencia del equipo en faena o su utilización efectiva implicará recepción conforme, definitiva e irrevocable, renunciando el ARRENDATARIO a formular reclamos posteriores por estado, idoneidad, rendimiento, capacidad o adecuación del equipo a la obra o faena específica. El ARRENDATARIO deberá firmar un checklist o acta de entrega y recepción al momento de la puesta a disposición del equipo, dejando constancia de su estado operativo. La firma de dicho documento implicará aceptación plena de las condiciones mecánicas, estructurales y estéticas del equipo, no admitiéndose reclamos posteriores por aspectos que pudieron ser advertidos al momento de la recepción.
        </Text>

        <Text style={s.condSub}>IV. ALCANCE DEL ARRIENDO – INCLUYE</Text>
        <Text style={s.condText}>
          El arriendo incluye única y exclusivamente la disponibilidad y uso del equipo dentro de las horas mínimas y modalidad contratada, las mantenciones preventivas propias del equipo derivadas del desgaste normal conforme a las recomendaciones del fabricante y la cobertura de seguro de daños propios y a terceros en los términos, límites, deducibles y exclusiones establecidos en la póliza vigente. En ningún caso se entenderán incluidas cargas de combustible, servicios, prestaciones, insumos, asistencias, configuraciones especiales o cualquier otro concepto que no se encuentre expresamente indicado en la cotización aceptada.
        </Text>
        <PageFooter />
      </Page>

      {/* Página 3 */}
      <Page size="Letter" style={s.condPage}>
        <Text style={s.ofertaTitle}>OFERTA DE ARRIENDO</Text>
        <Text style={s.disclaimer}>Esta cotización refleja oferta al momento de su emisión y puede variar en el tiempo.</Text>

        <Text style={s.condSub}>V. EXCLUSIONES DEL ARRIENDO – NO INCLUYE</Text>
        <Text style={s.condText}>
          El arriendo no incluye, bajo ninguna circunstancia y sin derecho a reclamo, combustible, lubricantes, insumos, permisos, escoltas, autorizaciones especiales, deducibles de seguro, primas, recargos ni costos no cubiertos por la póliza vigente, así como tampoco reparaciones, mantenciones o intervenciones derivadas de mala operación, negligencia, uso indebido, sobrecarga, golpes, vuelcos, falta de mantenimiento diario, intervención de terceros no autorizados o utilización del equipo fuera de las especificaciones del fabricante. Se excluyen expresamente los elementos de desgaste natural tales como neumáticos, tren de rodado, orugas, cadenas, cuchillas, dientes, filtros, mangueras, correas y similares, así como las reparaciones de neumáticos por pinchazos, cortes o reventones, y cualquier sistema, accesorio, implementación o configuración especial que no se encuentre detallada de forma expresa en la cotización, entendiéndose que todo concepto no señalado explícitamente se encuentra excluido. Incluirá Operados sólo de ser solicitado expresamente por ARRENDATARIO, lo cual modificará la tarifa de arriendo. Los servicios de traslado o flete, cuando sean contratados, se regirán por el capítulo VI de las presentes condiciones.
        </Text>

        <Text style={s.condSub}>VI. TRASLADOS Y SERVICIOS DE FLETE</Text>
        <Text style={s.condText}>
          Cuando el traslado de equipos, maquinaria o cualquier otra carga sea realizado por el ARRENDADOR mediante camiones propios o subcontratados, dicho servicio se entenderá como una prestación adicional y se regirá por las siguientes condiciones especiales. El servicio contempla un máximo de dos horas para carga y dos horas para descarga por cada evento, entendiéndose que cualquier tiempo adicional generado por causas no imputables directa y exclusivamente al ARRENDADOR será considerado sobretiempo y facturado conforme a la tarifa vigente por cada hora o fracción adicional. En caso de que la unidad llegue al punto indicado por el ARRENDATARIO y no pueda efectuarse la carga o descarga por causas ajenas al ARRENDADOR, tales como falta de personal, ausencia de documentación legal exigida, condiciones inseguras, accesos inhabilitados, incumplimientos normativos u otras circunstancias atribuibles al ARRENDATARIO o a terceros bajo su responsabilidad, se cobrará el cincuenta por ciento del valor total del flete pactado, debiendo reprogramarse el servicio de acuerdo con la disponibilidad operativa del ARRENDADOR. Será de exclusiva responsabilidad del ARRENDATARIO proporcionar al conductor, previo al inicio del traslado, la guía de despacho y/o factura que ampare legalmente la carga transportada, facultando al ARRENDADOR para no iniciar o suspender el servicio en caso de incumplimiento, sin que ello genere derecho a indemnización, compensación o reclamo alguno. La carga no podrá exceder el peso máximo autorizado por el fabricante del camión ni los límites establecidos por la normativa de transporte vigente, siendo facultad exclusiva del ARRENDADOR aceptar o rechazar el servicio cuando la carga no cumpla con las condiciones técnicas de estiba segura, normativa vial, sanitaria o ambiental aplicable, o represente riesgo para personas, bienes o infraestructura, decisión que no dará derecho a reclamo alguno. El ARRENDADOR se compromete a ejecutar los traslados en el menor tiempo posible conforme a su programación logística, reconociéndose expresamente que los tiempos de traslado estarán sujetos a condiciones climáticas, estado de rutas, fiscalizaciones, restricciones viales, accidentes, fuerza mayor u otras variables externas o exógenas, no constituyendo obligación de resultado sino de medios, y no dando derecho a multas, descuentos ni compensaciones por eventuales retrasos. El ARRENDATARIO declara bajo la firma de este documento que la carga entregada corresponde a bienes lícitos, de su propiedad o legítima tenencia, cuyo transporte se ajusta íntegramente a la legislación vigente en la República de Chile, quedando estrictamente prohibido el transporte de sustancias ilícitas reguladas por la Ley 20.000, armas o explosivos sin autorización conforme a la Ley 17.798, especies protegidas o fauna regulada por el Servicio Agrícola y Ganadero, residuos peligrosos regulados por el Decreto Supremo N° 148, bienes de origen ilícito o cualquier otra carga cuya circulación contravenga normativa penal, sanitaria, ambiental o aduanera vigente, obligándose el ARRENDATARIO a mantener completamente indemne al ARRENDADOR frente a cualquier multa, sanción, incautación, daño, perjuicio o responsabilidad civil, contractual o penal derivada del contenido transportado, facultando expresamente al ARRENDADOR para suspender el servicio y poner los antecedentes a disposición de la autoridad competente en caso de detectarse irregularidades.
        </Text>

        <Text style={s.condSub}>VII. MANTENCIONES CONSUMIBLES Y REPARACIONES</Text>
        <Text style={s.condText}>
          La mantención preventiva mayor y programada del equipo conforme a las recomendaciones del fabricante será de responsabilidad del ARRENDADOR. No obstante, la mantención diaria y operativa del equipo será de exclusiva responsabilidad del ARRENDATARIO, incluyendo, sin que la enumeración sea taxativa, engrase general, revisión y reposición de niveles de fluidos, control de presión e inflado de neumáticos, reposición de agua destilada en baterías, inspección de fugas, revisión de luces y señalización, limpieza básica e inspección general antes, durante y después de la jornada de trabajo. El ARRENDATARIO será responsable de todos los consumibles asociados a la operación del equipo, incluyendo combustibles, lubricantes, grasas, filtros de reemplazo por operación, aditivos, líquidos refrigerantes, baterías por desgaste operacional y cualquier otro insumo necesario para su funcionamiento continuo. El desgaste de neumáticos y tren de rodado se entenderá considerado dentro de parámetros normales de operación mensual. Todo desgaste excesivo, daño prematuro, cortes, impactos, patinaje indebido, trabajo en superficies inadecuadas o utilización fuera de las condiciones técnicas recomendadas por el fabricante será de cargo exclusivo del ARRENDATARIO, quien deberá asumir el costo total de reposición o reparación según determine el ARRENDADOR. El ARRENDATARIO deberá impedir que terceros no autorizados intervengan mecánicamente el equipo. Cualquier reparación, modificación o intervención realizada sin autorización previa y escrita del ARRENDADOR será de exclusiva responsabilidad
        </Text>
        <PageFooter />
      </Page>

      {/* Página 4 */}
      <Page size="Letter" style={s.condPage}>
        <Text style={s.ofertaTitle}>OFERTA DE ARRIENDO</Text>
        <Text style={s.disclaimer}>Esta cotización refleja oferta al momento de su emisión y puede variar en el tiempo.</Text>

        <Text style={s.condText}>
          del ARRENDATARIO, quien asumirá íntegramente los perjuicios derivados de dicha intervención. Todo costo de reparación por deficiencias mecánicas, daños, descomposturas o fallas derivadas de mala operación, descuido, negligencia o uso indebido, aun cuando estos se manifiesten con ocasión de caso fortuito o fuerza mayor, será de cargo del ARRENDATARIO cuando tales daños no sean cubiertos por la póliza de seguro. El monto de dichas reparaciones será determinado técnicamente por el ARRENDADOR en base a informe de servicio técnico y valorización correspondiente. Si el equipo quedare fuera de servicio por causas imputables al ARRENDATARIO, la renta de arrendamiento continuará devengándose íntegramente durante todo el período de reparación.
        </Text>

        <Text style={s.condSub}>VIII. RESPONSABILIDADES Y SINIESTROS</Text>
        <Text style={s.condText}>
          Durante todo el período de arriendo, el equipo permanecerá bajo la exclusiva custodia, responsabilidad y riesgo del ARRENDATARIO, quien responderá íntegramente por todo daño, pérdida, deterioro o siniestro que afecte al equipo, cualquiera sea su causa u origen, incluyendo, a título meramente enunciativo, accidentes, golpes, volcamiento, incendio, robo, hurto, vandalismo, fallas operacionales, errores de operación o hechos fortuitos. En caso de siniestro total o parcial, el arriendo se mantendrá plenamente vigente, continuándose el cobro íntegro de la renta pactada mientras el equipo se encuentre fuera de servicio, en reparación o pendiente de reposición, sin derecho a suspensión, descuento, rebaja ni compensación alguna. El ARRENDATARIO asumirá la totalidad de los costos no cubiertos por el seguro, incluidos deducibles, primas, recargos, daños indirectos, pérdidas consecuenciales y cualquier otro perjuicio económico asociado, así como toda responsabilidad civil, contractual o extracontractual frente a terceros derivada del uso del equipo, liberando expresa y completamente al ARRENDADOR de toda reclamación presente o futura.
        </Text>

        <Text style={s.condSub}>IX. REEMPLAZO DE EQUIPOS</Text>
        <Text style={s.condText}>
          En caso de falla mecánica no imputable al ARRENDATARIO, el ARRENDADOR gestionará el reemplazo del equipo por otro de similares características en el menor plazo posible, considerando disponibilidad de flota, ubicación geográfica de la obra y condiciones logísticas existentes. El reemplazo no implicará reconocimiento de responsabilidad ni dará derecho a indemnización por detenciones de faena, pérdida de productividad o lucro cesante. Si la falla mecánica fuese atribuible a mala operación, negligencia o incumplimiento de las obligaciones del ARRENDATARIO, el costo total de reparación y cualquier gasto asociado, incluyendo traslados técnicos y tiempos de inactividad, será de cargo exclusivo del ARRENDATARIO, lo cual será determinado mediante informe técnico de diagnóstico emitido por el servicio autorizado.
        </Text>

        <Text style={s.condSub}>X. FACTURACIÓN Y PAGOS</Text>
        <Text style={s.condText}>
          Todos los valores indicados en la cotización son netos y no incluyen impuesto al valor agregado, el cual será recargado conforme a la normativa vigente al momento de la facturación. La facturación se realizará conforme a la modalidad contratada y será plenamente exigible desde la fecha de emisión de la respectiva factura o estado de pago. El no pago total y oportuno de cualquier suma adeudada facultará al ARRENDADOR, sin necesidad de aviso previo ni intervención judicial, para suspender el servicio, retirar el equipo de faena, poner término anticipado al arriendo y exigir el pago inmediato de todas las sumas adeudadas, incluyendo intereses, reajustes, gastos de cobranza y cualquier otro cargo asociado, autorizando expresamente el ARRENDATARIO al ARRENDADOR para informar la mora o incumplimiento a registros comerciales, sistemas de información crediticia y bancos de datos públicos o privados, sin que ello genere derecho a indemnización o reclamo alguno.
        </Text>

        <Text style={s.condSub}>XI. TÉRMINO ANTICIPADO DEL ARRIENDO</Text>
        <Text style={s.condText}>
          El arriendo se mantendrá vigente por el plazo indicado en la cotización aceptada. Vencido dicho plazo, y en ausencia de aviso escrito del ARRENDATARIO con al menos diez días corridos de anticipación, el arriendo se entenderá prorrogado automáticamente bajo las mismas condiciones comerciales vigentes. La devolución anticipada del equipo no liberará al ARRENDATARIO del pago íntegro del período mínimo contratado ni de las obligaciones económicas pendientes. En caso de término unilateral anticipado por parte del ARRENDATARIO, este deberá pagar todas las rentas devengadas hasta la fecha efectiva de restitución del equipo y cualquier otro cargo pendiente conforme al contrato.
        </Text>

        <Text style={s.condSub}>XII. CONSIDERACIONES GENERALES</Text>
        <Text style={s.condText}>
          Los equipos se arriendan sujetos a disponibilidad, no existiendo obligación alguna por parte del ARRENDADOR de garantizar continuidad, reemplazo inmediato ni provisión de equipos equivalentes en caso de término, retiro, falla o siniestro. El ARRENDATARIO deberá restituir el equipo en las mismas condiciones mecánicas y estructurales en que fue entregado, salvo el desgaste normal por uso, siendo de su exclusivo cargo cualquier daño, reparación, limpieza, ajuste o intervención necesaria para su correcta devolución. Todo requerimiento adicional, modificación de condiciones, extensión de plazos o servicios extraordinarios deberá ser previamente cotizado y aprobado por escrito por el ARRENDADOR. En general, y sin excepciones, todo concepto, servicio, responsabilidad o costo que no se encuentre expresamente incluido en la cotización y en las presentes condiciones se entenderá excluido, renunciando el ARRENDATARIO a formular reclamos fundados en usos, prácticas de mercado, acuerdos verbales, interpretaciones extensivas o supuestos implícitos.
        </Text>

        <Text style={s.condSub}>XIII. DECLARACIÓN FINAL</Text>
        <PageFooter />
      </Page>

      {/* Página 5 */}
      <Page size="Letter" style={s.condPage}>
        <Text style={s.ofertaTitle}>OFERTA DE ARRIENDO</Text>
        <Text style={s.disclaimer}>Esta cotización refleja oferta al momento de su emisión y puede variar en el tiempo.</Text>

        <Text style={s.condText}>
          El ARRENDATARIO declara haber leído, comprendido y aceptado íntegramente las presentes Condiciones Comerciales Generales, reconociendo que estas forman parte integrante del arriendo contratado y obligándose a su estricto, total y oportuno cumplimiento en todos sus términos.
        </Text>

        <View style={{ marginTop: 40 }}>
          <View style={s.condSignBox}>
            <Text style={s.condSignLbl}>Firma y Timbre ARRENDATARIO</Text>
            <Text style={s.condSignSub}>(Todas las hojas)</Text>
          </View>
        </View>
        <PageFooter />
      </Page>
    </>
  )
}

// ── Documento principal ───────────────────────────────────────────────────────

export interface RentalPdfProps {
  quote: Quote & {
    company: { name: string; rut: string | null; address: string | null; email?: string | null; phone?: string | null }
    contact: { full_name: string; email: string | null; phone: string | null } | null
  }
  items: QuoteItem[]
  faena: RentalFaena | null
}

export function RentalQuotePdf({ quote, items, faena }: RentalPdfProps) {
  const ufItems  = items.filter(i => i.currency === 'UF')
  const clpItems = items.filter(i => i.currency === 'CLP')

  const hasUF  = ufItems.length > 0
  const hasCLP = clpItems.length > 0

  return (
    <Document title={`Cotización ${quote.quote_number}`} author="SP RENTAL">
      {/* ── PÁGINA 1: Cotización ── */}
      <Page size="Letter" style={s.page}>

        {/* Header */}
        <View style={s.headerRow}>
          <SpRentalLogo />
          <View style={s.companyInfo}>
            <Text style={s.companyName}>SP RENTAL</Text>
            <Text>RUT: 77.437.583-k</Text>
            <Text>Campos de deportes 780 – Ñuñoa</Text>
            <Text>+56 9 39107419</Text>
            <Text>RL: SERGIO ASPE, PAOLO ALARCÓN</Text>
          </View>
        </View>

        {/* Título */}
        <Text style={s.ofertaTitle}>OFERTA DE ARRIENDO</Text>
        <Text style={s.disclaimer}>
          Esta cotización refleja oferta al momento de su emisión y puede variar en el tiempo.
        </Text>

        {/* Datos cliente */}
        <View style={s.clientGrid}>
          {/* Columna izquierda */}
          <View style={s.clientCol}>
            <View style={s.clientRow}>
              <Text style={s.clientLabel}>Empresa:</Text>
              <Text style={s.clientValue}>{quote.company.name}</Text>
            </View>
            <View style={s.clientRow}>
              <Text style={s.clientLabel}>RUT:</Text>
              <Text style={s.clientValue}>{quote.company.rut ?? '—'}</Text>
            </View>
            <View style={s.clientRow}>
              <Text style={s.clientLabel}>Email:</Text>
              <Text style={s.clientValue}>{quote.contact?.email ?? quote.company.email ?? '—'}</Text>
            </View>
            <View style={s.clientRow}>
              <Text style={s.clientLabel}>Dirección:</Text>
              <Text style={s.clientValue}>{quote.company.address ?? '—'}</Text>
            </View>
            <View style={s.clientRow}>
              <Text style={s.clientLabel}>Teléfono:</Text>
              <Text style={s.clientValue}>{quote.contact?.phone ?? quote.company.phone ?? '—'}</Text>
            </View>
          </View>
          {/* Columna derecha */}
          <View style={s.clientRight}>
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'baseline' }}>
              <Text style={s.cotizLabel}>COTIZACIÓN:</Text>
              <Text style={s.cotizValue}>{quote.quote_number}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'baseline' }}>
              <Text style={s.cotizLabel}>FECHA:</Text>
              <Text style={s.cotizValue}>{fmtDate(quote.quote_date)}</Text>
            </View>
          </View>
        </View>

        {/* Fila SR */}
        <View style={s.srRow}>
          <Text style={s.srLabel}>SR.</Text>
          <Text style={s.srValue}>{quote.contact?.full_name?.toUpperCase() ?? '—'}</Text>
        </View>

        {/* Tabla UF */}
        {hasUF && <ItemsTable items={items} currency="UF" />}

        {/* Tabla CLP con notas */}
        {hasCLP && (
          <View>
            {quote.notes && (
              <View style={s.notasRow}>
                <Text style={s.notasLabel}>NOTAS:</Text>
                <Text style={s.notasText}>{quote.notes}</Text>
              </View>
            )}
            <ItemsTable items={items} currency="CLP" />
          </View>
        )}

        {/* Requerimientos de Faena */}
        <Text style={s.sectionTitle}>REQUERIMIENTOS DE FAENA</Text>

        <Text style={s.subTitle}>1. Uso de la Maquinaria</Text>
        <View style={s.faenaTable}>
          <FaenaRow label="Lugar" value={faena?.lugar_faena} example="El Teniente, Collahuasi, Chuquicamata, etc.." />
          <FaenaRow label="Uso específico que se le dará en faena" value={faena?.uso_especifico} example="Excavación de zanja, Alimentación de chancadoras, Traslado de material, etc.." />
          <FaenaRow label="Plazos de ejecución de proyecto o contrato" value={faena?.plazo_ejecucion} example="5 meses" />
        </View>

        <Text style={s.subTitle}>2. Equipamiento de Máquinas</Text>
        <View style={s.faenaTable}>
          <FaenaRow label="Estándar minero requerido para ingreso a faena" value={faena?.estandar_minero} example="Estándar básico, Estándar avanzado, etc.." />
          <FaenaRow label="Equipamiento adicional" value={faena?.equipamiento_add} example="Alarmas, luces, supresión de incendios, señaléticas, etc.." />
        </View>

        <Text style={s.subTitle}>3. Mantenciones Correctivas</Text>
        <View style={s.faenaTable}>
          <FaenaRow label="Responsable" value={faena?.responsable_mant} example="SP Rental, Mandante" />
          <FaenaRow label="Se realiza en faena" value={faena?.realiza_en_faena} example="Si, No, No aplica" />
          <FaenaRow label="Kit de repuestos" value={faena?.kit_repuestos} example="Si, No, No aplica" />
          <FaenaRow label="Plazos de retiro ante desperfecto" value={faena?.plazo_retiro} example="2 días, No aplica" />
        </View>

        <Text style={{ fontSize: 7, color: C.gray1, marginBottom: 4, fontStyle: 'italic' }}>
          <Text style={{ fontFamily: 'Helvetica-Bold', fontStyle: 'normal' }}>3. Mantenciones Preventivas{'\n'}</Text>
          Para mantenciones programadas (cada 500 horas), SP Rental entrega el kit de repuestos correspondiente y ofrece realizar la mantención directamente en terreno, siempre que las condiciones de la faena lo permitan.{'\n\n'}
          <Text style={{ fontFamily: 'Helvetica-Bold', fontStyle: 'normal' }}>NOTA:</Text> Se da por enterado que las mantenciones preventivas diarias (sopleteo de filtro y engrase) son responsabilidad del mandante, conforme a la pauta entregada por Operaciones SP Rental para cada máquina.
        </Text>

        {/* Datos bancarios */}
        <View style={s.bankBox}>
          <View>
            <Text style={s.bankTitle}>DATOS BANCARIOS</Text>
            <Text style={s.bankText}>SYP INGENIERÍA Y CONSTRUCCIÓN SPA</Text>
            <Text style={s.bankText}>77.437.583-K</Text>
          </View>
          <View>
            <Text style={s.bankText}>Banco de Chile</Text>
            <Text style={s.bankText}>Cuenta Corriente</Text>
            <Text style={s.bankText}>1450808504</Text>
          </View>
        </View>

        {/* Alcances */}
        <View style={s.alcancesBox}>
          <Text style={s.alcancesTitle}>ALCANCES</Text>
          <View style={s.alcancesRow}>
            <Text style={s.alcancesKey}>CONDICIONES COMERCIALES</Text>
            <Text style={s.alcancesVal}>{quote.payment_conditions ?? '—'}</Text>
          </View>
          <View style={s.alcancesRow}>
            <Text style={s.alcancesKey}>PLAZO DE ENTREGA</Text>
            <Text style={s.alcancesVal}>{quote.delivery_time ?? '—'}</Text>
          </View>
          <View style={s.alcancesRow}>
            <Text style={s.alcancesKey}>GARANTÍA</Text>
            <Text style={s.alcancesVal}>{quote.warranty ?? '—'}</Text>
          </View>
          <View style={s.alcancesRow}>
            <Text style={s.alcancesKey}>DESPACHO</Text>
            <Text style={s.alcancesVal}>{quote.dispatch ?? '—'}</Text>
          </View>
          <View style={[s.alcancesRow, { borderBottomWidth: 0 }]}>
            <Text style={s.alcancesKey}>CONTACTO</Text>
            <Text style={s.alcancesVal}>{quote.contact_scope ?? '—'}</Text>
          </View>
        </View>

        <PageFooter />
      </Page>

      {/* Páginas de condiciones */}
      <CondicionesPages />
    </Document>
  )
}
