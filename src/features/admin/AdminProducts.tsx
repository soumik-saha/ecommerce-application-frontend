import React, { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Upload, Download, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService } from '../products/productService';
import type { ProductResponse, ProductRequest } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { parseError } from '../../utils/errorParser';

const defaultForm: ProductRequest = { name: '', description: '', price: 0, stockQuantity: 0, imageUrl: '', category: '' };

interface CsvValidationFailure {
  rowNumber: number;
  reason: string;
}

interface CsvProductRow {
  rowNumber: number;
  product: ProductRequest;
}

interface ImportFailure {
  rowNumber: number;
  productName: string;
  reason: string;
}

const requiredCsvHeaders = ['name', 'description', 'price', 'stockQuantity', 'category', 'imageUrl'];

const normalizeHeader = (value: string) => value.trim().toLowerCase();

// Supports quoted CSV values with commas and escaped quotes.
const parseCsvLine = (line: string): string[] => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
};

const escapeCsvValue = (value: string | number | undefined) => {
  const safeValue = value === undefined || value === null ? '' : String(value);
  if (safeValue.includes(',') || safeValue.includes('"') || safeValue.includes('\n')) {
    return `"${safeValue.replaceAll('"', '""')}"`;
  }
  return safeValue;
};

const buildProductsCsv = (products: ProductResponse[]) => {
  const header = requiredCsvHeaders.join(',');
  const rows = products.map((product) => [
    escapeCsvValue(product.name),
    escapeCsvValue(product.description),
    escapeCsvValue(product.price),
    escapeCsvValue(product.stockQuantity),
    escapeCsvValue(product.category || ''),
    escapeCsvValue(product.imageUrl || ''),
  ].join(','));

  return [header, ...rows].join('\n');
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const parseProductsCsv = (csvText: string) => {
  const normalizedText = csvText.replace(/^\uFEFF/, '').trim();

  if (!normalizedText) {
    throw new Error('CSV file is empty');
  }

  const lines = normalizedText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('CSV must include a header and at least one product row');
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const missingHeaders = requiredCsvHeaders.filter((requiredHeader) => !headers.includes(normalizeHeader(requiredHeader)));
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required CSV headers: ${missingHeaders.join(', ')}`);
  }

  const validRows: CsvProductRow[] = [];
  const validationFailures: CsvValidationFailure[] = [];

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const cells = parseCsvLine(lines[lineIndex]);
    const rowNumber = lineIndex + 1;
    const rowData: Record<string, string> = {};

    headers.forEach((header, headerIndex) => {
      rowData[header] = (cells[headerIndex] || '').trim();
    });

    if (Object.values(rowData).every((value) => value === '')) {
      continue;
    }

    const name = rowData.name;
    const description = rowData.description;
    const category = rowData.category;
    const imageUrl = rowData.imageurl;
    const price = Number.parseFloat(rowData.price);
    const stockQuantity = Number.parseInt(rowData.stockquantity, 10);

    if (!name) {
      validationFailures.push({ rowNumber, reason: 'name is required' });
      continue;
    }
    if (!description) {
      validationFailures.push({ rowNumber, reason: 'description is required' });
      continue;
    }
    if (!Number.isFinite(price) || price <= 0) {
      validationFailures.push({ rowNumber, reason: 'price must be a number greater than 0' });
      continue;
    }
    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      validationFailures.push({ rowNumber, reason: 'stockQuantity must be an integer greater than or equal to 0' });
      continue;
    }
    if (!category) {
      validationFailures.push({ rowNumber, reason: 'category is required' });
      continue;
    }
    if (!imageUrl) {
      validationFailures.push({ rowNumber, reason: 'imageUrl is required' });
      continue;
    }

    validRows.push({
      rowNumber,
      product: {
        name,
        description,
        price,
        stockQuantity,
        category,
        imageUrl,
      },
    });
  }

  return { validRows, validationFailures };
};

const AdminProducts: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
  const [form, setForm] = useState<ProductRequest>(defaultForm);
  const [page, setPage] = useState(0);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<CsvProductRow[]>([]);
  const [validationFailures, setValidationFailures] = useState<CsvValidationFailure[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ processed: 0, total: 0, created: 0, failed: 0 });
  const [importFailures, setImportFailures] = useState<ImportFailure[]>([]);
  const [isExportingProducts, setIsExportingProducts] = useState(false);
  const [isExportingAudit, setIsExportingAudit] = useState(false);
  const [auditStartDate, setAuditStartDate] = useState('');
  const [auditEndDate, setAuditEndDate] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page],
    queryFn: () => productService.getProducts('', page, 20),
  });

  const createMutation = useMutation({
    mutationFn: (data: ProductRequest) => productService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product created');
      closeModal();
    },
    onError: (err) => toast.error(parseError(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductRequest }) => productService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product updated');
      closeModal();
    },
    onError: (err) => toast.error(parseError(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted');
    },
    onError: (err) => toast.error(parseError(err)),
  });

  const openCreate = () => {
    setEditingProduct(null);
    setForm(defaultForm);
    setModalOpen(true);
  };

  const openEdit = (product: ProductResponse) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      imageUrl: product.imageUrl || '',
      category: product.category || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
    setForm(defaultForm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleTemplateDownload = () => {
    const templateCsv = [
      'name,description,price,stockQuantity,category,imageUrl',
      'Wireless Headphones,Noise-cancelling over-ear headphones,4999.00,250,Electronics,https://example.com/headphones.png',
      'Office Chair,Ergonomic chair with lumbar support,8999.00,40,Furniture,https://example.com/chair.png',
    ].join('\n');

    downloadBlob(new Blob([templateCsv], { type: 'text/csv;charset=utf-8;' }), 'products-bulk-template.csv');
  };

  const handleCsvFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please choose a .csv file');
      event.target.value = '';
      return;
    }

    try {
      const fileContent = await file.text();
      const { validRows, validationFailures: fileValidationFailures } = parseProductsCsv(fileContent);

      setSelectedFileName(file.name);
      setParsedRows(validRows);
      setValidationFailures(fileValidationFailures);
      setImportFailures([]);
      setImportProgress({ processed: 0, total: validRows.length, created: 0, failed: 0 });

      if (validRows.length === 0) {
        toast.error('No valid rows found in CSV file');
        return;
      }

      if (fileValidationFailures.length > 0) {
        toast.error(`Loaded ${validRows.length} valid rows, ${fileValidationFailures.length} rows need fixes`);
      } else {
        toast.success(`Loaded ${validRows.length} product rows`);
      }
    } catch (error) {
      toast.error(parseError(error));
      setSelectedFileName('');
      setParsedRows([]);
      setValidationFailures([]);
      setImportFailures([]);
      setImportProgress({ processed: 0, total: 0, created: 0, failed: 0 });
    }
  };

  const handleBulkImport = async () => {
    if (parsedRows.length === 0) {
      toast.error('No valid rows available for import');
      return;
    }

    setIsImporting(true);
    setImportFailures([]);
    setImportProgress({ processed: 0, total: parsedRows.length, created: 0, failed: 0 });

    const chunkSize = 20;
    let processed = 0;
    let created = 0;
    let failed = 0;
    const failures: ImportFailure[] = [];

    try {
      for (let chunkStart = 0; chunkStart < parsedRows.length; chunkStart += chunkSize) {
        const chunk = parsedRows.slice(chunkStart, chunkStart + chunkSize);

        const chunkResults = await Promise.allSettled(
          chunk.map(({ product }) => productService.createProduct(product))
        );

        chunkResults.forEach((result, index) => {
          const row = chunk[index];
          processed += 1;

          if (result.status === 'fulfilled') {
            created += 1;
          } else {
            failed += 1;
            failures.push({
              rowNumber: row.rowNumber,
              productName: row.product.name,
              reason: parseError(result.reason),
            });
          }

          setImportProgress({
            processed,
            total: parsedRows.length,
            created,
            failed,
          });
        });
      }

      setImportFailures(failures);
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });

      if (failed > 0) {
        toast.error(`Import finished: ${created} created, ${failed} failed`);
      } else {
        toast.success(`Bulk import completed: ${created} products created`);
      }
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportProductsCsv = async () => {
    setIsExportingProducts(true);
    try {
      const products = await productService.getAllProductsForExport();
      if (products.length === 0) {
        toast.error('No products available to export');
        return;
      }

      const csvText = buildProductsCsv(products);
      downloadBlob(new Blob([csvText], { type: 'text/csv;charset=utf-8;' }), `products-export-${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success(`Exported ${products.length} products`);
    } catch (error) {
      toast.error(parseError(error));
    } finally {
      setIsExportingProducts(false);
    }
  };

  const handleDownloadAuditLogsCsv = async () => {
    setIsExportingAudit(true);
    try {
      const filters = {
        startDate: auditStartDate ? new Date(auditStartDate).toISOString() : undefined,
        endDate: auditEndDate ? new Date(auditEndDate).toISOString() : undefined,
      };

      const blob = await productService.downloadAuditLogsCsv(filters);
      downloadBlob(blob, `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success('Audit logs CSV download started');
    } catch (error) {
      toast.error(parseError(error));
    } finally {
      setIsExportingAudit(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your product catalog</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus size={18} /> Add Product
        </Button>
      </div>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="secondary" className="gap-2" onClick={handleTemplateDownload}>
              <FileSpreadsheet size={16} /> Download CSV Template
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
            >
              <Upload size={16} /> Select CSV File
            </Button>
            <Button
              type="button"
              className="gap-2"
              onClick={handleBulkImport}
              loading={isImporting}
              disabled={parsedRows.length === 0 || isImporting}
            >
              <Upload size={16} /> Bulk Upload Products
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="gap-2"
              onClick={handleExportProductsCsv}
              loading={isExportingProducts}
              disabled={isExportingProducts || isImporting}
            >
              <Download size={16} /> Download Products CSV
            </Button>
          </div>

          <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleCsvFileSelected} />

          {(selectedFileName || parsedRows.length > 0 || validationFailures.length > 0 || importFailures.length > 0) && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              {selectedFileName && <p><span className="font-medium">File:</span> {selectedFileName}</p>}
              <p>
                <span className="font-medium">Rows ready:</span> {parsedRows.length}
                {' | '}
                <span className="font-medium">Validation errors:</span> {validationFailures.length}
                {' | '}
                <span className="font-medium">Import failures:</span> {importFailures.length}
              </p>
              {isImporting && (
                <p className="mt-1">
                  Import progress: {importProgress.processed}/{importProgress.total} processed, {importProgress.created} created, {importProgress.failed} failed
                </p>
              )}
              {validationFailures.length > 0 && (
                <div className="mt-2 rounded border border-amber-200 bg-amber-50 p-2 text-amber-900">
                  <p className="font-medium">CSV validation issues (first 5)</p>
                  {validationFailures.slice(0, 5).map((failure) => (
                    <p key={`${failure.rowNumber}-${failure.reason}`}>Row {failure.rowNumber}: {failure.reason}</p>
                  ))}
                </div>
              )}
              {importFailures.length > 0 && (
                <div className="mt-2 rounded border border-red-200 bg-red-50 p-2 text-red-900">
                  <p className="font-medium">Import failures (first 5)</p>
                  {importFailures.slice(0, 5).map((failure) => (
                    <p key={`${failure.rowNumber}-${failure.productName}`}>Row {failure.rowNumber} ({failure.productName}): {failure.reason}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <p className="text-sm font-medium text-gray-800">Audit log CSV export</p>
            <p className="text-xs text-gray-500">Optional date range filters map to /api/audit-logs/download query params.</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Input
                label="Start Date"
                type="datetime-local"
                value={auditStartDate}
                onChange={(event) => setAuditStartDate(event.target.value)}
              />
              <Input
                label="End Date"
                type="datetime-local"
                value={auditEndDate}
                onChange={(event) => setAuditEndDate(event.target.value)}
              />
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full gap-2"
                  onClick={handleDownloadAuditLogsCsv}
                  loading={isExportingAudit}
                  disabled={isExportingAudit || isImporting}
                >
                  <Download size={16} /> Download Audit CSV
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Stock</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.content.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{product.description}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{product.category || '—'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">${product.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{product.stockQuantity}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(product)} className="rounded p-1.5 text-gray-500 hover:bg-gray-100">
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(product.id)}
                        className="rounded p-1.5 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="text-sm text-gray-600 disabled:opacity-40 hover:text-gray-900"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">Page {page + 1} of {data.totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
                disabled={page >= data.totalPages - 1}
                className="text-sm text-gray-600 disabled:opacity-40 hover:text-gray-900"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={closeModal} title={editingProduct ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price"
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
              required
            />
            <Input
              label="Stock"
              type="number"
              min="0"
              value={form.stockQuantity}
              onChange={(e) => setForm({ ...form, stockQuantity: parseInt(e.target.value) || 0 })}
              required
            />
          </div>
          <Input label="Category" value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Input label="Image URL" value={form.imageUrl || ''} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button type="submit" loading={isSaving}>{editingProduct ? 'Save Changes' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminProducts;
