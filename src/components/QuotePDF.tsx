import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Create styles — using Helvetica (built-in) for maximum compatibility
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#1e293b'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 40,
        paddingBottom: 20,
        borderBottomWidth: 3,
        borderBottomColor: '#14b8a6', // Default brand color, will be overridden
        borderBottomStyle: 'solid'
    },
    logoContainer: {
        maxWidth: 200,
    },
    logoImage: {
        maxHeight: 60,
        maxWidth: 200,
    },
    logoText: {
        fontSize: 24,
        fontWeight: 700,
        color: '#0f172a'
    },
    docInfo: {
        textAlign: 'right',
        color: '#64748b',
        fontSize: 10
    },
    docTitle: {
        color: '#1e293b',
        fontSize: 14,
        fontWeight: 700,
        marginBottom: 4
    },
    section: {
        marginBottom: 24
    },
    sectionTitle: {
        fontSize: 10,
        textTransform: 'uppercase',
        color: '#64748b',
        fontWeight: 600,
        marginBottom: 8
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16
    },
    infoBox: {
        width: '48%',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16
    },
    infoLabel: {
        fontSize: 9,
        color: '#94a3b8',
        marginBottom: 2
    },
    infoValue: {
        fontWeight: 600,
        fontSize: 11
    },
    infoSubValue: {
        fontSize: 9,
        color: '#64748b',
        marginTop: 2
    },
    table: {
        width: '100%',
        marginTop: 8
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        padding: '8 12',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    tableHeaderCell: {
        fontSize: 9,
        textTransform: 'uppercase',
        color: '#64748b',
        fontWeight: 600
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        padding: '10 12'
    },
    tableCell: {
        fontSize: 10
    },
    col1: { width: '40%' },
    col2: { width: '20%', textAlign: 'center' },
    col3: { width: '10%', textAlign: 'center' },
    col4: { width: '15%', textAlign: 'right' },
    col5: { width: '15%', textAlign: 'right', fontWeight: 600 },
    totalRow: {
        flexDirection: 'row',
        backgroundColor: '#f0fdfa', // Light brand color, will override in component
        padding: '12 12',
    },
    totalLabel: {
        width: '85%',
        textAlign: 'right',
        fontWeight: 700,
        fontSize: 11,
        color: '#0f766e' // Brand color, override in component
    },
    totalValue: {
        width: '15%',
        textAlign: 'right',
        fontWeight: 700,
        fontSize: 12,
        color: '#0f766e' // Brand color, override in component
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        color: '#94a3b8',
        fontSize: 9,
        textAlign: 'center'
    },
    brandFooter: {
        marginBottom: 8,
        color: '#64748b',
        textAlign: 'center',
        fontSize: 8,
    }
});

interface QuoteData {
    eventName: string
    eventId: string
    clientName: string
    clientEmail: string
    startDate: string
    endDate: string
    location: string
    packingList: Array<{
        name: string
        category: string
        quantity: number
        dailyPrice: number
    }>
    tenant: any
}

// Create Document Component
export const QuoteDocument = ({ data }: { data: QuoteData }) => {
    const brandColor = data.tenant?.brand_primary_color || '#14b8a6';
    const logoUrl = data.tenant?.brand_logo_url;
    const companyName = data.tenant?.name || 'ServicePro';
    const customFooter = data.tenant?.brand_document_footer;

    const totalDays = Math.max(
        1,
        Math.ceil(
            (new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24)
        )
    )

    const grandTotal = data.packingList.reduce((acc, item) => {
        return acc + item.quantity * item.dailyPrice * totalDays
    }, 0)

    const today = new Date().toLocaleDateString('it-IT')

    // Lighten color for background (very simplistic, ideally full hex parsing)
    const lightBrandColor = brandColor + '15'; // 15 = roughly 8% opacity in hex

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={[styles.header, { borderBottomColor: brandColor }]}>
                    <View style={styles.logoContainer}>
                        {logoUrl ? (
                            <Image style={styles.logoImage} src={logoUrl} />
                        ) : (
                            <Text style={styles.logoText}>{companyName}</Text>
                        )}
                    </View>
                    <View style={styles.docInfo}>
                        <Text style={styles.docTitle}>PREVENTIVO</Text>
                        <Text>Rif: {data.eventId.split('-')[0].toUpperCase()}</Text>
                        <Text>Data: {today}</Text>
                        <Text>Giorni noleggio: {totalDays}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.infoGrid}>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>Evento</Text>
                            <Text style={styles.infoValue}>{data.eventName}</Text>
                        </View>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>Cliente</Text>
                            <Text style={styles.infoValue}>{data.clientName}</Text>
                            <Text style={styles.infoSubValue}>{data.clientEmail}</Text>
                        </View>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>Periodo</Text>
                            <Text style={styles.infoValue}>
                                {new Date(data.startDate).toLocaleDateString('it-IT')} - {new Date(data.endDate).toLocaleDateString('it-IT')}
                            </Text>
                        </View>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>Location</Text>
                            <Text style={styles.infoValue}>{data.location || 'Da definire'}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dettaglio Attrezzatura</Text>
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderCell, styles.col1]}>Articolo</Text>
                            <Text style={[styles.tableHeaderCell, styles.col2]}>Categoria</Text>
                            <Text style={[styles.tableHeaderCell, styles.col3]}>Q.tà</Text>
                            <Text style={[styles.tableHeaderCell, styles.col4]}>Prezzo/GG</Text>
                            <Text style={[styles.tableHeaderCell, styles.col5]}>Totale</Text>
                        </View>

                        {data.packingList.map((item, idx) => {
                            const lineTotal = item.quantity * item.dailyPrice * totalDays;
                            return (
                                <View key={idx} style={styles.tableRow}>
                                    <Text style={[styles.tableCell, styles.col1]}>{item.name}</Text>
                                    <Text style={[styles.tableCell, styles.col2]}>{item.category}</Text>
                                    <Text style={[styles.tableCell, styles.col3]}>{item.quantity}</Text>
                                    <Text style={[styles.tableCell, styles.col4]}>€ {item.dailyPrice.toFixed(2)}</Text>
                                    <Text style={[styles.tableCell, styles.col5]}>€ {lineTotal.toFixed(2)}</Text>
                                </View>
                            );
                        })}

                        <View style={[styles.totalRow, { backgroundColor: lightBrandColor }]}>
                            <Text style={[styles.totalLabel, { color: brandColor }]}>TOTALE PREVENTIVO ({totalDays} {totalDays === 1 ? 'giorno' : 'giorni'})</Text>
                            <Text style={[styles.totalValue, { color: brandColor }]}>€ {grandTotal.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.footer}>
                    {customFooter && (
                        <Text style={styles.brandFooter}>{customFooter}</Text>
                    )}
                    <Text>Documento generato da {companyName} • {today}</Text>
                </View>
            </Page>
        </Document>
    );
};
