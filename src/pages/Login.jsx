import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
//nama func sama dengan nama file
export default function Login(){
    //state : menyimpan data di project react
    //login : nama datanya, setLogin : func untuk mengisi datanya
    //useState() : membuat state dan nilai default
    const [login, setLogin] = useState({
        username: "",
        password: ""
    });

    const [error, setError] = useState([]);

    let navigate = useNavigate();

    function loginProcess(e) {
        e.preventDefault(); //mengambil alih fungsi submit html agar ditangani oleh js
        axios.post("http://45.64.100.26:88/API-Lumen/public/login", login)
        .then(res => { 
            console.log(res);
            //ketika berhasil login, simpand ata token dan user di local storage
            localStorage.setItem("access_token", res.data.data.access_token);
            //JSON.stringify () : mengubah data menjadi string, local storage hanya bisa menyimpan string
            localStorage.setItem("user", JSON.stringify(res.data.data.user));
            //urutan titik setelah res(res.) disesuaikan isi res pada console.log
            //arahkan halaman ke dashbroad
            navigate("/dashboard");

        })
        .catch(err => {
            setError(err.response.data);
            
        })
    }
    //baris kode html disimpan di return
    return(
        <form className="card w-50 d-block mx-auto my-5" onSubmit={loginProcess}>
            <div className="card-header text-center fw-bold fs-3">Login</div>
            {
                Object.keys(error).length > 0 ? (
                    <ol className="alert alert-danger text-danger m-2 p-2">
                    { 
                        Object.entries(error.data).length > 0 ? 
                        Object.entries(error.data).map(([key, value]) =>(
                            <li>{value}</li>
                        )) : error.message
                    } 
                    </ol>
                ) : ''
            }
            <div className="card-body">
                <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input type="text" className="form-control" id="username" placeholder="Masukan Username" onChange={(e) => setLogin({...login, username : e.target.value})} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control" id="password" placeholder="Masukan Password" onChange={(e) => setLogin({...login, password : e.target.value})} />
                </div>
                <div className="d-grid">
                    <button className="btn btn-primary" type="submit">Login</button>
                </div>
            </div>
        </form>
    )
}