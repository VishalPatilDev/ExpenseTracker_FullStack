import { useState, useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";
import { useToastContext } from "@/context/ToastContext";
import {
    createContact, updateContact, deleteContact,
    createCategory, deleteCategory,
    createBank, deleteBank,createAssetCategory,deleteAssetCategory
} from "@/api/settingsApi";
import { useAsync } from "@/hooks/useAsync";
import Button from "@/components/ui/Button";
import FormField, { inputCls } from "@/components/ui/FormField";
import Modal from "@/components/ui/Modal";
import { Trash2, Pencil, Plus } from "lucide-react";
import { formatINR } from "@/utils/formatters";

const TABS = ["Contacts", "Categories", "Banks", "Asset Categories",
];

// ── Contacts tab ──────────────────────────────────────────────────────────────
function ContactsTab() {
    const { contacts, refresh } = useSettings();
    const toast = useToastContext();
    const [modal, setModal] = useState(null); // null | { mode: 'add'|'edit', data? }
    const [form, setForm] = useState({ name: "", email: "", phoneNumber: "" });

    const { execute: save, loading: saving } = useAsync(
        modal?.mode === "edit"
            ? (data) => updateContact(modal.data.id, data)
            : createContact
    );
    const { execute: remove } = useAsync(deleteContact);

    const openAdd = () => {
        setForm({ name: "", email: "", phoneNumber: "" });
        setModal({ mode: "add" });
    };
    const openEdit = (c) => {
        setForm({ name: c.name, email: c.email, phoneNumber: c.phoneNumber });
        setModal({ mode: "edit", data: c });
    };

    const submit = async (e) => {
        e.preventDefault();
        try {
            await save(form);
            toast.success(modal.mode === "edit" ? "Contact updated" : "Contact added");
            refresh();
            setModal(null);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this contact?")) return;
        try {
            await remove(id);
            toast.success("Contact deleted");
            refresh();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to delete");
        }
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-400">{contacts.length} contacts</p>
                <Button size="sm" onClick={openAdd}><Plus size={14} /> Add contact</Button>
            </div>

            <div className="rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-800/60">
                        <tr>
                            {["Name", "Email", "Phone", ""].map((h) => (
                                <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-slate-400">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {contacts.length === 0 ? (
                            <tr><td colSpan={4} className="text-center py-10 text-slate-500">No contacts yet</td></tr>
                        ) : contacts.map((c) => (
                            <tr key={c.id} className="border-t border-slate-800 hover:bg-slate-800/30">
                                <td className="px-4 py-2.5 text-slate-100">{c.name}</td>
                                <td className="px-4 py-2.5 text-slate-400">{c.email}</td>
                                <td className="px-4 py-2.5 text-slate-400">{c.phoneNumber}</td>
                                <td className="px-4 py-2.5">
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={() => openEdit(c)} className="p-1 text-slate-400 hover:text-indigo-400">
                                            <Pencil size={13} />
                                        </button>
                                        <button onClick={() => handleDelete(c.id)} className="p-1 text-slate-400 hover:text-rose-400">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                open={!!modal}
                onClose={() => setModal(null)}
                title={modal?.mode === "edit" ? "Edit contact" : "Add contact"}
            >
                <form onSubmit={submit} className="flex flex-col gap-4">
                    {["name", "email", "phoneNumber"].map((field) => (
                        <FormField key={field} label={field === "phoneNumber" ? "Phone" : field.charAt(0).toUpperCase() + field.slice(1)}>
                            <input
                                type={field === "email" ? "email" : "text"}
                                required
                                value={form[field]}
                                onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                                className={inputCls}
                            />
                        </FormField>
                    ))}
                    <div className="flex gap-3 justify-end">
                        <Button type="button" variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
                        <Button type="submit" loading={saving}>{modal?.mode === "edit" ? "Update" : "Add"}</Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}

// ── Categories tab ────────────────────────────────────────────────────────────
function CategoriesTab() {
    const { categories, refresh } = useSettings();
    const toast = useToastContext();
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [transactionType, setTransactionType] = useState("EXPENSE");
    const { execute: save, loading } = useAsync(createCategory);
    const { execute: remove } = useAsync(deleteCategory);

    const submit = async (e) => {
        e.preventDefault();
        try {
            await save({ name, transactionType });
            toast.success("Category added");
            setName(""); setShowForm(false);
            refresh();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete category?")) return;
        try {
            await remove(id);
            toast.success("Category deleted");
            refresh();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed");
        }
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-400">{categories.length} categories</p>
                <Button size="sm" onClick={() => setShowForm((p) => !p)}>
                    <Plus size={14} /> Add category
                </Button>
            </div>

            {showForm && (
                <form onSubmit={submit} className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 flex gap-3 items-end mb-4">
                    <FormField label="Name" className="flex-1">
                        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
                    </FormField>
                    <FormField label="Type">
                        <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)} className={inputCls}>
                            <option value="EXPENSE">Expense</option>
                            <option value="INCOME">Income</option>
                        </select>
                    </FormField>
                    <Button type="submit" loading={loading}>Save</Button>
                    <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                </form>
            )}

            <div className="rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-800/60">
                        <tr>
                            {["Name", "Type", ""].map((h) => (
                                <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-slate-400">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length === 0 ? (
                            <tr><td colSpan={3} className="text-center py-10 text-slate-500">No categories yet</td></tr>
                        ) : categories.map((c) => (
                            <tr key={c.id} className="border-t border-slate-800 hover:bg-slate-800/30">
                                <td className="px-4 py-2.5 text-slate-100">{c.name}</td>
                                <td className="px-4 py-2.5 text-slate-400">{c.transactionType || "-"}</td>
                                <td className="px-4 py-2.5 text-right">
                                    <button onClick={() => handleDelete(c.id)} className="p-1 text-slate-400 hover:text-rose-400">
                                        <Trash2 size={13} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

// ── Banks tab ─────────────────────────────────────────────────────────────────
function BanksTab() {
    const { banks, refresh } = useSettings();
    const toast = useToastContext();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: "", accountNumber: "", branch: "", ifsc: "", accountType: "SAVINGS", openingBalance: "" });
    const { execute: save, loading } = useAsync(createBank);
    const { execute: remove } = useAsync(deleteBank);

    const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        try {
            await save({ ...form, openingBalance: Number(form.openingBalance) });
            toast.success("Bank added");
            setForm({ name: "", accountNumber: "", branch: "", ifsc: "", accountType: "SAVINGS", openingBalance: "" });
            setShowForm(false);
            refresh();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete bank?")) return;
        try {
            await remove(id);
            toast.success("Bank deleted");
            refresh();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed");
        }
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-400">{banks.length} banks</p>
                <Button size="sm" onClick={() => setShowForm((p) => !p)}>
                    <Plus size={14} /> Add bank
                </Button>
            </div>

            {showForm && (
                <form onSubmit={submit} className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 grid grid-cols-2 gap-4 mb-4">
                    {[
                        { name: "name", label: "Bank name", type: "text" },
                        { name: "accountNumber", label: "Account number", type: "text" },
                        { name: "branch", label: "Branch", type: "text" },
                        { name: "ifsc", label: "IFSC", type: "text" },
                    ].map(({ name, label, type }) => (
                        <FormField key={name} label={label}>
                            <input type={type} name={name} required value={form[name]} onChange={handle} className={inputCls} />
                        </FormField>
                    ))}
                    <FormField label="Account type">
                        <select name="accountType" value={form.accountType} onChange={handle} className={inputCls}>
                            <option value="SAVINGS">Savings</option>
                            <option value="CURRENT">Current</option>
                        </select>
                    </FormField>
                    <FormField label="Opening balance (₹)">
                        <input type="number" name="openingBalance" min="0" value={form.openingBalance} onChange={handle} className={inputCls} />
                    </FormField>
                    <div className="col-span-2 flex gap-3 justify-end">
                        <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                        <Button type="submit" loading={loading}>Save</Button>
                    </div>
                </form>
            )}

            <div className="rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-800/60">
                        <tr>
                            {["Name", "Account No.", "Branch", "IFSC", "Type", "Balance", ""].map((h) => (
                                <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-slate-400">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {banks.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-10 text-slate-500">No banks yet</td></tr>
                        ) : banks.map((b) => (
                            <tr key={b.id} className="border-t border-slate-800 hover:bg-slate-800/30">
                                <td className="px-4 py-2.5 text-slate-100">{b.name}</td>
                                <td className="px-4 py-2.5 text-slate-400">{b.accountNumber}</td>
                                <td className="px-4 py-2.5 text-slate-400">{b.branch}</td>
                                <td className="px-4 py-2.5 text-slate-400">{b.ifsc}</td>
                                <td className="px-4 py-2.5 text-slate-400">{b.accountType}</td>
                                <td className="px-4 py-2.5 font-medium text-emerald-400">₹{formatINR(b.currentBalance)}</td>
                                <td className="px-4 py-2.5 text-right">
                                    <button onClick={() => handleDelete(b.id)} className="p-1 text-slate-400 hover:text-rose-400">
                                        <Trash2 size={13} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
function AssetCategoriesTab() {
    const { assetCategories, refresh } = useSettings();
    const toast = useToastContext();

    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");

    const { execute: save, loading } = useAsync(createAssetCategory);
    const { execute: remove } = useAsync(deleteAssetCategory);

    const submit = async (e) => {
        e.preventDefault();

        try {
            await save({ name });

            toast.success("Asset category added");

            setName("");
            setShowForm(false);
            refresh();
        } catch (err) {
            toast.error(
                err?.response?.data?.message || "Failed to add asset category"
            );
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete asset category?")) return;

        try {
            await remove(id);

            toast.success("Asset category deleted");
            refresh();
        } catch (err) {
            toast.error(
                err?.response?.data?.message || "Failed to delete asset category"
            );
        }
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-400">
                    {assetCategories.length} asset categories
                </p>

                <Button
                    size="sm"
                    onClick={() => setShowForm((p) => !p)}
                >
                    <Plus size={14} />
                    Add asset category
                </Button>
            </div>

            {showForm && (
                <form
                    onSubmit={submit}
                    className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 flex gap-3 items-end mb-4"
                >
                    <FormField label="Name" className="flex-1">
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={inputCls}
                            placeholder="e.g. Vehicle, Property, Gold"
                        />
                    </FormField>

                    <Button type="submit" loading={loading}>
                        Save
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                            setName("");
                            setShowForm(false);
                        }}
                    >
                        Cancel
                    </Button>
                </form>
            )}

            <div className="rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-800/60">
                        <tr>
                            {["Name", ""].map((h) => (
                                <th
                                    key={h}
                                    className="px-4 py-2.5 text-left text-xs font-medium text-slate-400"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {assetCategories.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={2}
                                    className="text-center py-10 text-slate-500"
                                >
                                    No asset categories yet
                                </td>
                            </tr>
                        ) : (
                            assetCategories.map((category) => (
                                <tr
                                    key={category.id}
                                    className="border-t border-slate-800 hover:bg-slate-800/30"
                                >
                                    <td className="px-4 py-2.5 text-slate-100">
                                        {category.name}
                                    </td>

                                    <td className="px-4 py-2.5 text-right">
                                        <button
                                            onClick={() =>
                                                handleDelete(category.id)
                                            }
                                            className="p-1 text-slate-400 hover:text-rose-400"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Settings() {
    const [tab, setTab] = useState("Contacts");

    return (
        <div className="max-w-3xl">
            <h1 className="text-xl font-semibold text-white mb-6">Settings</h1>

            <div className="flex gap-1 mb-6 border-b border-slate-800">
                {TABS.map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t
                            ? "border-indigo-500 text-white"
                            : "border-transparent text-slate-400 hover:text-slate-200"
                            }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {tab === "Contacts" && <ContactsTab />}
            {tab === "Categories" && <CategoriesTab />}
            {tab === "Banks" && <BanksTab />}
            {tab === "Asset Categories" && <AssetCategoriesTab />}

        </div>
    );
}