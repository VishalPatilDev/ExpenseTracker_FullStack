import React, { useEffect, useState } from 'react'
import api from '../api/api';
import deletebutton from '../assets/delete-icon.jpg'
import { FaTrash } from 'react-icons/fa';

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

    const [editingContactId, setEditingContactId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [categoryName, setCategoryName] = useState("");

    const handleEdit = (item) => {
        setEditingContactId(item.id);

        setContact({
            name: item.name,
            phoneNumber: item.phoneNumber,
            email: item.email,
        });

        setIsEditing(true);
        setShowContactForm(true);
    };

    const updateContact = async (e) => {
        e.preventDefault();

        try {
            const response = await api.put(
                `/pjsofttech/user/${editingContactId}`,
                {
                    name: contact.name,
                    phoneNumber: contact.phoneNumber,
                    email: contact.email,
                }
            );

            alert("Contact updated successfully");

            // Update the table immediately
            setContacts((prevContacts) =>
                prevContacts.map((item) =>
                    item.id === response.data.id
                        ? response.data
                        : item
                )
            );

            // Reset form
            setContact({
                name: "",
                phoneNumber: "",
                email: "",
            });

            setEditingContactId(null);
            setIsEditing(false);
            setShowContactForm(false);

        } catch (error) {
            console.error("Error updating contact:", error);

            alert(
                error.response?.data?.message ||
                "Failed to update contact"
            );
        }
    };


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

    //Delete Contact
    const deleteContact = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this contact?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(`/pjsofttech/user/${id}`);

            alert("Contact deleted successfully");

            // Remove deleted contact from UI immediately
            setContacts((prevContacts) =>
                prevContacts.filter((item) => item.id !== id)
            );

            // If the deleted contact was being edited, reset the form
            if (editingContactId === id) {
                setEditingContactId(null);
                setIsEditing(false);
                setShowContactForm(false);

                setContact({
                    name: "",
                    phoneNumber: "",
                    email: "",
                });
            }

        } catch (error) {
            console.error("Error deleting contact:", error);

            alert(
                error.response?.data?.message ||
                "Failed to delete contact"
            );
        }
    };
    // DELETE CATEGORY
    const deleteCategory = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this category?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(`/pjsofttech/category/${id}`);

            alert("Category deleted successfully");

            // Remove category immediately from UI
            setCategories((prevCategories) =>
                prevCategories.filter((item) => item.id !== id)
            );

        } catch (error) {
            console.error("Error deleting category:", error);

            alert(
                error.response?.data?.message ||
                "Failed to delete category"
            );
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
                        <p>click on particular user to edit</p>

                        {/* CONTACT FORM */}
                        {showContactForm && (
                            <form className="form-card contact-form" onSubmit={isEditing ? updateContact : addContact}>

                                <input className="name-input"
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

                                <input className="phoneNumber-input"
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

                                <input className="email-input"
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
                                        {isEditing ? "Update" : "Save"}
                                    </button>

                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={() => {
                                            setShowContactForm(false);
                                            setIsEditing(false);
                                            setEditingContactId(null);

                                            setContact({
                                                name: "",
                                                phoneNumber: "",
                                                email: "",
                                            });
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>

                            </form>
                        )}
                        <div className="table-container">

                            {contacts.length === 0 ? (
                                <p className="empty-message">
                                    No contacts found.
                                </p>
                            ) : (

                                <table>

                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>PhoneNumber</th>
                                            <th>Email</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>

                                        {contacts.map((item, index) => (
                                            <tr key={item.id}
                                                onClick={() => handleEdit(item)}
                                                className="clickable-row"
                                            >
                                                <td>{item.id}</td>

                                                <td>
                                                    {item.name}
                                                </td>


                                                <td>
                                                    {item.phoneNumber}
                                                </td>

                                                <td>
                                                    {item.email}
                                                </td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="delete-button delete-button-hover"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteContact(item.id);
                                                        }}
                                                    >
                                                        <FaTrash></FaTrash>
                                                    </button>
                                                </td>
                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            )}

                        </div>

                        {/* CONTACT LIST */}
                        {/* <div className="list-container">

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

                        </div> */}
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
                        <div className="table-container">

                            {categories.length === 0 ? (
                                <p className="empty-message">
                                    No categories found.
                                </p>
                            ) : (

                                <table>

                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>

                                        {categories.map((item, index) => (

                                            <tr key={item.id}>

                                                <td>
                                                    {item.id}
                                                </td>


                                                <td>
                                                    {item.name}
                                                </td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="delete-button delete-button-hover"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteCategory(item.id)

                                                        }}
                                                    >
                                                        <FaTrash></FaTrash>
                                                    </button>
                                                </td>


                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            )}

                        </div>

                        {/* CATEGORY LIST */}
                        {/* <div className="list-container">

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

                        </div> */}

                    </div>
                )}

            </div>

        </div>
    )
}

export default Settings
