import React from "react";
import profileImage from "../assets/profile.jpg";

export default function Profile() {
    const userData = JSON.parse(localStorage.getItem("user"));

    return (
        <div className="container mt-5 d-flex justify-content-center">
            <div
                className="card shadow-lg p-4 border-0 rounded-4 text-center"
                style={{
                    maxWidth: "500px",
                    backgroundColor: "#F8E8EE",
                    color: "#4A4A4A"
                }}
            >
                {/* Gambar profil */}
                <div className="position-relative">
                    <img
                        src={profileImage}
                        alt="Profile"
                        className="rounded-circle mx-auto d-block mb-3 border border-3 border-secondary"
                        style={{ width: "100px", height: "100px" }}
                    />
                    {/* Tanda status online */}
                    <span className="badge bg-success position-absolute top-0 start-100 translate-middle p-2 border border-light rounded-circle"></span>
                </div>

                {/* Nama user */}
                <h3 className="fw-bold" style={{ color: "#D63384" }}>
                    {userData?.nama || "User"}
                </h3>


                {/* Informasi detail */}
                <div className="text-start px-4">
                    <p><strong>Username:</strong> {userData?.username || "-"}</p>
                    <p><strong>Email:</strong> {userData?.email || "-"}</p>
                    <p><strong>Password:</strong> {userData?.password ? "********" : "-"}</p> {/* Jangan tampilkan password asli ya */}
                    <p><strong>Role:</strong> {userData?.role || "-"}</p>
                </div>

                {/* Tombol edit */}
                <button
                    className="btn mt-3 px-4 fw-semibold"
                    style={{ backgroundColor: "#D63384", color: "white" }}
                >
                    Edit Profile
                </button>
            </div>
        </div>
    );
}
