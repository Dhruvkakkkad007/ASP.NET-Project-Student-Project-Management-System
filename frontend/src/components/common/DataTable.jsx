import React, { useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import Input from './Input';
import EmptyState from './EmptyState';
import Loader from './Loader';

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  searchPlaceholder = 'Search records...',
  searchable = true,
  pagination = true,
  initialPageSize = 10,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no records to display.',
  onRowClick,
  actions,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Filter
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    return data.filter((row) => {
      return columns.some((col) => {
        let value = null;
        if (typeof col.accessor === 'function') {
          value = col.accessor(row);
        } else if (col.accessor) {
          value = row[col.accessor];
        }
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(term);
      });
    });
  }, [data, searchTerm, columns]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const col = columns.find((c) => c.accessor === sortConfig.key);
      let valA = typeof col?.accessor === 'function' ? col.accessor(a) : a[sortConfig.key];
      let valB = typeof col?.accessor === 'function' ? col.accessor(b) : b[sortConfig.key];

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
      }

      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig, columns]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const handleSort = (key) => {
    if (!key) return;
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Top Controls Bar */}
      {(searchable || actions) && (
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          {searchable ? (
            <div className="w-full sm:max-w-xs relative">
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                icon={Search}
                className="py-1.5 text-xs"
              />
            </div>
          ) : (
            <div />
          )}

          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}

      {/* Table Element */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] uppercase tracking-wider text-slate-500 font-semibold select-none">
              {columns.map((col, idx) => {
                const isSortable = col.sortable !== false && typeof col.accessor === 'string';
                const isSorted = sortConfig.key === col.accessor;

                return (
                  <th
                    key={idx}
                    scope="col"
                    onClick={() => isSortable && handleSort(col.accessor)}
                    className={`py-3.5 px-4 font-semibold text-slate-600 ${
                      isSortable ? 'cursor-pointer hover:bg-slate-100/60' : ''
                    } ${col.className || ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {isSortable && (
                        <span className="text-slate-400">
                          {isSorted ? (
                            sortConfig.direction === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-brand-600" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-brand-600" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-3.5 h-3.5 text-slate-300" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-12">
                  <Loader text="Loading records..." />
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-6">
                  <EmptyState
                    title={emptyTitle}
                    description={
                      searchTerm
                        ? `No matching results for "${searchTerm}". Try another search.`
                        : emptyDescription
                    }
                  />
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={row.id || row._id || rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col, colIdx) => {
                    let cellContent = null;
                    if (col.render) {
                      cellContent = col.render(row);
                    } else if (typeof col.accessor === 'function') {
                      cellContent = col.accessor(row);
                    } else if (col.accessor) {
                      cellContent = row[col.accessor];
                    }

                    return (
                      <td
                        key={colIdx}
                        className={`py-3.5 px-4 text-slate-700 align-middle ${
                          col.className || ''
                        }`}
                      >
                        {cellContent !== null && cellContent !== undefined
                          ? cellContent
                          : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && !loading && sortedData.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-white">
          <div className="flex items-center gap-2">
            <span>
              Showing{' '}
              <span className="font-semibold text-slate-700">
                {(currentPage - 1) * pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-slate-700">
                {Math.min(currentPage * pageSize, sortedData.length)}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-slate-700">
                {sortedData.length}
              </span>{' '}
              results
            </span>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="ml-2 border border-slate-200 rounded px-2 py-1 text-xs text-slate-600 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {[5, 10, 20, 50].map((sz) => (
                <option key={sz} value={sz}>
                  {sz} / page
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

