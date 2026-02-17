'use client'

import React from 'react'
import { Page, Text, View, Document, StyleSheet, Image, PDFDownloadLink } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { LOGO_BASE64 } from '@/lib/constants/logo'

interface ServicePDFProps {
    service: {
        numero_servicio: number
        fecha_inicio: string
        fecha_estimada_finalizacion?: string | null
        fecha_fin?: string | null
        estado: string
        total: number | null
        descripcion_inicial?: string | null
        observaciones_finales?: string | null
        evidencia_inicial?: string | null
    }
    customer: {
        nombre: string
        rut?: string | null
        telefono?: string | null
        email?: string | null
        direccion?: string | null
    }
    vehicle: {
        patente: string
        marca: string
        modelo: string
        año?: number | null
        color?: string | null
        kilometraje?: number | null
    }
    tasks: Array<{
        id: string
        descripcion: string
        costo_mano_obra: number | null
    }>
    parts: Array<{
        id: string
        nombre_repuesto: string
        cantidad: number
        precio_unitario: number
        precio_total: number
    }>
    expenses: Array<{
        id: string
        descripcion: string
        monto: number | null
    }>
}


const styles = StyleSheet.create({
    page: {
        padding: 25,
        fontFamily: 'Helvetica',
        fontSize: 9,
        color: '#27272a',
    },
    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#dc2626',
    },
    logoSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 45,
        height: 45,
        marginRight: 8,
    },
    companyInfo: {
        justifyContent: 'center',
    },
    companyName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#dc2626',
    },
    companySubtitle: {
        fontSize: 8,
        color: '#71717a',
    },
    companyContact: {
        fontSize: 7,
        color: '#a1a1aa',
        marginTop: 2,
    },
    // Orden info (derecha)
    orderInfo: {
        alignItems: 'flex-end',
    },
    orderNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#dc2626',
    },
    orderDetail: {
        fontSize: 8,
        color: '#52525b',
        marginTop: 1,
    },
    estadoBadge: {
        marginTop: 4,
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 3,
        backgroundColor: '#fef2f2',
    },
    estadoText: {
        fontSize: 7,
        fontWeight: 'bold',
        color: '#dc2626',
    },
    // Secciones
    section: {
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#dc2626',
        marginBottom: 4,
        paddingBottom: 2,
        borderBottomWidth: 1,
        borderBottomColor: '#fecaca',
    },
    // Grid de 2 columnas
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    col: {
        flex: 1,
        backgroundColor: '#fafafa',
        padding: 8,
        borderRadius: 3,
        borderWidth: 1,
        borderColor: '#f4f4f5',
    },
    colTitle: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#dc2626',
        marginBottom: 4,
    },
    fieldRow: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    label: {
        fontSize: 7,
        fontWeight: 'bold',
        color: '#71717a',
        width: 55,
    },
    value: {
        fontSize: 8,
        color: '#27272a',
        flex: 1,
    },
    // Descripcion
    descripcionBox: {
        backgroundColor: '#fffbeb',
        padding: 6,
        borderRadius: 3,
        borderLeftWidth: 3,
        borderLeftColor: '#f59e0b',
    },
    descripcionText: {
        fontSize: 8,
        color: '#27272a',
        lineHeight: 1.4,
    },
    // Evidencia
    galleryContainer: {
        flexDirection: 'row',
        gap: 4,
        marginTop: 4,
    },
    galleryImage: {
        width: 50,
        height: 50,
        objectFit: 'cover',
        borderRadius: 3,
        backgroundColor: '#f4f4f5',
    },
    // Tablas
    table: {
        width: '100%',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#18181b',
        paddingVertical: 4,
        paddingHorizontal: 6,
    },
    tableHeaderCell: {
        color: '#ffffff',
        fontSize: 7,
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 3,
        paddingHorizontal: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#f4f4f5',
    },
    tableRowStriped: {
        backgroundColor: '#fafafa',
    },
    tableCell: {
        fontSize: 8,
        color: '#27272a',
    },
    tableCellRight: {
        fontSize: 8,
        color: '#27272a',
        textAlign: 'right',
    },
    subtotalRow: {
        flexDirection: 'row',
        backgroundColor: '#fef2f2',
        paddingVertical: 3,
        paddingHorizontal: 6,
    },
    subtotalLabel: {
        fontSize: 7,
        fontWeight: 'bold',
        color: '#991b1b',
    },
    subtotalValue: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#991b1b',
        textAlign: 'right',
    },
    // Resumen y Total
    summarySection: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
        gap: 10,
    },
    summaryBox: {
        width: 120,
        backgroundColor: '#f4f4f5',
        padding: 6,
        borderRadius: 3,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    summaryLabel: {
        fontSize: 7,
        color: '#52525b',
    },
    summaryValue: {
        fontSize: 7,
        color: '#27272a',
    },
    totalBox: {
        width: 130,
        backgroundColor: '#dc2626',
        padding: 8,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    totalLabel: {
        color: '#ffffff',
        fontSize: 8,
        marginBottom: 2,
    },
    totalValue: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Firmas
    signaturesSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        paddingTop: 10,
    },
    signatureBox: {
        width: '45%',
        alignItems: 'center',
    },
    signatureLine: {
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#d4d4d8',
        marginBottom: 4,
    },
    signatureLabel: {
        fontSize: 7,
        color: '#71717a',
    },
    signatureName: {
        fontSize: 7,
        color: '#27272a',
        marginTop: 1,
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 15,
        left: 25,
        right: 25,
        borderTopWidth: 1,
        borderTopColor: '#e4e4e7',
        paddingTop: 6,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footerLeft: {
        fontSize: 6,
        color: '#a1a1aa',
    },
    footerRight: {
        fontSize: 6,
        color: '#a1a1aa',
        textAlign: 'right',
    },
    // Empty state
    emptyText: {
        fontSize: 7,
        color: '#a1a1aa',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: 6,
        backgroundColor: '#fafafa',
    },
})

const formatCurrency = (amount: number | null) => {
    if (!amount && amount !== 0) return '$0'
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
    }).format(amount)
}

const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })
}

const ServiceDocument = ({ service, customer, vehicle, tasks, parts, expenses }: ServicePDFProps) => {
    const tasksTotal = tasks.reduce((sum, t) => sum + (t.costo_mano_obra || 0), 0)
    const partsTotal = parts.reduce((sum, p) => sum + (p.precio_total || 0), 0)

    const evidenciaInicial = service.evidencia_inicial
        ? (typeof service.evidencia_inicial === 'string'
            ? JSON.parse(service.evidencia_inicial)
            : service.evidencia_inicial) as { imagenes?: string[] } | null
        : null

    // Limitar items para que quepa en una pagina
    const maxTasks = 8
    const maxParts = 6
    const displayTasks = tasks.slice(0, maxTasks)
    const displayParts = parts.slice(0, maxParts)

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoSection}>
                        <Image src={LOGO_BASE64} style={styles.logo} />
                        <View style={styles.companyInfo}>
                            <Text style={styles.companyName}>INNOVAUTOS</Text>
                            <Text style={styles.companySubtitle}>Servicio Automotriz Profesional</Text>
                            <Text style={styles.companyContact}>Concepcion, Chile | +56 9 7784 2816</Text>
                        </View>
                    </View>
                    <View style={styles.orderInfo}>
                        <Text style={styles.orderNumber}>ORDEN #{String(service.numero_servicio).padStart(4, '0')}</Text>
                        <Text style={styles.orderDetail}>Fecha: {formatDate(service.fecha_inicio)}</Text>
                        {service.fecha_estimada_finalizacion && (
                            <Text style={styles.orderDetail}>Entrega est.: {formatDate(service.fecha_estimada_finalizacion)}</Text>
                        )}
                    </View>
                </View>

                {/* Cliente y Vehiculo */}
                <View style={styles.section}>
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.colTitle}>CLIENTE</Text>
                            <View style={styles.fieldRow}>
                                <Text style={styles.label}>Nombre:</Text>
                                <Text style={styles.value}>{customer.nombre}</Text>
                            </View>
                            {customer.rut && (
                                <View style={styles.fieldRow}>
                                    <Text style={styles.label}>RUT:</Text>
                                    <Text style={styles.value}>{customer.rut}</Text>
                                </View>
                            )}
                            {customer.telefono && (
                                <View style={styles.fieldRow}>
                                    <Text style={styles.label}>Telefono:</Text>
                                    <Text style={styles.value}>{customer.telefono}</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.colTitle}>VEHICULO</Text>
                            <View style={styles.fieldRow}>
                                <Text style={styles.label}>Vehiculo:</Text>
                                <Text style={styles.value}>{vehicle.marca} {vehicle.modelo} {vehicle.año || ''}</Text>
                            </View>
                            <View style={styles.fieldRow}>
                                <Text style={styles.label}>Patente:</Text>
                                <Text style={styles.value}>{vehicle.patente}</Text>
                            </View>
                            {vehicle.color && (
                                <View style={styles.fieldRow}>
                                    <Text style={styles.label}>Color:</Text>
                                    <Text style={styles.value}>{vehicle.color}</Text>
                                </View>
                            )}
                            {vehicle.kilometraje && (
                                <View style={styles.fieldRow}>
                                    <Text style={styles.label}>Km:</Text>
                                    <Text style={styles.value}>{vehicle.kilometraje.toLocaleString('es-CL')} km</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Descripcion del Trabajo */}
                {service.descripcion_inicial && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>DESCRIPCION DEL TRABAJO</Text>
                        <View style={styles.descripcionBox}>
                            <Text style={styles.descripcionText}>
                                {service.descripcion_inicial.length > 200
                                    ? service.descripcion_inicial.substring(0, 200) + '...'
                                    : service.descripcion_inicial}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Evidencia - Solo mostrar si hay y limitar a 4 imagenes */}
                {evidenciaInicial?.imagenes && evidenciaInicial.imagenes.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>EVIDENCIA INICIAL</Text>
                        <View style={styles.galleryContainer}>
                            {evidenciaInicial.imagenes.slice(0, 4).map((img, i) => (
                                <Image key={i} src={img} style={styles.galleryImage} />
                            ))}
                        </View>
                    </View>
                )}

                {/* Tabla Mano de Obra */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>MANO DE OBRA {tasks.length > maxTasks && `(mostrando ${maxTasks} de ${tasks.length})`}</Text>
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderCell, { flex: 4 }]}>Descripcion</Text>
                            <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Costo</Text>
                        </View>
                        {displayTasks.length > 0 ? (
                            <>
                                {displayTasks.map((task, i) => (
                                    <View key={task.id} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowStriped : {}]}>
                                        <Text style={[styles.tableCell, { flex: 4 }]}>
                                            {task.descripcion.length > 50 ? task.descripcion.substring(0, 50) + '...' : task.descripcion}
                                        </Text>
                                        <Text style={[styles.tableCellRight, { flex: 1 }]}>{formatCurrency(task.costo_mano_obra)}</Text>
                                    </View>
                                ))}
                                <View style={styles.subtotalRow}>
                                    <Text style={[styles.subtotalLabel, { flex: 4, textAlign: 'right', paddingRight: 8 }]}>Subtotal Mano de Obra</Text>
                                    <Text style={[styles.subtotalValue, { flex: 1 }]}>{formatCurrency(tasksTotal)}</Text>
                                </View>
                            </>
                        ) : (
                            <Text style={styles.emptyText}>No hay tareas registradas</Text>
                        )}
                    </View>
                </View>

                {/* Tabla Repuestos */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>REPUESTOS {parts.length > maxParts && `(mostrando ${maxParts} de ${parts.length})`}</Text>
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Repuesto</Text>
                            <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>Cant.</Text>
                            <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>P.Unit</Text>
                            <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Total</Text>
                        </View>
                        {displayParts.length > 0 ? (
                            <>
                                {displayParts.map((part, i) => (
                                    <View key={part.id} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowStriped : {}]}>
                                        <Text style={[styles.tableCell, { flex: 3 }]}>
                                            {part.nombre_repuesto.length > 25 ? part.nombre_repuesto.substring(0, 25) + '...' : part.nombre_repuesto}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{part.cantidad}</Text>
                                        <Text style={[styles.tableCellRight, { flex: 1 }]}>{formatCurrency(part.precio_unitario)}</Text>
                                        <Text style={[styles.tableCellRight, { flex: 1 }]}>{formatCurrency(part.precio_total)}</Text>
                                    </View>
                                ))}
                                <View style={styles.subtotalRow}>
                                    <Text style={[styles.subtotalLabel, { flex: 5, textAlign: 'right', paddingRight: 8 }]}>Subtotal Repuestos</Text>
                                    <Text style={[styles.subtotalValue, { flex: 1 }]}>{formatCurrency(partsTotal)}</Text>
                                </View>
                            </>
                        ) : (
                            <Text style={styles.emptyText}>No hay repuestos registrados</Text>
                        )}
                    </View>
                </View>

                {/* Resumen y Total */}
                <View style={styles.summarySection}>
                    <View style={styles.totalBox}>
                        <Text style={styles.totalLabel}>TOTAL A PAGAR</Text>
                        <Text style={styles.totalValue}>{formatCurrency(tasksTotal + partsTotal)}</Text>
                    </View>
                </View>

                {/* Firmas */}
                <View style={styles.signaturesSection}>
                    <View style={styles.signatureBox}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureLabel}>Firma Cliente</Text>
                        <Text style={styles.signatureName}>{customer.nombre}</Text>
                    </View>
                    <View style={styles.signatureBox}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureLabel}>Firma Tecnico</Text>
                        <Text style={styles.signatureName}>Innovautos</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerLeft}>Innovautos - Servicio Automotriz de Calidad</Text>
                    <Text style={styles.footerRight}>
                        Generado: {new Date().toLocaleDateString('es-CL')} {new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </Page>
        </Document>
    )
}

export function ServicePDFButton(props: ServicePDFProps) {
    const [isClient, setIsClient] = React.useState(false)

    React.useEffect(() => {
        setIsClient(true)
    }, [])

    if (!isClient) {
        return (
            <Button disabled className="w-full justify-start bg-zinc-800 text-zinc-400">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cargando...
            </Button>
        )
    }

    return (
        <PDFDownloadLink
            document={<ServiceDocument {...props} />}
            fileName={`Servicio_${String(props.service.numero_servicio).padStart(4, '0')}_${props.vehicle.patente}.pdf`}
            className="w-full"
        >
            {({ loading }) => (
                <Button
                    disabled={loading}
                    className="w-full justify-start bg-red-600 hover:bg-red-700 text-white"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generando...
                        </>
                    ) : (
                        <>
                            <Download className="h-4 w-4 mr-2" />
                            Descargar PDF
                        </>
                    )}
                </Button>
            )}
        </PDFDownloadLink>
    )
}