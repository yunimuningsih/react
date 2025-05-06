import React from "react";

export default function Modal({isOpen, onClose, title, children}) {
    if (!isOpen) return null; // jika data isOpen pada parent false, maka modal tidak dimunculkan
    return (
        <div className="modal show fade d-block" tabindex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">{title}</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={onClose}></button>
                </div>
                <div className="modal-body">
                    {/* children : parameter bawaan react yg digunakan untuk mengambil isi tag component pada parent */}
                    {children}
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={onClose}>Close</button>
                </div>
                </div>
            </div>
        </div>
    )
}