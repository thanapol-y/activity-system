"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { databaseAPI } from "@/lib/api";

interface TableInfo {
  name: string;
  label: string;
  count: number;
  primaryKey: string | string[];
}

interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  key: string;
  default: any;
  isPassword: boolean;
}

export default function DatabaseManagementPage() {
  const { user } = useAuth();
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 50 });

  // Edit state
  const [editingRow, setEditingRow] = useState<any>(null);
  const [editData, setEditData] = useState<Record<string, any>>({});

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  // SQL query
  const [sqlQuery, setSqlQuery] = useState("");
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [sqlError, setSqlError] = useState("");
  const [sqlLoading, setSqlLoading] = useState(false);

  // Alert
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  React.useEffect(() => { document.title = "ระบบลงทะเบียน – จัดการฐานข้อมูล"; }, []);

  const loadTables = useCallback(async () => {
    try {
      setTableLoading(true);
      const res = await databaseAPI.getTables();
      if (res.success) setTables(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setTableLoading(false);
    }
  }, []);

  const loadTableData = useCallback(async (table: string, searchStr?: string, pageNum?: number) => {
    try {
      setLoading(true);
      const res = await databaseAPI.getTableData(table, searchStr, pageNum, 50);
      if (res.success) {
        setColumns(res.data.columns);
        setRows(res.data.rows);
        setPagination(res.data.pagination);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTables(); }, [loadTables]);

  useEffect(() => {
    if (selectedTable) {
      setSearch("");
      setPage(1);
      setEditingRow(null);
      loadTableData(selectedTable);
    }
  }, [selectedTable, loadTableData]);

  const handleSearch = () => {
    setPage(1);
    loadTableData(selectedTable, search, 1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadTableData(selectedTable, search, newPage);
  };

  const getPrimaryKeyValues = (row: any) => {
    const tableInfo = tables.find(t => t.name === selectedTable);
    if (!tableInfo) return {};
    const pks = Array.isArray(tableInfo.primaryKey) ? tableInfo.primaryKey : [tableInfo.primaryKey];
    const values: Record<string, any> = {};
    pks.forEach(pk => { values[pk] = row[pk]; });
    return values;
  };

  const handleEdit = (row: any) => {
    setEditingRow(row);
    setEditData({ ...row });
  };

  const handleSaveEdit = async () => {
    try {
      const pkValues = getPrimaryKeyValues(editingRow);
      const res = await databaseAPI.updateRow(selectedTable, pkValues, editData);
      if (res.success) {
        setAlert({ type: "success", message: res.message || "อัปเดตสำเร็จ" });
        setEditingRow(null);
        loadTableData(selectedTable, search, page);
        loadTables();
      } else {
        setAlert({ type: "error", message: res.message || "เกิดข้อผิดพลาด" });
      }
    } catch (e: any) {
      setAlert({ type: "error", message: e.message || "เกิดข้อผิดพลาด" });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const pkValues = getPrimaryKeyValues(deleteConfirm);
      const res = await databaseAPI.deleteRow(selectedTable, pkValues);
      if (res.success) {
        setAlert({ type: "success", message: res.message || "ลบสำเร็จ" });
        setDeleteConfirm(null);
        loadTableData(selectedTable, search, page);
        loadTables();
      } else {
        setAlert({ type: "error", message: res.message || "เกิดข้อผิดพลาด" });
      }
    } catch (e: any) {
      setAlert({ type: "error", message: e.message || "เกิดข้อผิดพลาด ตรวจสอบว่าไม่มีข้อมูลอ้างอิง" });
    }
  };

  const handleExecuteSQL = async () => {
    if (!sqlQuery.trim()) return;
    try {
      setSqlLoading(true);
      setSqlError("");
      setSqlResult(null);
      const res = await databaseAPI.executeQuery(sqlQuery);
      if (res.success) {
        setSqlResult(res.data || []);
        if (res.message) setAlert({ type: "success", message: res.message });
        loadTables();
        if (selectedTable) loadTableData(selectedTable, search, page);
      } else {
        setSqlError(res.message || "เกิดข้อผิดพลาด");
      }
    } catch (e: any) {
      setSqlError(e.message || "SQL Error");
    } finally {
      setSqlLoading(false);
    }
  };

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  if (!user) return null;

  const displayCols = columns.filter(c => !c.isPassword);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Alert Toast */}
      {alert && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${alert.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {alert.message}
        </div>
      )}

      <main className="flex-grow max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">จัดการฐานข้อมูล</h1>
          <p className="text-sm md:text-base text-gray-600">ดู แก้ไข และลบข้อมูลในตารางทั้งหมดของระบบ</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar: Table list */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-4 sticky top-4">
              <h2 className="font-semibold text-gray-800 mb-3 text-sm">ตารางทั้งหมด</h2>
              {tableLoading ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#2B4C8C]"></div>
                </div>
              ) : (
                <div className="space-y-1">
                  {tables.map((t) => (
                    <button
                      key={t.name}
                      onClick={() => setSelectedTable(t.name)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${selectedTable === t.name ? "bg-[#2B4C8C] text-white" : "hover:bg-gray-100 text-gray-700"}`}
                    >
                      <span className="truncate">{t.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${selectedTable === t.name ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                        {t.count}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main: Table data */}
          <div className="lg:col-span-4 space-y-6">
            {!selectedTable ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                <p className="text-gray-500">เลือกตารางจากเมนูด้านซ้ายเพื่อดูข้อมูล</p>
              </div>
            ) : (
              <>
                {/* Search & Info */}
                <div className="bg-white rounded-xl shadow-md p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-gray-800 text-lg">
                        {tables.find(t => t.name === selectedTable)?.label || selectedTable}
                        <span className="text-sm font-normal text-gray-500 ml-2">({selectedTable})</span>
                      </h2>
                      <p className="text-xs text-gray-500">{pagination.totalItems} แถว · {columns.length} คอลัมน์</p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        placeholder="ค้นหา..."
                        className="flex-1 sm:w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900"
                      />
                      <button onClick={handleSearch} className="px-4 py-2 bg-[#2B4C8C] text-white text-sm rounded-lg hover:bg-[#1e3a6e] transition-colors">
                        ค้นหา
                      </button>
                    </div>
                  </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2B4C8C]"></div>
                      <p className="mt-2 text-sm text-gray-500">กำลังโหลด...</p>
                    </div>
                  ) : rows.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 text-sm">ไม่พบข้อมูล</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                            {displayCols.map((col) => (
                              <th key={col.name} className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">
                                {col.name}
                                {col.key === "PRI" && <span className="ml-1 text-yellow-500">🔑</span>}
                              </th>
                            ))}
                            <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase">จัดการ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                              <td className="px-3 py-2 text-gray-400 text-xs">{(page - 1) * 50 + idx + 1}</td>
                              {displayCols.map((col) => (
                                <td key={col.name} className="px-3 py-2 text-gray-800 max-w-[200px] truncate" title={String(row[col.name] ?? "")}>
                                  {row[col.name] === null ? (
                                    <span className="text-gray-300 italic">null</span>
                                  ) : typeof row[col.name] === "string" && row[col.name].length > 50 ? (
                                    row[col.name].substring(0, 50) + "..."
                                  ) : (
                                    String(row[col.name])
                                  )}
                                </td>
                              ))}
                              <td className="px-3 py-2 text-center whitespace-nowrap">
                                <button
                                  onClick={() => handleEdit(row)}
                                  className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors mr-1"
                                >
                                  แก้ไข
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(row)}
                                  className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                                >
                                  ลบ
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                      <p className="text-xs text-gray-500">
                        หน้า {pagination.currentPage} / {pagination.totalPages} (ทั้งหมด {pagination.totalItems} แถว)
                      </p>
                      <div className="flex gap-1">
                        <button
                          disabled={page <= 1}
                          onClick={() => handlePageChange(page - 1)}
                          className="px-3 py-1 text-xs border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ◀ ก่อนหน้า
                        </button>
                        <button
                          disabled={page >= pagination.totalPages}
                          onClick={() => handlePageChange(page + 1)}
                          className="px-3 py-1 text-xs border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ถัดไป ▶
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* SQL Console */}
                <div className="bg-white rounded-xl shadow-md p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      SQL Console
                    </h3>
                    <label className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs rounded-lg hover:bg-blue-100 transition-colors cursor-pointer flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      นำเข้าไฟล์ .sql
                      <input type="file" accept=".sql,.txt" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => { setSqlQuery(ev.target?.result as string || ''); };
                          reader.readAsText(file);
                        }
                        e.target.value = '';
                      }} />
                    </label>
                  </div>
                  <div className="mb-3">
                    <textarea
                      value={sqlQuery}
                      onChange={(e) => setSqlQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); handleExecuteSQL(); } }}
                      placeholder={"พิมพ์ SQL หรือนำเข้าไฟล์ .sql ได้เลย\nรองรับหลายคำสั่งพร้อมกัน เช่น INSERT, UPDATE, DELETE, SELECT\nกด Ctrl+Enter เพื่อรัน"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none resize-y min-h-[120px] text-gray-900 bg-white"
                      rows={5}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[10px] text-gray-400">รองรับ: SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP | หลายคำสั่งคั่นด้วย ; | Ctrl+Enter = รัน</p>
                      <button
                        onClick={handleExecuteSQL}
                        disabled={sqlLoading || !sqlQuery.trim()}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        {sqlLoading ? "กำลังรัน..." : "▶ Execute"}
                      </button>
                    </div>
                  </div>
                  {sqlError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3 mb-3 font-mono">{sqlError}</div>
                  )}
                  {sqlResult && Array.isArray(sqlResult) && sqlResult.length > 0 && (
                    <div className="overflow-x-auto border rounded-lg max-h-[300px] overflow-y-auto">
                      <table className="min-w-full text-xs">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            {Object.keys(sqlResult[0]).map((key) => (
                              <th key={key} className="px-3 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {sqlResult.map((r: any, i: number) => (
                            <tr key={i} className="hover:bg-gray-50">
                              {Object.values(r).map((v: any, j: number) => (
                                <td key={j} className="px-3 py-1.5 text-gray-800 whitespace-nowrap">{v === null ? <span className="text-gray-300">null</span> : String(v)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {sqlResult && Array.isArray(sqlResult) && sqlResult.length === 0 && (
                    <p className="text-xs text-gray-400 italic">ไม่มีผลลัพธ์</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {editingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setEditingRow(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b bg-gray-50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-800">แก้ไขข้อมูล</h3>
              <p className="text-xs text-gray-500 mt-1">{tables.find(t => t.name === selectedTable)?.label} ({selectedTable})</p>
            </div>
            <div className="p-6 space-y-3">
              {displayCols.map((col) => {
                const tableInfo = tables.find(t => t.name === selectedTable);
                const pks = tableInfo ? (Array.isArray(tableInfo.primaryKey) ? tableInfo.primaryKey : [tableInfo.primaryKey]) : [];
                const isPK = pks.includes(col.name);
                return (
                  <div key={col.name}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {col.name}
                      {isPK && <span className="ml-1 text-yellow-600">(PK - ไม่สามารถแก้ไขได้)</span>}
                      <span className="text-gray-400 ml-1">({col.type})</span>
                    </label>
                    <input
                      type="text"
                      value={editData[col.name] ?? ""}
                      onChange={(e) => setEditData({ ...editData, [col.name]: e.target.value || null })}
                      disabled={isPK}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2B4C8C] focus:border-transparent outline-none text-gray-900 ${isPK ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                    />
                  </div>
                );
              })}
            </div>
            <div className="p-4 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-2">
              <button onClick={() => setEditingRow(null)} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors">
                ยกเลิก
              </button>
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-[#2B4C8C] text-white text-sm rounded-lg hover:bg-[#1e3a6e] transition-colors">
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">ยืนยันการลบ</h3>
              <p className="text-sm text-gray-500 mb-1">ต้องการลบข้อมูลนี้จากตาราง <b>{selectedTable}</b> หรือไม่?</p>
              <div className="bg-gray-50 rounded-lg p-3 text-left text-xs font-mono mt-3 max-h-32 overflow-y-auto">
                {Object.entries(getPrimaryKeyValues(deleteConfirm)).map(([k, v]) => (
                  <div key={k}><span className="text-gray-500">{k}:</span> <span className="text-red-600 font-semibold">{String(v)}</span></div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t flex gap-2 justify-center">
              <button onClick={() => setDeleteConfirm(null)} className="px-6 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors">
                ยกเลิก
              </button>
              <button onClick={handleDelete} className="px-6 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors">
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
