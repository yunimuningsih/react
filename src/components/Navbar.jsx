import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem("access_token");
    const user = JSON.parse(localStorage.getItem("user"));

    function logoutHandler() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        navigate("/login");
    }

    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">Inventaris</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        {!isLoggedIn ? (
                            <li className="nav-item">
                                <Link className="nav-link" to="/login">Login</Link>
                            </li>
                        ) : (
                            <>
                                {user?.role === "admin" ? (
                                    <>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/dashboard">Dashboard</Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/dashboard/admin/stuffs">Stuffs</Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/dashboard/admin/inbound">Inbound</Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/dashboard/profile">Profile</Link>
                                        </li>
                                        <li className="nav-item">
                                            <button className="nav-link btn btn-link" onClick={logoutHandler}>Logout</button>
                                        </li>
                                    </>
                                ) : user?.role === "staff" ? (
                                    <>
                                        <li className="nav-item dropdown">
                                            <button className="nav-link dropdown-toggle btn btn-link" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                Lendings
                                            </button>
                                            <ul className="dropdown-menu">
                                                <li><Link className="dropdown-item" to="/dashboard/staff/lending">New</Link></li>
                                                <li><Link className="dropdown-item" to="/dashboard/staff/lending/data">Data</Link></li>
                                            </ul>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/dashboard/profile">Profile</Link>
                                        </li>
                                        <li className="nav-item">
                                            <button className="nav-link btn btn-link" onClick={logoutHandler}>Logout</button>
                                        </li>
                                    </>
                                ) : null}
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}
