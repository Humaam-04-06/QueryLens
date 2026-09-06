import React, { useState } from 'react';
import { SchemaCatalog } from '../../types';
import { parseCustomDdl } from '../../engine/ast/schemaParser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, 
  faDatabase, 
  faPlus, 
  faBolt, 
  faCircleCheck,
  faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons';

interface CustomSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSchema: (newSchema: SchemaCatalog) => void;
}

const SAMPLE_CUSTOM_DDL = `CREATE TABLE Patients (
  Id INT PRIMARY KEY,
  FullName VARCHAR(120) NOT NULL,
  DateOfBirth DATE NOT NULL,
  BloodGroup VARCHAR(5),
  City VARCHAR(60),
  InsurancePolicyId VARCHAR(50)
);

CREATE TABLE Appointments (
  Id INT PRIMARY KEY,
  PatientId INT NOT NULL,
  DoctorId INT NOT NULL,
  AppointmentDate DATETIME NOT NULL,
  Diagnosis VARCHAR(255),
  Status VARCHAR(30)
);

CREATE INDEX idx_appointments_patient ON Appointments(PatientId);`;

export const CustomSchemaModal: React.FC<CustomSchemaModalProps> = ({
  isOpen,
  onClose,
  onImportSchema,
}) => {
  const [ddl, setDdl] = useState<string>(SAMPLE_CUSTOM_DDL);
  const [schemaName, setSchemaName] = useState<string>('Healthcare Clinic');
  const [parsedPreview, setParsedPreview] = useState<SchemaCatalog | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePreview = () => {
    try {
      const parsed = parseCustomDdl(ddl, schemaName);
      if (parsed.tables.length === 0) {
        setErrorNotice('No valid CREATE TABLE statements detected. Please check SQL syntax.');
        setParsedPreview(null);
      } else {
        setErrorNotice(null);
        setParsedPreview(parsed);
      }
    } catch {
      setErrorNotice('Error parsing DDL statements.');
    }
  };

  const handleSave = () => {
    const finalSchema = parsedPreview || parseCustomDdl(ddl, schemaName);
    if (finalSchema.tables.length > 0) {
      onImportSchema(finalSchema);
      onClose();
    } else {
      setErrorNotice('Cannot import empty schema. Please provide at least one CREATE TABLE statement.');
    }
  };

  const handleLoadSample = () => {
    setDdl(SAMPLE_CUSTOM_DDL);
    setSchemaName('Healthcare Clinic');
    setErrorNotice(null);
    setParsedPreview(parseCustomDdl(SAMPLE_CUSTOM_DDL, 'Healthcare Clinic'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-dark-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <FontAwesomeIcon icon={faDatabase} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Import Custom Schema (DDL)</h3>
              <p className="text-xs text-slate-400">Paste your table & index DDL statements to analyze your queries</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-dark-800 transition"
          >
            <FontAwesomeIcon icon={faXmark} className="text-base" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Schema Name Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Catalog Display Name</label>
            <input
              type="text"
              value={schemaName}
              onChange={(e) => setSchemaName(e.target.value)}
              placeholder="e.g. My Production Database"
              className="w-full px-3 py-2 text-xs rounded-lg bg-dark-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* DDL Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300">DDL Statements (CREATE TABLE / CREATE INDEX)</label>
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
              >
                <FontAwesomeIcon icon={faBolt} className="text-[10px]" />
                <span>Load Sample DDL</span>
              </button>
            </div>
            <textarea
              value={ddl}
              onChange={(e) => {
                setDdl(e.target.value);
                setParsedPreview(null);
                setErrorNotice(null);
              }}
              rows={8}
              placeholder="CREATE TABLE TableName ( Id INT PRIMARY KEY, Col1 VARCHAR(50)... );"
              className="w-full p-3 font-mono text-xs rounded-xl bg-dark-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-sky-500 resize-none leading-5"
            />
          </div>

          {/* Error notice */}
          {errorNotice && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
              <FontAwesomeIcon icon={faTriangleExclamation} className="text-rose-400" />
              <span>{errorNotice}</span>
            </div>
          )}

          {/* Preview pill */}
          {parsedPreview && (
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1 text-emerald-300">
              <div className="flex items-center gap-2 font-bold">
                <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-400" />
                <span>Parsed Successfully: {parsedPreview.tables.length} tables found</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
                {parsedPreview.tables.map(t => (
                  <span key={t.name} className="px-2 py-0.5 rounded bg-dark-950 text-slate-300 border border-slate-800">
                    {t.name} ({t.columns.length} cols, {t.existingIndexes.length} idx)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-dark-950">
          <button
            type="button"
            onClick={handlePreview}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-dark-800 hover:bg-dark-700 text-slate-300 border border-slate-700 transition"
          >
            Validate DDL
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-glow-cyan transition"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Save & Activate Catalog</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
