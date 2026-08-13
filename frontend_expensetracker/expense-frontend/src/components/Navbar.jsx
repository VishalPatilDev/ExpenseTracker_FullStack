import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <nav className="navbar">

            <div className="navbar-brand">
                Expense Tracker
            </div>

            <div className="navbar-links">

                <Link to="/dashboard">
                    Dashboard
                </Link>

                <Link to="/expense">
                    Expense
                </Link>

                <Link to="/list">
                    List
                </Link>

                <Link to="/settings">
                    Settings
                </Link>

            </div>

        </nav>
    );
};

export default Navbar;