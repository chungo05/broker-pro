import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'
import type { Coverage } from '@/lib/carriers/types'

export type QuotePdfData = {
  quoteId: string
  createdAt: Date
  brand: string
  model: string
  year: number
  uso: string
  zipCode: string
  coverageLabel: string
  carrierName: string
  rating: string
  annualPremium: number
  monthlyPremium: number
  coverage: Coverage
  client?: {
    name: string
    email: string
    phone: string
    rfc: string | null
  }
}

const styles = StyleSheet.create({
  page: {
    padding: 44,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1c1917',
  },
  header: {
    backgroundColor: '#b91c1c',
    color: '#ffffff',
    padding: 14,
    marginBottom: 20,
    borderRadius: 2,
  },
  brand: { fontSize: 9, letterSpacing: 1.2, marginBottom: 4, opacity: 0.95 },
  title: { fontSize: 16, fontWeight: 'bold' },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#78716c',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: { color: '#78716c', width: '38%' },
  value: { width: '62%', fontWeight: 'bold' },
  box: {
    borderWidth: 1,
    borderColor: '#e7e5e4',
    borderRadius: 4,
    padding: 12,
    marginTop: 6,
  },
  price: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  pill: {
    backgroundColor: '#f5f5f4',
    padding: 4,
    borderRadius: 3,
    marginRight: 6,
    marginBottom: 4,
    fontSize: 8,
  },
  pills: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  disclaimer: {
    marginTop: 24,
    fontSize: 8,
    color: '#a8a29e',
    lineHeight: 1.4,
  },
})

function formatMoney(n: number) {
  return n.toLocaleString('es-MX', { minimumFractionDigits: 0 })
}

export function QuotePdfDocument({ data }: { data: QuotePdfData }) {
  const c = data.coverage
  const fecha = data.createdAt.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <Document
      title={`Cotización ${data.quoteId}`}
      author="BrokerPro"
      subject="Cotización de seguro de auto"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>GRUPO PÓLIZA CHUNG · BROKERPRO</Text>
          <Text style={styles.title}>Cotización de seguro de auto</Text>
        </View>

        <Text style={styles.sectionTitle}>Folio y fecha</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Folio</Text>
          <Text style={styles.value}>{data.quoteId}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Fecha</Text>
          <Text style={styles.value}>{fecha}</Text>
        </View>

        <Text style={styles.sectionTitle}>Vehículo</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Marca y modelo</Text>
          <Text style={styles.value}>
            {data.brand} {data.model}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Año</Text>
          <Text style={styles.value}>{String(data.year)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Uso</Text>
          <Text style={styles.value}>
            {data.uso === 'particular' ? 'Particular' : 'Comercial'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Código postal</Text>
          <Text style={styles.value}>{data.zipCode}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Cobertura</Text>
          <Text style={styles.value}>{data.coverageLabel}</Text>
        </View>

        <Text style={styles.sectionTitle}>Opción cotizada</Text>
        <View style={styles.box}>
          <View style={styles.row}>
            <Text style={styles.label}>Aseguradora</Text>
            <Text style={styles.value}>{data.carrierName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Calificación</Text>
            <Text style={styles.value}>{data.rating}</Text>
          </View>
          <Text style={styles.price}>
            ${formatMoney(data.annualPremium)} / año
          </Text>
          <Text style={{ color: '#78716c', marginTop: 2 }}>
            ≈ ${formatMoney(data.monthlyPremium)} al mes
          </Text>

          <View style={styles.pills}>
            {c.danosMaterialesDeducible ? (
              <Text style={styles.pill}>DM {c.danosMaterialesDeducible}</Text>
            ) : null}
            {c.roboTotal ? (
              <Text style={styles.pill}>RT {c.roboTotal}</Text>
            ) : null}
            {c.rcMonto ? (
              <Text style={styles.pill}>RC ${c.rcMonto}</Text>
            ) : null}
            {c.gastosMedicos ? (
              <Text style={styles.pill}>GM {c.gastosMedicos}</Text>
            ) : null}
            {c.asistenciaVial ? (
              <Text style={styles.pill}>Asistencia vial</Text>
            ) : null}
            {c.autoSustituto ? (
              <Text style={styles.pill}>Auto sustituto {c.autoSustituto}</Text>
            ) : null}
          </View>
        </View>

        {data.client ? (
          <>
            <Text style={styles.sectionTitle}>Datos del solicitante</Text>
            <View style={styles.box}>
              <View style={styles.row}>
                <Text style={styles.label}>Nombre</Text>
                <Text style={styles.value}>{data.client.name}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Correo</Text>
                <Text style={styles.value}>{data.client.email}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Teléfono</Text>
                <Text style={styles.value}>{data.client.phone}</Text>
              </View>
              {data.client.rfc ? (
                <View style={styles.row}>
                  <Text style={styles.label}>RFC</Text>
                  <Text style={styles.value}>{data.client.rfc}</Text>
                </View>
              ) : null}
            </View>
          </>
        ) : null}

        <Text style={styles.disclaimer}>
          Documento informativo. La prima y condiciones mostradas son estimadas; el contrato
          definitivo y la emisión de la póliza dependen de la aceptación de la aseguradora y de la
          verificación de datos del vehículo y del contratante.
        </Text>
      </Page>
    </Document>
  )
}
