import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../constant";
import Modal from "../../components/Modal";

export default function Lending() {
    const [stuffs, setStuffs] = useState([]);
    const [error, setError] = useState(null);
    const [alert, setAlert] = useState("");
    const [isModalOpen, setModalOpen] = useState(false);
    const [formModal, setFormModal] = useState({
        stuff_id: "",
        name: "",
        total_stuff: 0,
        note: ""
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        axios.get(`${API_URL}/stuffs`)
            .then(res => setStuffs(res.data.data))
            .catch(err => {
                if (err.response?.status === 401) {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("user");
                    navigate("/login");
                }
                setError(err.response?.data || "Failed to fetch data.");
            });
    };

    const handleBtn = (stuffId) => {
        setFormModal({ ...formModal, stuff_id: stuffId });
        setModalOpen(true);
        setError(null);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        axios.post(`${API_URL}/lendings`, formModal)
            .then(() => {
                setModalOpen(false);
                setFormModal({ stuff_id: "", name: "", total_stuff: 0, note: "" });
                setAlert("Berhasil menambahkan peminjaman.");
                setTimeout(() => setAlert(""), 3000); // Auto clear alert
            })
            .catch(err => {
                if (err.response?.status === 401) {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("user");
                    navigate("/login");
                }
                setError(err.response?.data || "Something went wrong.");
            });
    };

    return (
        <>
            {alert && <div className="alert alert-success">{alert}</div>}

            <div className="row my-5">
                {stuffs.map((item, index) => (
                    <div className="col-4 mb-4" key={item.id}>
                        <div className="card text-center p-3">
                            <h5>{item.name}</h5>
                            <p>Total Available: {item.stuff_stock?.total_available || 0}</p>
                            <button
                                className="btn btn-outline-primary"
                                disabled={!(item.stuff_stock?.total_available > 0)}
                                onClick={() => handleBtn(item.id)}
                            >
                                {item.stuff_stock?.total_available > 0 ? 'Select' : 'Stock Not Available'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Add Lending">
                {error && (
                    <ol className="alert alert-danger m-2 p-2">
                        {Array.isArray(error?.data)
                            ? error.data.map(([key, value], idx) => <li key={idx}>{value}</li>)
                            : <li>{error.message || String(error)}</li>}
                    </ol>
                )}

                <form onSubmit={handleFormSubmit}>
                    <div className="form-group mb-3">
                        <label className="form-label">Name <span className="text-danger">*</span></label>
                        <input
                            type="text"
                            className="form-control"
                            value={formModal.name}
                            onChange={(e) => setFormModal({ ...formModal, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group mb-3">
                        <label className="form-label">Total Stuff <span className="text-danger">*</span></label>
                        <input
                            type="number"
                            className="form-control"
                            value={formModal.total_stuff}
                            onChange={(e) => setFormModal({ ...formModal, total_stuff: parseInt(e.target.value) || 0 })}
                            required
                            min="1"
                        />
                    </div>

                    <div className="form-group mb-3">
                        <label className="form-label">Note <span className="text-danger">*</span></label>
                        <input
                            type="text"
                            className="form-control"
                            value={formModal.note}
                            onChange={(e) => setFormModal({ ...formModal, note: e.target.value })}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary">Process</button>
                </form>
            </Modal>
        </>
    );
}
