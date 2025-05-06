import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../constant";
import Modal from "../../components/Modal";
import * as XLSX from "xlsx";
import { saveAs} from "file-saver";

export default function StuffIndex() {
    const [stuffs, setStuffs] = useState([]);
    const [error, setError] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formModal, setFormModal] = useState({ name: '', type: '' });
    const [alert, setAlert] = useState("");

    const [formInbound, setFormInbound] = useState ({
        stuff_id: "",
        total: 0,
        proof_file: null
    });
    const [isInboundModalOpen, setIsInboundModalOpen] = useState(false);


    const [selectedStuff, setSelectedStuff] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    function fetchData() {
        axios.get(API_URL + "/stuffs")
        .then(res => {
            setStuffs(res.data.data);
        })
        .catch(err => {
            if (err.response.status === 401) {
                localStorage.clear();
                navigate("/login");
            }
            setError(err.response.data);
        });
    }

    function handleInboundBtn(stuffId) {
        //simpan value.id yanng diambil param stuffid ke formInbound.stuff_id
        //stuff_id dari state formInbound
        //stuffid dari parameter (stuffid) dari btn -> handleInboundBtn(value.id)
        setFormInbound({...formInbound, stuff_id: stuffId})
        //ubah nilai state
        setIsInboundModalOpen(true);
    }

    function handleInboundSubmit(e){
        e.preventDefault();
        const data = new FormData();
        data.append("stuff_id", formInbound.stuff_id);
        data.append("total", formInbound.total); 
        data.append("total", formInbound.total);
        data.append("proof_file", formInbound.proof_file);

        axios.post(API_URL+"/inbound-stuffs", data)
        .then (res => {
            setIsInboundModalOpen(false);
            setFormInbound({
                stuff_id: "",
                total: 0,
                proof_file: null
            });
            setAlert("Success add data inbound stuff");
            fetchData();
        })

    }
    function handleSubmitModal(e) {
        e.preventDefault();
        axios.post(API_URL + "/stuffs", formModal)
        .then(() => {
            setIsModalOpen(false);
            setAlert("Success add new data stuff");
            setFormModal({ name: '', type: '' });
            setError(null);
            fetchData();
        })
        .catch(err => {
            if (err.response.status === 401) {
                localStorage.clear();
                navigate("/login");
            }
            setError(err.response.data || { message: "Something went wrong." });
        });
    }

    function handleEditSubmit(e) {
        e.preventDefault();
        axios.patch(`${API_URL}/stuffs/${selectedStuff.id}`, formModal)
        .then(() => {
            setIsEditModalOpen(false);
            setSelectedStuff(null);
            setAlert("Success update stuff");
            setFormModal({ name: '', type: '' });
            setError(null);
            fetchData();
        })
        .catch(err => {
            if (err.response.status === 401) {
                localStorage.clear();
                navigate("/login");
            }
            setError(err.response.data || { message: "Something went wrong." });
        });
    }

    function handleDelete() {
        axios.delete(`${API_URL}/stuffs/${selectedStuff.id}`)
        .then(() => {
            setIsDeleteModalOpen(false);
            setSelectedStuff(null);
            setAlert("Success delete stuff");
            setError(null);
            fetchData();
        })
        .catch(err => {
            if (err.response.status === 401) {
                localStorage.clear();
                navigate("/login");
            }
            setError(err.response.data || { message: "Something went wrong." });
        });
    }

    function exportExcel() {
        const formattedData = stuffs.map((item, index) => ({
            No: index + 1,
            Title: item.name, 
            Type: item.type,
            TotalAvailable: item.stuff_stock ? item.stuff_stock.total_available : 0,
            TotalDefec: item.stuff_stock ? item.stuff_stock.total_defec : 0
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet 1");
        const excelBuffer = XLSX.write(workbook, {bookType:"xlsx", type:"array"});
        const file = new Blob([excelBuffer], { type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
        saveAs(file, "data_stuffs.xlsx");
    }

    return (
        <>
        {alert && <div className="alert alert-success">{alert}</div>}

        <div className="d-flex justify-content-end mt-3">
            <button className="btn btn-success me-3" onClick={exportExcel}>Export Excel</button>
            <button className="btn btn-primary" onClick={() => {
                setIsModalOpen(true);
                setFormModal({ name: '', type: '' });
                setError(null);
            }}>+ ADD</button>
        </div>

        <table className="table table-bordered m-5">
            <thead>
                <tr className="fw-bold">
                    <td rowSpan={2}>#</td>
                    <td rowSpan={2}>Name</td>
                    <td rowSpan={2}>Type</td>
                    <td colSpan={2}>Stock</td>
                    <td rowSpan={2}></td>
                </tr>
                <tr className="fw-bold">
                    <td>Available</td>
                    <td>Defec</td>
                </tr>
            </thead>
            <tbody>
                {stuffs.map((value, index) => {
                    const defec = value.stuff_stock ? value.stuff_stock.total_defec : "0";
                    const isDefecLow = defec < 3 && defec > 0;
                    return (
                        <tr key={value.id}>
                            <td>{index + 1}</td>
                            <td>{value.name}</td>
                            <td>{value.type}</td>
                            <td>{value.stuff_stock ? value.stuff_stock.total_available : "0"}</td>
                            <td className={isDefecLow ? "text-danger" : ""}>{defec}</td>
                            <td className="w-25">
                                <button className="btn btn-success" onClick={() => handleInboundBtn(value.id)} >Add Stock</button>
                                <button className="btn btn-info mx-2" onClick={() => {
                                    setSelectedStuff(value);
                                    setFormModal({ name: value.name, type: value.type });
                                    setIsEditModalOpen(true);
                                    setError(null);
                                }}>Edit</button>
                                <button className="btn btn-danger" onClick={() => {
                                    setSelectedStuff(value);
                                    setIsDeleteModalOpen(true);
                                    setError(null);
                                }}>Delete</button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>

        {/* ADD MODAL */}
        {/* () => kapan kita ngambil function pake arrow : klo functionnya ada argumen */}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Stuff">
            <form onSubmit={handleSubmitModal}>
                {error && (
                    <div className="alert alert-danger text-danger m-2 p-2">
                        {
                            error.data ?
                            Object.entries(error.data).map(([key, value]) => <div key={key}>{value}</div>) :
                            <div>{error.message || "Something went wrong."}</div>
                        }
                    </div>
                )}
                <div className="form-group">
                    <label className="form-label">Name <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" value={formModal.name} onChange={(e) => setFormModal({ ...formModal, name: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label">Type <span className="text-danger">*</span></label>
                    <select className="form-select" value={formModal.type} onChange={(e) => setFormModal({ ...formModal, type: e.target.value })}>
                        <option value="">-- Select Type --</option>
                        <option value="HTL/KLN">HTL/KLN</option>
                        <option value="Lab">Lab</option>
                        <option value="Sarpras">Sarpras</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-primary mt-2">ADD</button>
            </form>
        </Modal>

        {/* Edit MODAL */}
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Stuff">
            <form onSubmit={handleEditSubmit}>
                {error && (
                    <div className="alert alert-danger text-danger m-2 p-2">
                        {
                            error.data ?
                            Object.entries(error.data).map(([key, value]) => <div key={key}>{value}</div>) :
                            <div>{error.message || "Something went wrong."}</div>
                        }
                    </div>
                )}
                <div className="form-group">
                    <label className="form-label">Name <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" value={formModal.name} onChange={(e) => setFormModal({ ...formModal, name: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label">Type <span className="text-danger">*</span></label>
                    <select className="form-select" value={formModal.type} onChange={(e) => setFormModal({ ...formModal, type: e.target.value })}>
                        <option value="">-- Select Type --</option>
                        <option value="HTL/KLN">HTL/KLN</option>
                        <option value="Lab">Lab</option>
                        <option value="Sarpras">Sarpras</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-primary mt-2">UPDATE</button>
            </form>
        </Modal>
                
        {/* Add stock */}
        <Modal isOpen={isInboundModalOpen} onClose={() => setIsInboundModalOpen(false)} title="Add stock">
            <form onSubmit={handleInboundSubmit}>
            {error && (
                <div className="alert alert-danger text-danger m-2 p-2">
                    {
                        error.data ?
                        Object.entries(error.data).map(([key, value]) => <div key={key}>{value}</div>) :
                        <div>{error.message || "Something went wrong."}</div>
                    }
                </div>
            )}
                <div className="form-group">
                    <label className="form-label">Total item <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" onChange={(e) => setFormInbound({ ...formInbound, total: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label">Proof file <span className="text-danger">*</span></label>
                   <input type="file" className="form-control" onChange={(e) => setFormInbound({ ...formInbound, proof_file: e.target.files[0] })} />
                </div>
                <button type="submit" className="btn btn-primary mt-2">Add stock</button>
            </form>
        </Modal>

        {/* DELETE MODAL */}
        <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Stuff Confirmation">
            {error && (
                <div className="alert alert-danger text-danger m-2 p-2">
                    {
                        error.data ?
                        Object.entries(error.data).map(([key, value]) => <div key={key}>{value}</div>) :
                        <div>{error.message || "Something went wrong."}</div>
                    }
                </div>
            )}
            <p>Are you sure you want to delete <strong>{selectedStuff?.name}</strong>?</p>
            <div className="d-flex justify-content-end">
                <button className="btn btn-secondary mx-2" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDelete}>Confirm Delete</button>
            </div>
        </Modal>
        </>
    );
}
