import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  Business,
  ShoppingCart,
  PointOfSale,
  Description,
  TrendingUp,
} from '@mui/icons-material'
import reporteService from '../services/reporteService'

function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [estadisticas, setEstadisticas] = useState({
    totalEmpresas: 0,
    comprasMes: 0,
    ventasMes: 0,
    atsGenerados: 0,
    periodoActual: '',
    resumenMesActual: {
      compras: { cantidad: 0, total: 0 },
      ventas: { cantidad: 0, total: 0 }
    }
  })

  useEffect(() => {
    cargarEstadisticas()
  }, [])

  const cargarEstadisticas = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await reporteService.getEstadisticasDashboard()
      setEstadisticas(response.data)
    } catch (err) {
      console.error('Error al cargar estadísticas:', err)
      setError(err.mensaje || 'Error al cargar las estadísticas del dashboard')
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    {
      title: 'Empresas Registradas',
      value: estadisticas.totalEmpresas,
      icon: <Business sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Compras del Mes',
      value: estadisticas.comprasMes,
      icon: <ShoppingCart sx={{ fontSize: 40 }} />,
      color: '#f57c00',
    },
    {
      title: 'Ventas del Mes',
      value: estadisticas.ventasMes,
      icon: <PointOfSale sx={{ fontSize: 40 }} />,
      color: '#388e3c',
    },
    {
      title: 'ATS Generados',
      value: estadisticas.atsGenerados,
      icon: <Description sx={{ fontSize: 40 }} />,
      color: '#7b1fa2',
    },
  ]

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={2}>
        Bienvenido al Sistema de Anexo Transaccional Simplificado del SRI
      </Typography>
      {estadisticas.periodoActual && (
        <Typography variant="body2" color="text.secondary" mb={4}>
          Período actual: <strong>{estadisticas.periodoActual}</strong>
        </Typography>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
                border: `1px solid ${stat.color}30`,
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {stat.title}
                    </Typography>
                    <Typography variant="h3" fontWeight={600}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Resumen del mes actual */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Resumen del Mes Actual
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Compras
                </Typography>
                <Typography variant="h6" color="primary">
                  {estadisticas.resumenMesActual.compras.cantidad} transacciones
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  ${estadisticas.resumenMesActual.compras.total.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Ventas
                </Typography>
                <Typography variant="h6" color="success.main">
                  {estadisticas.resumenMesActual.ventas.cantidad} transacciones
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  ${estadisticas.resumenMesActual.ventas.total.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Funcionalidades del Sistema
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Este sistema permite gestionar múltiples empresas y generar el
              Anexo Transaccional Simplificado (ATS) requerido por el SRI de
              Ecuador.
            </Typography>
            <Box component="ul" sx={{ pl: 3, mt: 2 }}>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                <strong>Multi-empresa:</strong> Gestione múltiples empresas con
                datos completamente aislados
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                <strong>Importación XML:</strong> Importe facturas y retenciones
                electrónicas automáticamente
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                <strong>Validación:</strong> Sistema completo de validación de
                datos según normativa SRI
              </Typography>
              <Typography component="li" variant="body2">
                <strong>Generación ATS:</strong> Genere archivos XML conformes al
                esquema XSD oficial del SRI
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
