import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { API_URL } from '../../constant'
import Modal from '../../components/Modal'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { useNavigate } from 'react-router-dom'

export default function Data() {
    const [lendings, setLendings] = useState([])
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [alert, setAlert] = useState({ show: false, message: '', type: '' })
    const [detailLending, setDetailLending] = useState(null)
    const [formData, setFormData] = useState({
        lending_id: '',
        total_good_stuff: 0,
        total_defec_stuff: 0,
        date: ''
    })

    const navigate = useNavigate()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = () => {
        setIsLoading(true)
        axios.get(`${API_URL}/lendings`)
            .then((res) => {
                setLendings(res.data.data || [])
                setIsLoading(false)
            })
            .catch((err) => {
                if (err.response?.status === 401) {
                    localStorage.removeItem('access_token')
                    localStorage.removeItem('user')
                    navigate('/login')
                }
                setAlert({ show: true, message: 'Failed to fetch data', type: 'danger' })
                setIsLoading(false)
            })
    }

    const handleBtnCreate = (lending) => {
        setDetailLending(lending)
        setFormData({
            ...formData,
            lending_id: lending.id,
        })
        setIsModalOpen(true)
    }

    const handleBtnDetail = (lending) => {
        setDetailLending(lending)
        setFormData({
            lending_id: lending.id,
            total_good_stuff: lending.restoration?.total_good_stuff || 0,
            total_defec_stuff: lending.restoration?.total_defec_stuff || 0,
            date: new Date(lending.restoration?.created_at).toLocaleDateString("id-ID", { dateStyle: "long" })
        })
        setIsDetailModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            await axios.post(`${API_URL}/restorations`, formData)
            setAlert({ show: true, message: 'Restoration created successfully', type: 'success' })
            setDetailLending(null)
            setIsLoading(false)
            setIsModalOpen(false)
            fetchData()
        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.removeItem('access_token')
                localStorage.removeItem('user')
                navigate('/login')
            }
            setIsLoading(false)
            setAlert({ show: true, message: 'Failed to create restoration', type: 'danger' })
        }
    }

    const exportExcel = () => {
        const data = lendings.map((l, i) => ({
            No: i + 1,
            Name: l.name,
            'Stuff Name': l.stuff?.name || '-',
            'Total Stuff': l.total_stuff || 0,
            DateOFLending: new Date(l.created_at).toLocaleDateString("id-ID", { dateStyle: "long" }),
            RestorationStatus: l.restoration ? 'Restored' : '-',
            RestorationTotalGoodStuff: l.restoration?.total_good_stuff || 0,
            RestorationTotalDefecStuff: l.restoration?.total_defec_stuff || 0,
            RestorationDate: l.restoration?.created_at ? new Date(l.restoration?.created_at).toLocaleDateString("id-ID", { dateStyle: "long" }) : '-'
        }))
        const sheet = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, sheet, "Lendings Data")
        const blob = new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        saveAs(blob, 'lendings.xlsx')
    }

    const dismissAlert = () => {
        setAlert({ show: false, message: '', type: '' });
    }

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="container py-4">
                {alert.show && (
                    <div className={`alert alert-${alert.type} alert-dismissible fade show d-flex justify-content-between align-items-center`}>
                        <span>{alert.message}</span>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={dismissAlert}
                        ></button>
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger alert-dismissible fade show d-flex justify-content-between align-items-center">
                        <span>{error}</span>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setError('')}
                        ></button>
                    </div>
                )}

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="h3 mb-0">Lending History</h1>
                    <div>
                        <button className="btn btn-success shadow-sm" onClick={exportExcel}>
                            <i className="bi bi-file-earmark-excel me-2"></i>
                            Export
                        </button>
                    </div>
                </div>

                <div className="card shadow-sm">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="bg-light">
                                    <tr className="align-middle">
                                        <th className="px-4" rowSpan={2}>No</th>
                                        <th className="px-4" rowSpan={2}>Name</th>
                                        <th className="px-4 text-center" colSpan={2}>Stuff Details</th>
                                        <th className="px-4" rowSpan={2}>Date</th>
                                        <th className="px-4 text-center" rowSpan={2}>Actions</th>
                                    </tr>
                                    <tr>
                                        <th className="px-4 text-center">Name</th>
                                        <th className="px-4 text-center">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lendings.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4 text-muted">
                                                <i className="bi bi-inbox fs-4 d-block mb-2"></i>
                                                No lending records found
                                            </td>
                                        </tr>
                                    ) : lendings.map((lending, index) => (
                                        <tr key={lending.id}>
                                            <td className="px-4">{index + 1}</td>
                                            <td className="px-4">{lending.name || '-'}</td>
                                            <td className="px-4 text-center">{lending.stuff?.name || '-'}</td>
                                            <td className="px-4 text-center">{lending.total_stuff || '-'}</td>
                                            <td className="px-4">{new Date(lending.created_at).toLocaleDateString("id-ID", { dateStyle: "long" })}</td>
                                            <td className="px-4 text-center">
                                                {
                                                    lending.restoration ? (
                                                        <button
                                                            className="btn btn-sm btn-success"
                                                            onClick={() => handleBtnDetail(lending)}
                                                        >
                                                            <i className="bi bi-check-circle me-2"></i>
                                                            Detail Restoration
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="btn btn-sm btn-primary"
                                                            onClick={() => handleBtnCreate(lending)}
                                                        >
                                                            <i className="bi bi-plus-circle me-2"></i>
                                                            Create Restoration
                                                        </button>
                                                    )
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Restoration Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create Restoration"
                size="md"
            >
                <form onSubmit={handleSubmit}>
                    <div className='alert alert-info'>
                        Lending <b>{detailLending?.name}</b> with total <b>{detailLending?.total_stuff}</b> stuff will be restored.
                    </div>
                    <div className="mb-3">
                        <label htmlFor="total_good_stuff" className="form-label">Total Good Stuff</label>
                        <input
                            type="number"
                            className="form-control"
                            id="total_good_stuff"
                            value={formData.total_good_stuff}
                            onChange={(e) => setFormData({ ...formData, total_good_stuff: parseInt(e.target.value) })}
                            required
                            min="0"
                            max={detailLending?.total_stuff || 0}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="total_defec_stuff" className="form-label">Total Defective Stuff</label>
                        <input
                            type="number"
                            className="form-control"
                            id="total_defec_stuff"
                            value={formData.total_defec_stuff}
                            onChange={(e) => setFormData({ ...formData, total_defec_stuff: parseInt(e.target.value) })}
                            required
                            min="0"
                            max={detailLending?.total_stuff || 0}
                        />
                    </div>
                    <div className="d-flex justify-content-end">
                        <button type="button" className="btn btn-secondary me-2" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Submit</button>
                    </div>
                </form>
            </Modal>

            {/* Detail Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title="Detail Restoration"
                size="md"
            >
                <div className="card border-0">
                    <div className="card-body p-0">
                        <div className="alert alert-info mb-4">
                            Restoration details for lending <b>{detailLending?.name}</b>
                        </div>

                        <div className="row mb-4">
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label className="form-label fw-bold text-muted small">Lending Information</label>
                                    <div className="card bg-light">
                                        <div className="card-body">
                                            <p className="mb-1"><span className="fw-bold">Name:</span> {detailLending?.name}</p>
                                            <p className="mb-1"><span className="fw-bold">Stuff:</span> {detailLending?.stuff?.name || '-'}</p>
                                            <p className="mb-0"><span className="fw-bold">Total Lending:</span> {detailLending?.total_stuff || 0}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label className="form-label fw-bold text-muted small">Restoration Information</label>
                                    <div className="card bg-light">
                                        <div className="card-body">
                                            <p className="mb-1"><span className="fw-bold">Date:</span> {formData.date}</p>
                                            <p className="mb-0"><span className="fw-bold">Status:</span> <span className="badge bg-success">Completed</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row mb-4">
                            <div className="col-12">
                                <label className="form-label fw-bold text-muted small">Return Summary</label>
                                <div className="table-responsive">
                                    <table className="table table-bordered">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Condition</th>
                                                <th className="text-center">Quantity</th>
                                                <th className="text-center">Percentage</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Good Condition</td>
                                                <td className="text-center">{detailLending?.restoration?.total_good_stuff || 0}</td>
                                                <td className="text-center">
                                                    {detailLending && detailLending.total_stuff > 0
                                                        ? `${((detailLending.restoration?.total_good_stuff || 0) / detailLending.total_stuff * 100).toFixed(1)}%`
                                                        : '0%'}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Defective Condition</td>
                                                <td className="text-center">{detailLending?.restoration?.total_defec_stuff || 0}</td>
                                                <td className="text-center">
                                                    {detailLending && detailLending.total_stuff > 0
                                                        ? `${((detailLending.restoration?.total_defec_stuff || 0) / detailLending.total_stuff * 100).toFixed(1)}%`
                                                        : '0%'}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table> 
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    )
}