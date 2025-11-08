import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ImportarVentasSRI from '../components/ImportarVentasSRI';
import empresaService from '../services/empresaService';
import './ImportarVentasSRIPage.css';

const ImportarVentasSRIPage = () => {
  const { user } = useAuth();
  const [empresas, setEmpresas] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  const [cargandoEmpresas, setCargandoEmpresas] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarEmpresas();
  }, []);

  const cargarEmpresas = async () => {
    try {
      setCargandoEmpresas(true);
      const response = await empresaService.getAll();
      const listaEmpresas = response.data?.items || response.data || [];

      setEmpresas(listaEmpresas);

      // Si solo hay una empresa, seleccionarla automáticamente
      if (listaEmpresas.length === 1) {
        setEmpresaSeleccionada(listaEmpresas[0].id);
      }
    } catch (err) {
      setError('Error al cargar empresas: ' + (err.mensaje || err.message || 'Error desconocido'));
    } finally {
      setCargandoEmpresas(false);
    }
  };

  const handleImportComplete = (resultados) => {
    // Puede agregar lógica adicional aquí, como mostrar notificación
    console.log('Importación completada:', resultados);
  };

  return (
    <div className="importar-ventas-sri-page">
      <div className="page-header">
        <h1>Importar Ventas desde el SRI</h1>
        <p className="page-subtitle">
          Descarga e importa automáticamente tus comprobantes de venta electrónicos desde el portal del SRI
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {cargandoEmpresas ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando empresas...</p>
        </div>
      ) : empresas.length === 0 ? (
        <div className="alert alert-warning">
          No hay empresas disponibles. Por favor, registre una empresa primero.
        </div>
      ) : (
        <>
          <div className="empresa-selector">
            <label htmlFor="empresa-select">Seleccione la Empresa:</label>
            <select
              id="empresa-select"
              className="form-select"
              value={empresaSeleccionada || ''}
              onChange={(e) => setEmpresaSeleccionada(e.target.value)}
            >
              <option value="">-- Seleccione una empresa --</option>
              {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.ruc} - {empresa.razon_social}
                </option>
              ))}
            </select>
          </div>

          {empresaSeleccionada && (
            <ImportarVentasSRI
              empresaId={parseInt(empresaSeleccionada)}
              onImportComplete={handleImportComplete}
            />
          )}

          {!empresaSeleccionada && (
            <div className="info-box">
              <h3>Instrucciones</h3>
              <ol>
                <li>Seleccione la empresa para la cual desea importar ventas</li>
                <li>Prepare un archivo .txt con las claves de acceso de los comprobantes (una por línea)</li>
                <li>Seleccione el ambiente del SRI (Producción o Pruebas)</li>
                <li>Cargue el archivo y haga clic en "Importar Ventas"</li>
                <li>El sistema descargará automáticamente los comprobantes del SRI y los importará a la base de datos</li>
              </ol>

              <h4>Formato del archivo .txt</h4>
              <pre className="code-example">
3110202501171280155200120010050000001241234567811
3110202501171280155200120010050000001271234567816
3110202501171280155200120010050000001331234567819
              </pre>
              <p className="note">
                Cada clave de acceso debe tener exactamente 49 dígitos y estar en una línea separada.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ImportarVentasSRIPage;
