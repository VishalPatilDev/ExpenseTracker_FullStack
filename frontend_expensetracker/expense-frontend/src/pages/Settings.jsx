import React, { useEffect, useState } from "react";
import api from "../api/api";
import { FaTrash, FaPencil } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const emptyContact = {
    name: "",
    phoneNumber: "",
    email: "",
    ifsc: "",
    accountType: "",
};

const emptyBank = {
    name: "",
    branch: "",
    accountNumber: "",
};

const Settings = () => {
    const [activeTab, setActiveTab] = useState("contacts");

    const [contacts, setContacts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [banks, setBanks] = useState([]);

    const [loading, setLoading] = useState(false);

    // -----------------------------
    // CONTACT
    // -----------------------------

    const [contact, setContact] = useState(emptyContact);

    const [showContactForm, setShowContactForm] =
        useState(false);

    const [editingContactId, setEditingContactId] =
        useState(null);

    // -----------------------------
    // CATEGORY
    // -----------------------------

    const [categoryName, setCategoryName] =
        useState("");

    const [showCategoryForm, setShowCategoryForm] =
        useState(false);

    // -----------------------------
    // BANK
    // -----------------------------

    const [bank, setBank] = useState(emptyBank);

    const [showBankForm, setShowBankForm] =
        useState(false);

    // -----------------------------
    // DELETE DIALOG
    // -----------------------------

    const [deleteDialog, setDeleteDialog] =
        useState({
            open: false,
            type: null,
            id: null,
            name: "",
        });

    // -----------------------------
    // FETCH DATA
    // -----------------------------

    useEffect(() => {
        fetchContacts();
        fetchCategories();
        fetchBanks();
    }, []);

    const fetchContacts = async () => {
        try {
            const response = await api.get(
                "/pjsofttech/user/users"
            );

            setContacts(response.data || []);
        } catch (error) {
            console.error(
                "Error fetching contacts:",
                error
            );
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get(
                "/pjsofttech/category"
            );

            setCategories(response.data || []);
        } catch (error) {
            console.error(
                "Error fetching categories:",
                error
            );
        }
    };

    const fetchBanks = async () => {
        try {
            const response = await api.get(
                "/pjsofttech/bank"
            );

            setBanks(response.data || []);
        } catch (error) {
            console.error(
                "Error fetching banks:",
                error
            );
        }
    };

    // -----------------------------
    // CONTACT
    // -----------------------------

    const handleEditContact = (item) => {
        setEditingContactId(item.id);

        setContact({
            name: item.name || "",
            phoneNumber: item.phoneNumber || "",
            email: item.email || "",
        });

        setShowContactForm(true);
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            if (editingContactId) {
                const response = await api.put(
                    `/pjsofttech/user/${editingContactId}`,
                    contact
                );

                setContacts((previous) =>
                    previous.map((item) =>
                        item.id === response.data.id
                            ? response.data
                            : item
                    )
                );

                alert(
                    "Contact updated successfully"
                );
            } else {
                const response = await api.post(
                    "/pjsofttech/user",
                    contact
                );

                setContacts((previous) => [
                    ...previous,
                    response.data,
                ]);

                alert(
                    "Contact added successfully"
                );
            }

            resetContactForm();
        } catch (error) {
            console.error(
                "Contact error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to save contact"
            );
        } finally {
            setLoading(false);
        }
    };

    const resetContactForm = () => {
        setContact(emptyContact);
        setEditingContactId(null);
        setShowContactForm(false);
    };

    // -----------------------------
    // CATEGORY
    // -----------------------------

    const addCategory = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const response = await api.post(
                "/pjsofttech/category",
                {
                    name: categoryName,
                }
            );

            setCategories((previous) => [
                ...previous,
                response.data,
            ]);

            alert(
                "Category added successfully"
            );

            setCategoryName("");
            setShowCategoryForm(false);
        } catch (error) {
            console.error(
                "Error adding category:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to add category"
            );
        } finally {
            setLoading(false);
        }
    };

    // -----------------------------
    // BANK
    // -----------------------------

    const addBank = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const response = await api.post(
                "/pjsofttech/bank",
                bank
            );

            setBanks((previous) => [
                ...previous,
                response.data,
            ]);

            alert("Bank added successfully");

            setBank(emptyBank);
            setShowBankForm(false);
        } catch (error) {
            console.error(
                "Error adding bank:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to add bank"
            );
        } finally {
            setLoading(false);
        }
    };

    // -----------------------------
    // DELETE
    // -----------------------------

    const openDeleteDialog = (
        type,
        id,
        name
    ) => {
        setDeleteDialog({
            open: true,
            type,
            id,
            name,
        });
    };

    const closeDeleteDialog = () => {
        setDeleteDialog({
            open: false,
            type: null,
            id: null,
            name: "",
        });
    };

    const confirmDelete = async () => {
        const {
            type,
            id,
        } = deleteDialog;

        try {
            setLoading(true);

            if (type === "contact") {
                await api.delete(
                    `/pjsofttech/user/${id}`
                );

                setContacts((previous) =>
                    previous.filter(
                        (item) => item.id !== id
                    )
                );

                if (editingContactId === id) {
                    resetContactForm();
                }

                alert(
                    "Contact deleted successfully"
                );
            }

            if (type === "category") {
                await api.delete(
                    `/pjsofttech/category/${id}`
                );

                setCategories((previous) =>
                    previous.filter(
                        (item) => item.id !== id
                    )
                );

                alert(
                    "Category deleted successfully"
                );
            }

            if (type === "bank") {
                await api.delete(
                    `/pjsofttech/bank/${id}`
                );

                setBanks((previous) =>
                    previous.filter(
                        (item) => item.id !== id
                    )
                );

                alert(
                    "Bank deleted successfully"
                );
            }

            closeDeleteDialog();
        } catch (error) {
            console.error(
                "Delete error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to delete"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted/40 p-4 md:p-6 lg:p-8">

            <div className="mx-auto max-w-7xl space-y-6">

                {/* HEADER */}

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Settings
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Manage users, categories and
                        bank accounts
                    </p>
                </div>

                {/* SETTINGS CARD */}

                <Card>

                    <CardHeader>
                        <CardTitle>
                            Manage Data
                        </CardTitle>
                    </CardHeader>

                    <CardContent>

                        <Tabs
                            value={activeTab}
                            onValueChange={(value) => {
                                setActiveTab(value);

                                setShowContactForm(false);
                                setShowCategoryForm(false);
                                setShowBankForm(false);
                            }}
                        >

                            {/* TAB NAVIGATION */}

                            <TabsList className="grid w-full max-w-md grid-cols-3">

                                <TabsTrigger value="contacts">
                                    Users
                                </TabsTrigger>

                                <TabsTrigger value="categories">
                                    Categories
                                </TabsTrigger>

                                <TabsTrigger value="banks">
                                    Banks
                                </TabsTrigger>

                            </TabsList>

                            {/* ================================================= */}
                            {/* CONTACTS */}
                            {/* ================================================= */}

                            <TabsContent
                                value="contacts"
                                className="mt-6 space-y-4"
                            >

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            Users
                                        </h2>

                                        <p className="text-sm text-muted-foreground">
                                            Click a user to edit
                                        </p>
                                    </div>

                                    <Button
                                        onClick={() => {
                                            if (
                                                showContactForm
                                            ) {
                                                resetContactForm();
                                            } else {
                                                setShowContactForm(
                                                    true
                                                );
                                            }
                                        }}
                                    >
                                        + Add User
                                    </Button>

                                </div>

                                {/* CONTACT FORM */}

                                <Dialog
                                    open={
                                        showContactForm
                                    }
                                    onOpenChange={(
                                        open
                                    ) => {
                                        if (!open) {
                                            resetContactForm();
                                        }
                                    }}
                                >

                                    <DialogContent>

                                        <DialogHeader>

                                            <DialogTitle>
                                                {editingContactId
                                                    ? "Edit User"
                                                    : "Add User"}
                                            </DialogTitle>

                                        </DialogHeader>

                                        <form
                                            onSubmit={
                                                handleContactSubmit
                                            }
                                            className="space-y-4"
                                        >

                                            <div className="space-y-2">
                                                <Label>
                                                    Name
                                                </Label>

                                                <Input
                                                    value={
                                                        contact.name
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        setContact(
                                                            {
                                                                ...contact,
                                                                name: e
                                                                    .target
                                                                    .value,
                                                            }
                                                        )
                                                    }
                                                    placeholder="Enter name"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>
                                                    Phone Number
                                                </Label>

                                                <Input
                                                    value={
                                                        contact.phoneNumber
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        setContact(
                                                            {
                                                                ...contact,
                                                                phoneNumber:
                                                                    e
                                                                        .target
                                                                        .value,
                                                            }
                                                        )
                                                    }
                                                    placeholder="Enter phone number"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>
                                                    Email
                                                </Label>

                                                <Input
                                                    type="email"
                                                    value={
                                                        contact.email
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        setContact(
                                                            {
                                                                ...contact,
                                                                email: e
                                                                    .target
                                                                    .value,
                                                            }
                                                        )
                                                    }
                                                    placeholder="Enter email"
                                                    required
                                                />
                                            </div>

                                            <div className="flex justify-end gap-2 pt-2">

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={
                                                        resetContactForm
                                                    }
                                                >
                                                    Cancel
                                                </Button>

                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        loading
                                                    }
                                                >
                                                    {loading
                                                        ? "Saving..."
                                                        : editingContactId
                                                            ? "Update"
                                                            : "Save"}
                                                </Button>

                                            </div>

                                        </form>

                                    </DialogContent>

                                </Dialog>

                                {/* CONTACT TABLE */}

                                <Card>

                                    <CardContent className="p-0">

                                        <div className="overflow-x-auto">

                                            <Table>

                                                <TableHeader>
                                                    <TableRow>

                                                        <TableHead>
                                                            ID
                                                        </TableHead>

                                                        <TableHead>
                                                            Name
                                                        </TableHead>

                                                        <TableHead>
                                                            Phone
                                                        </TableHead>

                                                        <TableHead>
                                                            Email
                                                        </TableHead>

                                                        <TableHead className="text-right">
                                                            Action
                                                        </TableHead>

                                                    </TableRow>
                                                </TableHeader>

                                                <TableBody>

                                                    {contacts.length ===
                                                        0 ? (
                                                        <TableRow>
                                                            <TableCell
                                                                colSpan={
                                                                    5
                                                                }
                                                                className="h-24 text-center text-muted-foreground"
                                                            >
                                                                No users found.
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        contacts.map(
                                                            (
                                                                item
                                                            ) => (
                                                                <TableRow
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    className="cursor-pointer hover:bg-muted/50"
                                                                    onClick={() =>
                                                                        handleEditContact(
                                                                            item
                                                                        )
                                                                    }
                                                                >

                                                                    <TableCell>
                                                                        {
                                                                            item.id
                                                                        }
                                                                    </TableCell>

                                                                    <TableCell className="font-medium">
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </TableCell>

                                                                    <TableCell>
                                                                        {
                                                                            item.phoneNumber
                                                                        }
                                                                    </TableCell>

                                                                    <TableCell>
                                                                        {
                                                                            item.email
                                                                        }
                                                                    </TableCell>

                                                                    <TableCell className="text-right">

                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                            onClick={(
                                                                                e
                                                                            ) => {
                                                                                e.stopPropagation();

                                                                                openDeleteDialog(
                                                                                    "contact",
                                                                                    item.id,
                                                                                    item.name
                                                                                );
                                                                            }}
                                                                        >
                                                                            <FaTrash className="h-4 w-4" />
                                                                        </Button>

                                                                    </TableCell>

                                                                </TableRow>
                                                            )
                                                        )
                                                    )}

                                                </TableBody>

                                            </Table>

                                        </div>

                                    </CardContent>

                                </Card>

                            </TabsContent>

                            {/* ================================================= */}
                            {/* CATEGORIES */}
                            {/* ================================================= */}

                            <TabsContent
                                value="categories"
                                className="mt-6 space-y-4"
                            >

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            Categories
                                        </h2>

                                        <p className="text-sm text-muted-foreground">
                                            Manage expense categories
                                        </p>
                                    </div>

                                    <Button
                                        onClick={() =>
                                            setShowCategoryForm(
                                                true
                                            )
                                        }
                                    >
                                        + Add Category
                                    </Button>

                                </div>

                                {/* CATEGORY FORM */}

                                <Dialog
                                    open={
                                        showCategoryForm
                                    }
                                    onOpenChange={
                                        setShowCategoryForm
                                    }
                                >

                                    <DialogContent>

                                        <DialogHeader>

                                            <DialogTitle>
                                                Add Category
                                            </DialogTitle>

                                        </DialogHeader>

                                        <form
                                            onSubmit={
                                                addCategory
                                            }
                                            className="space-y-4"
                                        >

                                            <div className="space-y-2">

                                                <Label>
                                                    Category Name
                                                </Label>

                                                <Input
                                                    value={
                                                        categoryName
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        setCategoryName(
                                                            e
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    placeholder="e.g. Food"
                                                    required
                                                />

                                            </div>

                                            <div className="flex justify-end gap-2">

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setCategoryName(
                                                            ""
                                                        );
                                                        setShowCategoryForm(
                                                            false
                                                        );
                                                    }}
                                                >
                                                    Cancel
                                                </Button>

                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        loading
                                                    }
                                                >
                                                    {loading
                                                        ? "Saving..."
                                                        : "Save Category"}
                                                </Button>

                                            </div>

                                        </form>

                                    </DialogContent>

                                </Dialog>

                                {/* CATEGORY TABLE */}

                                <Card>

                                    <CardContent className="p-0">

                                        <div className="overflow-x-auto">

                                            <Table>

                                                <TableHeader>

                                                    <TableRow>

                                                        <TableHead>
                                                            ID
                                                        </TableHead>

                                                        <TableHead>
                                                            Name
                                                        </TableHead>

                                                        <TableHead className="text-right">
                                                            Action
                                                        </TableHead>

                                                    </TableRow>

                                                </TableHeader>

                                                <TableBody>

                                                    {categories.length ===
                                                        0 ? (
                                                        <TableRow>
                                                            <TableCell
                                                                colSpan={
                                                                    3
                                                                }
                                                                className="h-24 text-center text-muted-foreground"
                                                            >
                                                                No categories found.
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        categories.map(
                                                            (
                                                                item
                                                            ) => (
                                                                <TableRow
                                                                    key={
                                                                        item.id
                                                                    }
                                                                >

                                                                    <TableCell>
                                                                        {
                                                                            item.id
                                                                        }
                                                                    </TableCell>

                                                                    <TableCell className="font-medium">
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </TableCell>

                                                                    <TableCell className="text-right">

                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                            onClick={() =>
                                                                                openDeleteDialog(
                                                                                    "category",
                                                                                    item.id,
                                                                                    item.name
                                                                                )
                                                                            }
                                                                        >
                                                                            <FaTrash />
                                                                        </Button>

                                                                    </TableCell>

                                                                </TableRow>
                                                            )
                                                        )
                                                    )}

                                                </TableBody>

                                            </Table>

                                        </div>

                                    </CardContent>

                                </Card>

                            </TabsContent>

                            {/* ================================================= */}
                            {/* BANKS */}
                            {/* ================================================= */}

                            <TabsContent
                                value="banks"
                                className="mt-6 space-y-4"
                            >

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            Banks
                                        </h2>

                                        <p className="text-sm text-muted-foreground">
                                            Manage your bank accounts
                                        </p>
                                    </div>

                                    <Button
                                        onClick={() =>
                                            setShowBankForm(
                                                true
                                            )
                                        }
                                    >
                                        + Add Bank
                                    </Button>

                                </div>

                                {/* BANK FORM */}

                                <Dialog
                                    open={
                                        showBankForm
                                    }
                                    onOpenChange={(
                                        open
                                    ) => {
                                        setShowBankForm(
                                            open
                                        );

                                        if (!open) {
                                            setBank(
                                                emptyBank
                                            );
                                        }
                                    }}
                                >

                                    <DialogContent>

                                        <DialogHeader>

                                            <DialogTitle>
                                                Add Bank
                                            </DialogTitle>

                                        </DialogHeader>

                                        <form
                                            onSubmit={
                                                addBank
                                            }
                                            className="space-y-4"
                                        >

                                            <div className="space-y-2">

                                                <Label>
                                                    Bank Name
                                                </Label>

                                                <Input
                                                    value={
                                                        bank.name
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        setBank(
                                                            {
                                                                ...bank,
                                                                name: e
                                                                    .target
                                                                    .value,
                                                            }
                                                        )
                                                    }
                                                    placeholder="e.g. HDFC Bank"
                                                    required
                                                />

                                            </div>

                                            <div className="space-y-2">

                                                <Label>
                                                    Branch
                                                </Label>

                                                <Input
                                                    value={
                                                        bank.branch
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        setBank(
                                                            {
                                                                ...bank,
                                                                branch: e
                                                                    .target
                                                                    .value,
                                                            }
                                                        )
                                                    }
                                                    placeholder="Branch name"
                                                    required
                                                />

                                            </div>

                                            <div className="space-y-2">

                                                <Label>
                                                    Account Number
                                                </Label>

                                                <Input
                                                    value={
                                                        bank.accountNumber
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        setBank(
                                                            {
                                                                ...bank,
                                                                accountNumber:
                                                                    e
                                                                        .target
                                                                        .value,
                                                            }
                                                        )
                                                    }
                                                    placeholder="Account number"
                                                    required
                                                />

                                            </div>
                                            <div className="space-y-2">
                                                <Label>IFSC Code</Label>

                                                <Input
                                                    value={bank.ifsc}
                                                    onChange={(e) =>
                                                        setBank({
                                                            ...bank,
                                                            ifsc: e.target.value.toUpperCase(),
                                                        })
                                                    }
                                                    placeholder="e.g. HDFC0001234"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Account Type</Label>

                                                <Input
                                                    value={bank.accountType}
                                                    onChange={(e) =>
                                                        setBank({
                                                            ...bank,
                                                            accountType: e.target.value,
                                                        })
                                                    }
                                                    placeholder="e.g. Savings / Current"
                                                    required
                                                />
                                            </div>

                                            <div className="flex justify-end gap-2">

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setBank(
                                                            emptyBank
                                                        );
                                                        setShowBankForm(
                                                            false
                                                        );
                                                    }}
                                                >
                                                    Cancel
                                                </Button>

                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        loading
                                                    }
                                                >
                                                    {loading
                                                        ? "Saving..."
                                                        : "Save Bank"}
                                                </Button>

                                            </div>

                                        </form>

                                    </DialogContent>

                                </Dialog>

                                {/* BANK TABLE */}

                                <Card>

                                    <CardContent className="p-0">

                                        <div className="overflow-x-auto">

                                            <Table>

                                                <TableHeader>

                                                    <TableRow>

                                                        <TableHead>
                                                            ID
                                                        </TableHead>

                                                        <TableHead>
                                                            Bank Name
                                                        </TableHead>

                                                        <TableHead>
                                                            Branch
                                                        </TableHead>

                                                        <TableHead>
                                                            Account Number
                                                        </TableHead>
                                                        <TableHead>
                                                            IFSC
                                                        </TableHead>

                                                        <TableHead>
                                                            Account Type
                                                        </TableHead>

                                                        <TableHead className="text-right">
                                                            Action
                                                        </TableHead>

                                                    </TableRow>

                                                </TableHeader>

                                                <TableBody>

                                                    {banks.length ===
                                                        0 ? (
                                                        <TableRow>
                                                            <TableCell
                                                                colSpan={
                                                                    5
                                                                }
                                                                className="h-24 text-center text-muted-foreground"
                                                            >
                                                                No banks found.
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        banks.map(
                                                            (
                                                                item
                                                            ) => (
                                                                <TableRow
                                                                    key={
                                                                        item.id
                                                                    }
                                                                >

                                                                    <TableCell>
                                                                        {
                                                                            item.id
                                                                        }
                                                                    </TableCell>

                                                                    <TableCell className="font-medium">
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </TableCell>

                                                                    <TableCell>
                                                                        {
                                                                            item.branch
                                                                        }
                                                                    </TableCell>

                                                                    <TableCell>
                                                                        {
                                                                            item.accountNumber
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {item.ifsc}
                                                                    </TableCell>

                                                                    <TableCell>
                                                                        {item.accountType}
                                                                    </TableCell>

                                                                    <TableCell className="text-right">

                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                            onClick={() =>
                                                                                openDeleteDialog(
                                                                                    "bank",
                                                                                    item.id,
                                                                                    item.name
                                                                                )
                                                                            }
                                                                        >
                                                                            <FaTrash />
                                                                        </Button>

                                                                    </TableCell>

                                                                </TableRow>
                                                            )
                                                        )
                                                    )}

                                                </TableBody>

                                            </Table>

                                        </div>

                                    </CardContent>

                                </Card>

                            </TabsContent>

                        </Tabs>

                    </CardContent>

                </Card>

            </div>

            {/* ================================================= */}
            {/* DELETE CONFIRMATION */}
            {/* ================================================= */}

            <AlertDialog
                open={deleteDialog.open}
                onOpenChange={(open) => {
                    if (!open) {
                        closeDeleteDialog();
                    }
                }}
            >

                <AlertDialogContent>

                    <AlertDialogHeader>

                        <AlertDialogTitle>
                            Are you sure?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            This will permanently delete{" "}
                            <strong>
                                {deleteDialog.name}
                            </strong>
                            . This action cannot be
                            undone.
                        </AlertDialogDescription>

                    </AlertDialogHeader>

                    <AlertDialogFooter>

                        <AlertDialogCancel>
                            Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={
                                confirmDelete
                            }
                        >
                            Delete
                        </AlertDialogAction>

                    </AlertDialogFooter>

                </AlertDialogContent>

            </AlertDialog>

        </div>
    );
};

export default Settings;