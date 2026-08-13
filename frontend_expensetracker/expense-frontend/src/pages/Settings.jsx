import React, { useEffect, useState } from 'react'
import api from '../api/api';

const Settings = () => {

    const [activeTab, setActiveTab] = useState("contacts");

    const [contacts, setContacts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [showContactForm, setShowContactForm] = useState(false);
    const [showCategoryForm, setShowCategoryForm] = useState(false);

    const [contact, setContact] = useState({
        name: "",
        phoneNumber: "",
        email: "",
    });

    const [categoryName, setCategoryName] = useState("");

    useEffect(() => {
        fetchContacts();
        fetchCategories();
    }, []);

    // -----------------------------
    // GET CONTACTS
    // -----------------------------
    const fetchContacts = async () => {
        try {
            const response = await api.get("/pjsofttech/user/users");

            setContacts(response.data);
        } catch (error) {
            console.error("Error fetching contacts:", error);
        }
    };

    // -----------------------------
    // GET CATEGORIES
    // -----------------------------
    const fetchCategories = async () => {
        try {
            const response = await api.get("/pjsofttech/category");

            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    // -----------------------------
    // ADD CONTACT
    // -----------------------------
    const addContact = async (e) => {
        e.preventDefault();

        try {
            await api.post("/pjsofttech/user", contact);

            alert("Contact added successfully");

            setContact({
                name: "",
                phoneNumber: "",
                email: "",
            });

            setShowContactForm(false);

            fetchContacts();
        } catch (error) {
            console.error("Error adding contact:", error);
            alert("Failed to add contact");
        }
    };

    // -----------------------------
    // ADD CATEGORY
    // -----------------------------
    const addCategory = async (e) => {
        e.preventDefault();

        try {
            await api.post("/pjsofttech/category", {
                name: categoryName,
            });

            alert("Category added successfully");

            setCategoryName("");
            setShowCategoryForm(false);

            fetchCategories();
        } catch (error) {
            console.error("Error adding category:", error);
            alert("Failed to add category");
        }
    };

    // -----------------------------
    // CHANGE TAB
    // -----------------------------
    const handleTabChange = (tab) => {
        setActiveTab(tab);

        setShowContactForm(false);
        setShowCategoryForm(false);
    };

    return (
        <div className="settings-container">

            {/* LEFT SIDEBAR */}
            <div className="settings-sidebar">

                <button
                    className={activeTab === "contacts" ? "active" : ""}
                    onClick={() => handleTabChange("contacts")}
                >
                    Users
                </button>

                <button
                    className={activeTab === "categories" ? "active" : ""}
                    onClick={() => handleTabChange("categories")}
                >
                    Categories
                </button>

            </div>

            {/* RIGHT CONTENT */}
            <div className="settings-content">

                {/* ================= CONTACTS ================= */}
                {activeTab === "contacts" && (
                    <div>

                        <div className="settings-header">
                            <h2>Users</h2>

                            <button
                                className="add-button"
                                onClick={() => setShowContactForm(!showContactForm)}
                            >
                                + Add User
                            </button>
                        </div>

                        {/* CONTACT FORM */}
                        {showContactForm && (
                            <form className="form-card" onSubmit={addContact}>

                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={contact.name}
                                    onChange={(e) =>
                                        setContact({
                                            ...contact,
                                            name: e.target.value,
                                        })
                                    }
                                    required
                                />

                                <input
                                    type="text"
                                    placeholder="Phone Number"
                                    value={contact.phoneNumber}
                                    onChange={(e) =>
                                        setContact({
                                            ...contact,
                                            phoneNumber: e.target.value,
                                        })
                                    }
                                    required
                                />

                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={contact.email}
                                    onChange={(e) =>
                                        setContact({
                                            ...contact,
                                            email: e.target.value,
                                        })
                                    }
                                    required
                                />

                                <div className="form-buttons">
                                    <button type="submit" className="save-button">
                                        Save Contact
                                    </button>

                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={() => setShowContactForm(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>

                            </form>
                        )}

                        {/* CONTACT LIST */}
                        <div className="list-container">

                            {contacts.length === 0 ? (
                                <p className="empty-message">
                                    No contacts found.
                                </p>
                            ) : (
                                contacts.map((item, index) => (
                                    <div className="list-item" key={index}>

                                        <div>
                                            <strong>{item.name}</strong>

                                            <p>
                                                {item.phoneNumber}
                                            </p>

                                            <p>
                                                {item.email}
                                            </p>
                                        </div>

                                    </div>
                                ))
                            )}

                        </div>

                    </div>
                )}

                {/* ================= CATEGORIES ================= */}
                {activeTab === "categories" && (
                    <div>

                        <div className="settings-header">
                            <h2>Categories</h2>

                            <button
                                className="add-button"
                                onClick={() =>
                                    setShowCategoryForm(!showCategoryForm)
                                }
                            >
                                + Add Category
                            </button>
                        </div>

                        {/* CATEGORY FORM */}
                        {showCategoryForm && (
                            <form className="form-card" onSubmit={addCategory}>

                                <input
                                    type="text"
                                    placeholder="Category Name"
                                    value={categoryName}
                                    onChange={(e) =>
                                        setCategoryName(e.target.value)
                                    }
                                    required
                                />

                                <div className="form-buttons">

                                    <button
                                        type="submit"
                                        className="save-button"
                                    >
                                        Save Category
                                    </button>

                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={() =>
                                            setShowCategoryForm(false)
                                        }
                                    >
                                        Cancel
                                    </button>

                                </div>

                            </form>
                        )}

                        {/* CATEGORY LIST */}
                        <div className="list-container">

                            {categories.length === 0 ? (
                                <p className="empty-message">
                                    No categories found.
                                </p>
                            ) : (
                                categories.map((item, index) => (
                                    <div
                                        className="list-item category-item"
                                        key={index}
                                    >
                                        {item.name}
                                    </div>
                                ))
                            )}

                        </div>

                    </div>
                )}

            </div>

        </div>
    )
}

export default Settings
