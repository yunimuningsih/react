import axios from "axios";
import React, { useEffect, useState } from "react";
import { API_URL } from "../../constant";
import Modal from "../../components/Modal";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Inbound() {
    const [inboundStuffs, setInboundStuffs] = useState([]);
    const [filteredStuffs, setFilteredStuffs] = useState([]);
    const [isDeleteModalInbound, setIsDeleteModalInbound] = useState(false);
    const [selectedInbound, setselectedInbound] = useState(null);
    const [error, setError] = useState([]);
    const [alert, setAlert] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // Jumlah data per halaman
    const [searchQuery, setSearchQuery] = useState("");

    const navigate = useNavigate();

    const chartData = chartDataByType(inboundStuffs);

    function chartDataByType(data) {
        const result = {};

        data.forEach(item => {
            const type = item.stuff.type;
            const total = item.total;

            if (!result[type]) {
                result[type] = total;
            } else {
                result[type] += total;
            }
        });

        return Object.keys(result).map(type => ({
            type,
            total: result[type]
        }));
    }

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setFilteredStuffs(inboundStuffs.filter(item =>
            item.stuff.name.toLowerCase().includes(searchQuery.toLowerCase())
        ));
    }, [searchQuery, inboundStuffs]);

    function fetchData() {
        axios.get(API_URL + "/inbound-stuffs")
            .then(res => {
                const data = res.data.data;
                setInboundStuffs(data);
                setFilteredStuffs(data);

                // Cek apakah ada stok yang menipis
                const lowStock = data.filter(item => item.total <= 1);
                if (lowStock.length > 0) {
                    const items = lowStock.map(item => `${item.stuff.name} (${item.total})`).join(", ");
                    setAlert(`⚠️ Stok menipis untuk: ${items}. Silakan tambahkan stok.`);
                } else {
                    setAlert("");
                }
            })
            .catch(err => {
                if (err.response.status === 401) {
                    localStorage.clear();
                    navigate("/login");
                }
                setError(err.response.data);
            });
    }

    function handleDelete() {
        axios.delete(API_URL + "/inbound-stuffs/" + selectedInbound.id)
            .then(() => {
                setIsDeleteModalInbound(false);
                setselectedInbound(null);
                setAlert("✅ Berhasil menghapus data inbound.");
                setError([]);
                fetchData();
            })
            .catch(err => {
                if (err.response.status === 401) {
                    localStorage.clear();
                    navigate("/login");
                }
                setError(err.response.data);
            });
    }

    function exportExcel() {
        const formattedData = inboundStuffs.map((item, index) => ({
            No: index + 1,
            StuffName: item.stuff.name,
            TotalItem: item.total,
            ProofFile: item.proof_file,
            Date: new Date(item.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet 1");
        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array"
        });
        const file = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        saveAs(file, "data_inboundStuffs.xlsx");
    }

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredStuffs.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredStuffs.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <>
            <h3 className="m-3">Grafik Total Inbound Stuff</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="5 5" stroke="#e0e0e0" />
                    <XAxis dataKey="type" stroke="#8884d8" />
                    <YAxis stroke="#8884d8" />
                    <Tooltip contentStyle={{ backgroundColor: "#f5f5f5", borderRadius: "5px" }} />

                    <Bar
                        dataKey="total"
                        barSize={150}
                        radius={[5, 5, 0, 0]}
                        animationDuration={1000}
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={
                                    entry.type === "Lab" ? "#FBDB93" :
                                        entry.type === "HTL/KLN" ? "#FFBB28" :
                                            entry.type === "Sarpras" ? "#FF8042" :
                                                "#8884d8" // warna default
                                }
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {alert !== "" && (
                <div className={`alert ${alert.includes("⚠️") ? "alert-warning" : "alert-success"}`}>
                    {alert}
                </div>
            )}

            <div className="d-flex justify-content-between my-3">
                <button className="btn btn-success" onClick={exportExcel}>Export Excel</button>
                <input
                    type="text"
                    className="form-control w-25"
                    placeholder="Search by Stuff Name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <table className="table table-bordered m-5">
                <thead>
                    <tr className="fw-bold">
                        <td rowSpan={2}>#</td>
                        <td rowSpan={2}>Stuff</td>
                        <td rowSpan={2}>Total New Item</td>
                        <td rowSpan={2}>Proof File</td>
                        <td rowSpan={2}></td>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((value, index) => (
                        <tr key={index}>
                            <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                            <td>{value.stuff.name}</td>
                            <td>{value.total}</td>
                            <td>
                                {value.proof_file ? (
                                    <a href={value.proof_file} target="_blank" rel="noreferrer">
                                        <img className="w-50 d-block mt-2" src={value.proof_file} alt="Proof" />
                                    </a>
                                ) : ''}
                            </td>
                            <td className="w-25">
                                <button className="btn btn-danger" onClick={() => {
                                    setselectedInbound(value);
                                    setIsDeleteModalInbound(true);
                                    setError([]);
                                }}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="d-flex justify-content-center">
                <nav>
                    <ul className="pagination">
                        <li className="page-item">
                            <button className="page-link" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                        </li>
                        {[...Array(totalPages)].map((_, index) => (
                            <li key={index} className="page-item">
                                <button className="page-link" onClick={() => paginate(index + 1)}>{index + 1}</button>
                            </li>
                        ))}
                        <li className="page-item">
                            <button className="page-link" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
                        </li>
                    </ul>
                </nav>
            </div>

            <Modal isOpen={isDeleteModalInbound} onClose={() => setIsDeleteModalInbound(false)} title="Delete Inbound Stuff">
                <p>Are you sure want to delete <strong>{selectedInbound?.stuff.name}</strong>?</p>
                <div className="d-flex justify-content-end">
                    <button className="btn btn-secondary mx-2" onClick={() => setIsDeleteModalInbound(false)}>Cancel</button>
                    <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
                </div>
            </Modal>
        </>
    );
}
