import React, { useState } from 'react';
import ventaService from '../services/ventaService';
import xmlImportService from '../services/xmlImportService';
import './ImportarVentasSRI.css';

const ImportarVentasSRI = ({ empresaId, onImportComplete }) => {
  const [archivo, setArchivo] = useState(null);
  const [ambiente, setAmbiente] = useState('PRODUCCION');
  const [cargando, setCargando] = useState(false);
  const [progreso, setProgreso] = useState(null);
  const [resultados, setResultados] = useState(null);
  const [error, setError] = useState(null);

  // Estado para importación única
  const [claveAccesoUnica, setClaveAccesoUnica] = useState('');
  const [importandoUnica, setImportandoUnica] = useState(false);
  const [modoImportacion, setModoImportacion] = useState('MASIVA'); // 'MASIVA', 'UNICA', 'XML'

  // Estado para importación XML
  const [archivosXML, setArchivosXML] = useState([]);
  const [importandoXML, setImportandoXML] = useState(false);

  const handleArchivoChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Validar extensión
      const extension = file.name.split('.').pop().toLowerCase();
      if (extension !== 'txt') {
        setError('Solo se permiten archivos .txt');
        setArchivo(null);
        e.target.value = '';
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo no debe superar los 5MB');
        setArchivo(null);
        e.target.value = '';
        return;
      }

      setArchivo(file);
      setError(null);
      setResultados(null);
    }
  };

  const handleImportarMasiva = async () => {
    if (!archivo) {
      setError('Debe seleccionar un archivo .txt');
      return;
    }

    if (!empresaId) {
      setError('No se ha seleccionado una empresa');
      return;
    }

    setCargando(true);
    setProgreso('Iniciando importación...');
    setError(null);
    setResultados(null);

    try {
      const response = await ventaService.importarDesdeArchivo(archivo, empresaId, ambiente);

      setResultados(response.data);
      setProgreso('Importación finalizada');

      // Limpiar archivo
      setArchivo(null);
      document.getElementById('archivo-input').value = '';

      // Notificar al componente padre
      if (onImportComplete) {
        onImportComplete(response.data);
      }

    } catch (err) {
      setError(err.mensaje || err.message || 'Error al importar ventas desde el SRI');
      setProgreso(null);
    } finally {
      setCargando(false);
    }
  };

  const handleImportarUnica = async () => {
    if (!claveAccesoUnica || claveAccesoUnica.trim().length === 0) {
      setError('Debe ingresar una clave de acceso');
      return;
    }

    if (claveAccesoUnica.length !== 49) {
      setError('La clave de acceso debe tener exactamente 49 dígitos');
      return;
    }

    if (!empresaId) {
      setError('No se ha seleccionado una empresa');
      return;
    }

    setImportandoUnica(true);
    setError(null);
    setResultados(null);

    try {
      const response = await ventaService.importarVentaUnica(
        claveAccesoUnica.trim(),
        empresaId,
        ambiente
      );

      setResultados({
        total: 1,
        exitosos: 1,
        fallidos: 0,
        duplicados: 0,
        detalles: [{
          claveAcceso: claveAccesoUnica,
          estado: 'EXITOSO',
          mensaje: response.mensaje,
          ventaId: response.data.venta.id
        }]
      });

      setClaveAccesoUnica('');

      // Notificar al componente padre
      if (onImportComplete) {
        onImportComplete({ exitosos: 1 });
      }

    } catch (err) {
      setError(err.mensaje || err.message || 'Error al importar venta desde el SRI');
    } finally {
      setImportandoUnica(false);
    }
  };

  const handleArchivosXMLChange = (e) => {
    const files = Array.from(e.target.files);

    // Validar que sean archivos XML
    const archivosValidos = files.filter(file =>
      file.name.toLowerCase().endsWith('.xml')
    );

    if (archivosValidos.length !== files.length) {
      setError('Solo se permiten archivos XML');
      return;
    }

    setArchivosXML(archivosValidos);
    setError(null);
    setResultados(null);
  };

  const handleImportarXML = async () => {
    if (archivosXML.length === 0) {
      setError('Debe seleccionar al menos un archivo XML');
      return;
    }

    if (!empresaId) {
      setError('No se ha seleccionado una empresa');
      return;
    }

    setImportandoXML(true);
    setProgreso(`Importando ${archivosXML.length} archivos XML...`);
    setError(null);
    setResultados(null);

    try {
      const { results, errors } = await xmlImportService.importarMultiple(
        archivosXML,
        {},
        'venta'
      );

      const totalExitosos = results.length;
      const totalFallidos = errors.length;

      setResultados({
        total: archivosXML.length,
        exitosos: totalExitosos,
        fallidos: totalFallidos,
        duplicados: 0,
        detalles: [
          ...results.map(r => ({
            claveAcceso: r.file,
            estado: 'EXITOSO',
            mensaje: 'Importado correctamente',
            ventaId: r.data?.id
          })),
          ...errors.map(e => ({
            claveAcceso: e.file,
            estado: 'ERROR',
            mensaje: e.error
          }))
        ]
      });

      setProgreso('Importación finalizada');
      setArchivosXML([]);
      document.getElementById('xml-input').value = '';

      // Notificar al componente padre
      if (onImportComplete) {
        onImportComplete({ exitosos: totalExitosos });
      }

    } catch (err) {
      setError(err.mensaje || err.message || 'Error al importar archivos XML');
      setProgreso(null);
    } finally {
      setImportandoXML(false);
    }
  };

  const renderResultados = () => {
    if (!resultados) return null;

    return (
      <div className="resultados-importacion">
        <h4>Resultados de la Importación</h4>

        <div className="resumen-resultados">
          <div className="stat-item exitoso">
            <span className="stat-numero">{resultados.exitosos}</span>
            <span className="stat-label">Exitosos</span>
          </div>
          <div className="stat-item fallido">
            <span className="stat-numero">{resultados.fallidos}</span>
            <span className="stat-label">Fallidos</span>
          </div>
          <div className="stat-item duplicado">
            <span className="stat-numero">{resultados.duplicados}</span>
            <span className="stat-label">Duplicados</span>
          </div>
          <div className="stat-item total">
            <span className="stat-numero">{resultados.total}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>

        {resultados.detalles && resultados.detalles.length > 0 && (
          <div className="detalles-resultados">
            <h5>Detalles</h5>
            <div className="tabla-detalles">
              {resultados.detalles.map((detalle, index) => (
                <div
                  key={index}
                  className={`detalle-item ${detalle.estado.toLowerCase()}`}
                >
                  <div className="detalle-clave">
                    {detalle.claveAcceso}
                  </div>
                  <div className="detalle-estado">
                    <span className={`badge ${detalle.estado.toLowerCase()}`}>
                      {detalle.estado}
                    </span>
                  </div>
                  <div className="detalle-mensaje">
                    {detalle.mensaje}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="importar-ventas-sri">
      <div className="card">
        <div className="card-header">
          <h3>Importar Ventas desde el SRI</h3>
          <p className="card-description">
            Descarga e importa automáticamente los comprobantes electrónicos desde el SRI
          </p>
        </div>

        <div className="card-body">
          {/* Selector de modo de importación */}
          <div className="modo-importacion">
            <button
              className={`modo-btn ${modoImportacion === 'MASIVA' ? 'active' : ''}`}
              onClick={() => setModoImportacion('MASIVA')}
            >
              Importación Masiva (SRI)
            </button>
            <button
              className={`modo-btn ${modoImportacion === 'UNICA' ? 'active' : ''}`}
              onClick={() => setModoImportacion('UNICA')}
            >
              Importación Única (SRI)
            </button>
            <button
              className={`modo-btn ${modoImportacion === 'XML' ? 'active' : ''}`}
              onClick={() => setModoImportacion('XML')}
            >
              Importación desde XML
            </button>
          </div>

          {/* Selector de ambiente */}
          <div className="form-group">
            <label htmlFor="ambiente">Ambiente del SRI</label>
            <select
              id="ambiente"
              className="form-control"
              value={ambiente}
              onChange={(e) => setAmbiente(e.target.value)}
              disabled={cargando || importandoUnica}
            >
              <option value="PRODUCCION">Producción</option>
              <option value="PRUEBAS">Pruebas</option>
            </select>
          </div>

          {/* Importación Masiva */}
          {modoImportacion === 'MASIVA' && (
            <>
              <div className="form-group">
                <label htmlFor="archivo-input">
                  Archivo de Claves de Acceso (.txt)
                </label>
                <input
                  id="archivo-input"
                  type="file"
                  className="form-control"
                  accept=".txt"
                  onChange={handleArchivoChange}
                  disabled={cargando}
                />
                <small className="form-text">
                  Archivo de texto (.txt) con una clave de acceso por línea (49 dígitos cada una)
                </small>
              </div>

              {archivo && (
                <div className="archivo-seleccionado">
                  <p>
                    <strong>Archivo seleccionado:</strong> {archivo.name}
                  </p>
                  <p>
                    <strong>Tamaño:</strong> {(archivo.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}

              <button
                className="btn btn-primary"
                onClick={handleImportarMasiva}
                disabled={!archivo || cargando}
              >
                {cargando ? 'Importando...' : 'Importar Ventas'}
              </button>
            </>
          )}

          {/* Importación Única */}
          {modoImportacion === 'UNICA' && (
            <>
              <div className="form-group">
                <label htmlFor="clave-acceso-input">
                  Clave de Acceso (49 dígitos)
                </label>
                <input
                  id="clave-acceso-input"
                  type="text"
                  className="form-control"
                  placeholder="Ingrese la clave de acceso de 49 dígitos"
                  value={claveAccesoUnica}
                  onChange={(e) => setClaveAccesoUnica(e.target.value)}
                  disabled={importandoUnica}
                  maxLength="49"
                />
                <small className="form-text">
                  Ingrese la clave de acceso del comprobante electrónico (49 dígitos)
                </small>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleImportarUnica}
                disabled={!claveAccesoUnica || importandoUnica}
              >
                {importandoUnica ? 'Importando...' : 'Importar Venta'}
              </button>
            </>
          )}

          {/* Importación desde XML */}
          {modoImportacion === 'XML' && (
            <>
              <div className="form-group">
                <label htmlFor="xml-input">
                  Archivos XML de Facturas Electrónicas
                </label>
                <input
                  id="xml-input"
                  type="file"
                  className="form-control"
                  accept=".xml"
                  onChange={handleArchivosXMLChange}
                  disabled={importandoXML}
                  multiple
                />
                <small className="form-text">
                  Seleccione uno o varios archivos XML de facturas electrónicas emitidas por su empresa
                </small>
              </div>

              {archivosXML.length > 0 && (
                <div className="archivo-seleccionado">
                  <p>
                    <strong>Archivos seleccionados:</strong> {archivosXML.length}
                  </p>
                  <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    {archivosXML.map((file, index) => (
                      <li key={index} style={{ fontSize: '13px', marginBottom: '4px' }}>
                        {file.name} ({(file.size / 1024).toFixed(2)} KB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                className="btn btn-primary"
                onClick={handleImportarXML}
                disabled={archivosXML.length === 0 || importandoXML}
              >
                {importandoXML ? 'Importando...' : `Importar ${archivosXML.length} Archivo(s)`}
              </button>
            </>
          )}

          {/* Progreso */}
          {progreso && (
            <div className="progreso-importacion">
              <div className="spinner"></div>
              <p>{progreso}</p>
            </div>
          )}

          {/* Errores */}
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {/* Resultados */}
          {renderResultados()}
        </div>
      </div>
    </div>
  );
};

export default ImportarVentasSRI;
