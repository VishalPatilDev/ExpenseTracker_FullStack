import { useEffect, useState } from "react";
import {
    getAssets,
    createAsset,
    updateAsset,
    updateAcquisition,
    updateCurrentValue,
    deleteAsset,
    getAssetCategories,
    getLiabilities,
    getContacts,
    getBanks,
    createAssetCategory
} from "@/api/assetsApi";

import { useAsync } from "@/hooks/useAsync";
import Button from "@/components/ui/Button";
import FormField, { inputCls, selectCls } from "@/components/ui/FormField";
import Modal from "@/components/ui/Modal";
import { useToastContext } from "@/context/ToastContext";

import {
    Plus,
    Pencil,
    Trash2,
    RefreshCw,
    TrendingUp,
    Wallet,
    DollarSign,
} from "lucide-react";

import { formatINR } from "@/utils/formatters";

// ─────────────────────────────────────────────────────────────────────────────
// Constants — must match Java enums exactly
// ─────────────────────────────────────────────────────────────────────────────

const ASSET_TYPES = [
    { value: "BANK_ACCOUNT", label: "Bank Account", group: "INVESTMENT" },
    { value: "FIXED_DEPOSIT", label: "Fixed Deposit", group: "INVESTMENT" },
    { value: "RECURRING_DEPOSIT", label: "Recurring Deposit", group: "INVESTMENT" },
    { value: "BOND", label: "Bond", group: "INVESTMENT" },
    { value: "NPS", label: "NPS", group: "INVESTMENT" },
    { value: "ESOP", label: "ESOP", group: "INVESTMENT" },
    { value: "PPF", label: "PPF", group: "INVESTMENT" },
    { value: "SIF", label: "SIF", group: "INVESTMENT" },

    { value: "GOLD", label: "Gold", group: "JEWELLERY" },
    { value: "SILVER", label: "Silver", group: "JEWELLERY" },
    { value: "PLATINUM", label: "Platinum", group: "JEWELLERY" },
    { value: "DIAMOND", label: "Diamond", group: "JEWELLERY" },

    { value: "INDIAN_STOCK", label: "Indian Stock", group: "MARKET_INVESTMENT" },
    { value: "US_STOCK", label: "US Stock", group: "MARKET_INVESTMENT" },
    { value: "MUTUAL_FUND", label: "Mutual Fund", group: "MARKET_INVESTMENT" },
    { value: "BITCOIN", label: "Bitcoin", group: "MARKET_INVESTMENT" },

    { value: "PLOT", label: "Plot", group: "PROPERTY" },
    { value: "FLAT", label: "Flat", group: "PROPERTY" },
    { value: "LAND", label: "Land", group: "PROPERTY" },
    { value: "VEHICLE", label: "Vehicle", group: "PROPERTY" },

    { value: "CASH", label: "Cash", group: "CASH" },

    { value: "ELECTRONICS", label: "Electronics", group: "OTHER" },
    { value: "BUSINESS", label: "Business", group: "OTHER" },
    { value: "OTHER", label: "Other", group: "OTHER" },
];

const ASSET_TYPE_GROUPS = [
    { group: "INVESTMENT", label: "Investments" },
    { group: "JEWELLERY", label: "Jewellery / Precious Metals" },
    { group: "MARKET_INVESTMENT", label: "Market Investments" },
    { group: "PROPERTY", label: "Property" },
    { group: "CASH", label: "Cash" },
    { group: "OTHER", label: "Other" },
];

const PAYMENT_METHODS = [
    { value: "CASH", label: "Cash" },
    { value: "UPI", label: "UPI" },
    { value: "BANK_TRANSFER", label: "Bank Transfer" },
    { value: "CHEQUE", label: "Cheque" },
    { value: "CREDIT_CARD", label: "Credit Card" },
    { value: "LOAN", label: "Loan" },
    // { value: "OTHER", label: "Other" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Form state helpers
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
    name: "",
    contactId: "",
    assetGroup: "",
    type: "",
    assetCategoryId: "",
    description: "",
    purchaseValue: "",
    currentValue: "",
    purchaseDate: "",
    paymentMethod: "",
    bankId: "",
    liabilityId: "",
    remark: "",
};

function normalizeAsset(asset) {
    return {
        ...EMPTY_FORM,
        name: asset.name || "",
        contactId: asset.contactId ?? "",
        assetGroup: asset.assetGroup || "",
        type: asset.type || "",
        assetCategoryId: asset.assetCategoryId ?? "",
        description: asset.description || "",
        purchaseValue: asset.purchaseValue ?? "",
        currentValue: asset.currentValue ?? "",
        purchaseDate: asset.purchaseDate || "",
        paymentMethod: asset.paymentMethod || "",
        bankId: asset.bankId ?? "",
        liabilityId: asset.liabilityId ?? "",
        remark: asset.remark || "",
    };
}

function buildPayload(form) {
    const selectedType = ASSET_TYPES.find((t) => t.value === form.type);

    return {
        name: form.name.trim(),
        contactId: form.contactId ? Number(form.contactId) : null,
        assetGroup: selectedType?.group || null,
        type: form.type,
        assetCategoryId: form.assetCategoryId ? Number(form.assetCategoryId) : null,
        description: form.description.trim() || null,
        purchaseValue: Number(form.purchaseValue),
        currentValue: form.currentValue !== "" ? Number(form.currentValue) : null,
        purchaseDate: form.purchaseDate,
        paymentMethod: form.paymentMethod,
        bankId: form.bankId ? Number(form.bankId) : null,
        liabilityId: form.liabilityId ? Number(form.liabilityId) : null,
        remark: form.remark.trim() || null,
    };
}


// ─────────────────────────────────────────────────────────────────────────────
// Asset Form — used in both Add and Edit (metadata-only) modals
// ─────────────────────────────────────────────────────────────────────────────

function AssetForm({
    form,
    setForm,
    onSubmit,
    onCancel,
    loading,
    editing,
    assetCategories,
    setAssetCategories,
    categoriesLoading,
    liabilities,

    liabilitiesLoading,
    contacts,
    contactsLoading,
    banks,
    banksLoading,
}) {
    const [categorySearch, setCategorySearch] = useState(
        assetCategories.find(
            (cat) => String(cat.id) === String(form.assetCategoryId)
        )?.name || ""
    );

    const [showCategories, setShowCategories] = useState(false);
    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     setForm((prev) => ({ ...prev, [name]: value }));
    // };
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "paymentMethod" && value !== "LOAN"
                ? { liabilityId: "" }
                : {}),
        }));
    };

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <FormField label="Asset name">
                    <input
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. Honda City"
                        className={inputCls}
                    />
                </FormField>

                <FormField label="Asset type">
                    <select
                        name="type"
                        required
                        value={form.type}
                        onChange={handleChange}
                        className={selectCls}
                    >
                        <option value="">Select asset type</option>
                        {ASSET_TYPE_GROUPS.map(({ group, label }) => (
                            <optgroup key={group} label={label}>
                                {ASSET_TYPES.filter((t) => t.group === group).map((t) => (
                                    <option key={t.value} value={t.value}>
                                        {t.label}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </FormField>

                {/* <FormField label="Asset category">
                    <select
                        name="assetCategoryId"
                        required
                        value={form.assetCategoryId}
                        onChange={handleChange}
                        className={selectCls}
                        disabled={categoriesLoading}
                    >
                        <option value="">
                            {categoriesLoading ? "Loading categories…" : "Select asset category"}
                        </option>
                        {assetCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </FormField> */}
                <FormField label="Asset category">
                    <div className="relative">
                        <input
                            type="text"
                            required
                            value={categorySearch}
                            onChange={(e) => {
                                setCategorySearch(e.target.value);
                                setShowCategories(true);

                                // If user changes the text, clear the selected ID
                                setForm((prev) => ({
                                    ...prev,
                                    assetCategoryId: "",
                                }));
                            }}
                            onFocus={() => setShowCategories(true)}
                            placeholder="Type asset category"
                            className={inputCls}
                        />

                        {showCategories && (
                            <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 shadow-xl">

                                {/* Existing categories */}
                                {assetCategories
                                    .filter((cat) =>
                                        cat.name
                                            .toLowerCase()
                                            .includes(categorySearch.toLowerCase())
                                    )
                                    .map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            className="block w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
                                            onClick={() => {
                                                setCategorySearch(cat.name);

                                                setForm((prev) => ({
                                                    ...prev,
                                                    assetCategoryId: cat.id,
                                                }));

                                                setShowCategories(false);
                                            }}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}

                                {/* Create new category */}
                                {categorySearch.trim() &&
                                    !assetCategories.some(
                                        (cat) =>
                                            cat.name.toLowerCase() ===
                                            categorySearch.trim().toLowerCase()
                                    ) && (
                                        <button
                                            type="button"
                                            className="block w-full border-t border-slate-700 px-3 py-2 text-left text-sm text-indigo-400 hover:bg-slate-800"
                                            onClick={async () => {
                                                try {
                                                    const response =
                                                        await createAssetCategory(
                                                            {name:categorySearch.trim()}
                                                        );

                                                    const newCategory =
                                                        response?.data?.data ||
                                                        response?.data;

                                                    // Add new category locally
                                                    setAssetCategories((prev) => [
                                                        ...prev,
                                                        newCategory,
                                                    ]);

                                                    // IMPORTANT:
                                                    // Store the newly created category ID
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        assetCategoryId: newCategory.id,
                                                    }));

                                                    setCategorySearch(newCategory.name);
                                                    setShowCategories(false);

                                                } catch (err) {
                                                    console.error(
                                                        "Create category error:",
                                                        err
                                                    );

                                                    // Use your existing toast
                                                    // if you pass toast into AssetForm
                                                    alert(
                                                        err?.response?.data?.message ||
                                                        "Failed to create category"
                                                    );
                                                }
                                            }}
                                        >
                                            + Create "{categorySearch.trim()}"
                                        </button>
                                    )}

                                {/* Nothing found */}
                                {categorySearch.trim() &&
                                    assetCategories.filter((cat) =>
                                        cat.name
                                            .toLowerCase()
                                            .includes(categorySearch.toLowerCase())
                                    ).length === 0 && (
                                        <div className="px-3 py-2 text-xs text-slate-500">
                                            No existing category
                                        </div>
                                    )}
                            </div>
                        )}
                    </div>
                </FormField>

                {/* <FormField label="Contact ID">
                    <input
                        name="contactId"
                        type="number"
                        min="1"
                        value={form.contactId}
                        onChange={handleChange}
                        placeholder="Optional"
                        className={inputCls}
                    />
                </FormField> */}
                <FormField label="Contact">
                    <select
                        name="contactId"
                        value={form.contactId}
                        onChange={handleChange}
                        className={selectCls}
                    >
                        <option value="">
                            {contactsLoading
                                ? "Loading contacts…"
                                : "Select contact (optional)"}
                        </option>

                        {contacts.map((contact) => (
                            <option key={contact.id} value={contact.id}>
                                {contact.name}
                                {contact.phoneNumber
                                    ? ` — ${contact.phoneNumber}`
                                    : ""}
                            </option>
                        ))}
                    </select>
                </FormField>

                <FormField label="Description">
                    <input
                        name="description"
                        type="text"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Optional"
                        className={inputCls}
                    />
                </FormField>

                {/* Purchase fields are hidden when editing metadata only */}
                {!editing && (
                    <>
                        <FormField label="Purchase value">
                            <input
                                name="purchaseValue"
                                type="number"
                                min="0.01"
                                step="0.01"
                                required
                                value={form.purchaseValue}
                                onChange={handleChange}
                                placeholder="0.00"
                                className={inputCls}
                            />
                        </FormField>

                        <FormField label="Current value">
                            <input
                                name="currentValue"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.currentValue}
                                onChange={handleChange}
                                placeholder="Optional — defaults to purchase value"
                                className={inputCls}
                            />
                        </FormField>

                        <FormField label="Purchase date">
                            <input
                                name="purchaseDate"
                                type="date"
                                required
                                value={form.purchaseDate}
                                onChange={handleChange}
                                className={inputCls}
                            />
                        </FormField>

                        <FormField label="Payment method">
                            <select
                                name="paymentMethod"
                                required
                                value={form.paymentMethod}
                                onChange={handleChange}
                                className={selectCls}
                            >
                                <option value="">Select payment method</option>
                                {PAYMENT_METHODS.map((m) => (
                                    <option key={m.value} value={m.value}>
                                        {m.label}
                                    </option>
                                ))}
                            </select>
                        </FormField>

                        {/* <FormField label="Bank ID">
                            <input
                                name="bankId"
                                type="number"
                                min="1"
                                value={form.bankId}
                                onChange={handleChange}
                                placeholder="Required for Bank Transfer"
                                className={inputCls}
                            />
                        </FormField> */}
                        <FormField label="Bank">
                            <select
                                name="bankId"
                                value={form.bankId}
                                onChange={handleChange}
                                className={selectCls}
                                disabled={banksLoading}
                            >
                                <option value="">
                                    {banksLoading
                                        ? "Loading banks…"
                                        : "Select bank"}
                                </option>

                                {banks.map((bank) => (
                                    <option key={bank.id} value={bank.id}>
                                        {bank.name}
                                        {bank.accountNumber
                                            ? ` — ${bank.accountNumber}`
                                            : ""}
                                    </option>
                                ))}
                            </select>
                        </FormField>

                        {/* <FormField label="Liability ID">
                            <input
                                name="liabilityId"
                                type="number"
                                min="1"
                                value={form.liabilityId}
                                onChange={handleChange}
                                placeholder="Optional — if funded by a loan"
                                className={inputCls}
                            />
                        </FormField> */}
                        {form.paymentMethod === "LOAN" && (
                            <FormField label="Loan / Liability">
                                <select
                                    name="liabilityId"
                                    required
                                    value={form.liabilityId}
                                    onChange={handleChange}
                                    className={selectCls}
                                    disabled={liabilitiesLoading}
                                >
                                    <option value="">
                                        {liabilitiesLoading
                                            ? "Loading loans…"
                                            : "Select loan / liability"}
                                    </option>

                                    {liabilities.map((liability) => (
                                        <option key={liability.id} value={liability.id}>
                                            {liability.name}
                                            {liability.outstandingAmount != null
                                                ? ` — ₹${formatINR(liability.outstandingAmount)} outstanding`
                                                : ""}
                                        </option>
                                    ))}
                                </select>
                            </FormField>
                        )}
                    </>
                )}
            </div>

            <FormField label="Remark">
                <textarea
                    name="remark"
                    rows={3}
                    value={form.remark}
                    onChange={handleChange}
                    placeholder="Additional notes…"
                    className={inputCls}
                />
            </FormField>

            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" loading={loading}>
                    {editing ? "Update Asset" : "Add Asset"}
                </Button>
            </div>
        </form>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Acquisition Form — edit purchase value / date / bank (updateAcquisition)
// ─────────────────────────────────────────────────────────────────────────────

function AcquisitionForm({ asset, form, setForm, onSubmit, onCancel, loading }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="rounded-lg bg-slate-800/60 p-4">
                <p className="text-xs text-slate-400">Asset</p>
                <p className="font-medium text-white">{asset?.name}</p>
                <p className="text-xs text-slate-500 mt-1">
                    Editing purchase details will reverse and reapply the bank balance.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Purchase value">
                    <input
                        name="purchaseValue"
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        value={form.purchaseValue}
                        onChange={handleChange}
                        className={inputCls}
                    />
                </FormField>

                <FormField label="Purchase date">
                    <input
                        name="purchaseDate"
                        type="date"
                        required
                        value={form.purchaseDate}
                        onChange={handleChange}
                        className={inputCls}
                    />
                </FormField>

                <FormField label="Payment method">
                    <select
                        name="paymentMethod"
                        required
                        value={form.paymentMethod}
                        onChange={handleChange}
                        className={selectCls}
                    >
                        <option value="">Select payment method</option>
                        {PAYMENT_METHODS.map((m) => (
                            <option key={m.value} value={m.value}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                </FormField>

                <FormField label="Bank ID">
                    <input
                        name="bankId"
                        type="number"
                        min="1"
                        value={form.bankId}
                        onChange={handleChange}
                        placeholder="Required for Bank Transfer"
                        className={inputCls}
                    />
                </FormField>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" loading={loading}>
                    Update Acquisition
                </Button>
            </div>
        </form>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Valuation Modal — update current value only
// ─────────────────────────────────────────────────────────────────────────────

function ValuationModal({ asset, onClose, onSuccess }) {
    const toast = useToastContext();
    const [value, setValue] = useState(asset?.currentValue ?? asset?.purchaseValue ?? "");
    const { execute, loading } = useAsync(updateCurrentValue);

    const submit = async (e) => {
        e.preventDefault();
        if (value === "" || Number(value) < 0) {
            toast.error("Enter a valid current value");
            return;
        }
        try {
            await execute(asset.id, Number(value));
            toast.success("Current value updated");
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to update current value");
        }
    };

    return (
        <Modal open={!!asset} onClose={onClose} title="Update current value">
            <form onSubmit={submit} className="flex flex-col gap-4">
                <div className="rounded-lg bg-slate-800/60 p-4">
                    <p className="text-sm text-slate-400">Asset</p>
                    <p className="font-medium text-white">{asset?.name}</p>
                </div>

                <FormField label="Current value (₹)">
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className={inputCls}
                    />
                </FormField>

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" loading={loading}>Update Value</Button>
                </div>
            </form>
        </Modal>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Asset Page
// ─────────────────────────────────────────────────────────────────────────────

export default function Asset() {
    const toast = useToastContext();

    const [assets, setAssets] = useState([]);
    const [assetCategories, setAssetCategories] = useState([]);

    const [liabilities, setLiabilities] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [banks, setBanks] = useState([]);

    const { execute: fetchLiabilities, loading: liabilitiesLoading } =
        useAsync(getLiabilities);
    const [modal, setModal] = useState(null); // { mode, asset? }
    const [form, setForm] = useState(EMPTY_FORM);

    const { execute: fetchAssets, loading: fetching } = useAsync(getAssets);
    const { execute: fetchCategories, loading: categoriesLoading } = useAsync(getAssetCategories);
    const { execute: removeAsset, loading: deleting } = useAsync(deleteAsset);
    const { execute: fetchContacts, loading: contactsLoading } =
        useAsync(getContacts);

    const { execute: fetchBanks, loading: banksLoading } =
        useAsync(getBanks);

    const { execute: saveAsset, loading: saving } = useAsync(async (data) => {
        if (modal?.mode === "edit") return updateAsset(modal.asset.id, data);
        if (modal?.mode === "acquisition") return updateAcquisition(modal.asset.id, data);
        return createAsset(data);
    });

    // ── Load helpers ──────────────────────────────────────────────────────────

    const loadAssets = async () => {
        try {
            const response = await fetchAssets();
            const result = response?.data;
            const list = result?.data || result?.result || [];
            setAssets(Array.isArray(list) ? list : []);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to fetch assets");
        }
    };
    const loadLiabilities = async () => {
        try {
            const response = await fetchLiabilities();
            const result = response?.data;

            const list = Array.isArray(result)
                ? result
                : result?.data || result?.result || [];

            setLiabilities(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error("Liability fetch error:", err);
            toast.error(
                err?.response?.data?.message ||
                "Failed to fetch liabilities"
            );
        }
    };

    const loadCategories = async () => {
        try {
            const response = await fetchCategories();
            const result = response?.data;
            const list = Array.isArray(result)
                ? result
                : result?.data || result?.result || [];
            setAssetCategories(list);

            // const list     = result?.data || result?.result || [];
            // setAssetCategories(Array.isArray(list) ? list : []);

        } catch (err) {
            console.error("Asset category fetch error:", err);
            toast.error(err?.response?.data?.message || "Failed to fetch asset categories");
        }
    };
    const loadContacts = async () => {
        try {
            const response = await fetchContacts();
            const result = response?.data;

            const list = Array.isArray(result)
                ? result
                : result?.data || result?.result || [];

            setContacts(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error("Contact fetch error:", err);
            toast.error(
                err?.response?.data?.message || "Failed to fetch contacts"
            );
        }
    };

    const loadBanks = async () => {
        try {
            const response = await fetchBanks();
            const result = response?.data;

            const list = Array.isArray(result)
                ? result
                : result?.data || result?.result || [];

            setBanks(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error("Bank fetch error:", err);
            toast.error(
                err?.response?.data?.message || "Failed to fetch banks"
            );
        }
    };

    useEffect(() => {
        loadAssets();
        loadCategories();
        loadLiabilities();
        loadContacts();
        loadBanks();
    }, []);

    // ── Modal openers ─────────────────────────────────────────────────────────

    const openAdd = () => {
        setForm({
            ...EMPTY_FORM,
            purchaseDate: new Date().toISOString().split("T")[0],
        });
        setModal({ mode: "add" });
    };

    const openEdit = (asset) => {
        setForm(normalizeAsset(asset));
        setModal({ mode: "edit", asset });
    };

    const openAcquisition = (asset) => {
        setForm(normalizeAsset(asset));
        setModal({ mode: "acquisition", asset });
    };

    const closeModal = () => {
        setModal(null);
        setForm(EMPTY_FORM);
    };

    // ── Submit ────────────────────────────────────────────────────────────────

    const submit = async (e) => {
        e.preventDefault();
        try {
            const payload = buildPayload(form);
            await saveAsset(payload);
            toast.success(
                modal?.mode === "edit" ? "Asset updated" :
                    modal?.mode === "acquisition" ? "Acquisition updated" :
                        "Asset added"
            );
            closeModal();
            await loadAssets();
        } catch (err) {
            toast.error(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Failed to save asset"
            );
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this asset? This will also reverse any bank transaction created at purchase.")) return;
        try {
            await removeAsset(id);
            toast.success("Asset deleted");
            await loadAssets();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to delete asset");
        }
    };

    // ── Derived totals ────────────────────────────────────────────────────────

    const totalPurchase = assets.reduce((s, a) => s + Number(a.purchaseValue || 0), 0);
    const totalCurrent = assets.reduce((s, a) => s + Number(a.currentValue ?? a.purchaseValue ?? 0), 0);
    const gainLoss = totalCurrent - totalPurchase;

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="max-w-6xl">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-white">Assets</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Manage your assets and track their current value.
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button variant="ghost" onClick={loadAssets} disabled={fetching}>
                        <RefreshCw size={15} className={fetching ? "animate-spin" : ""} />
                        Refresh
                    </Button>
                    <Button onClick={openAdd}>
                        <Plus size={15} />
                        Add Asset
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-400">Total Assets</p>
                            <p className="text-xl font-semibold text-white mt-1">{assets.length}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                            <Wallet size={18} />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                    <p className="text-xs text-slate-400">Purchase Value</p>
                    <p className="text-xl font-semibold text-white mt-1">₹{formatINR(totalPurchase)}</p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                    <p className="text-xs text-slate-400">Current Value</p>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-xl font-semibold text-emerald-400">
                            ₹{formatINR(totalCurrent)}
                        </p>
                        {gainLoss !== 0 && (
                            <span
                                className={`text-xs font-medium ${gainLoss >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                            >
                                {gainLoss >= 0 ? "+" : ""}₹{formatINR(gainLoss)}
                            </span>
                        )}
                    </div>
                </div>

            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900">

                {fetching ? (
                    <div className="py-16 text-center text-slate-500">Loading assets…</div>
                ) : assets.length === 0 ? (
                    <div className="py-16 text-center">
                        <Wallet size={32} className="mx-auto text-slate-600 mb-3" />
                        <p className="text-slate-400">No assets yet</p>
                        <p className="text-sm text-slate-600 mt-1">Add your first asset to get started.</p>
                        <Button size="sm" onClick={openAdd} className="mt-4">
                            <Plus size={14} /> Add Asset
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-800/60">
                                <tr>
                                    {["Asset", "Type", "Category", "Purchase Value", "Current Value", "Purchase Date", "Payment", "Bank / Liability", ""].map((h) => (
                                        <th
                                            key={h}
                                            className="px-4 py-3 text-left text-xs font-medium text-slate-400 whitespace-nowrap"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {assets.map((asset) => {
                                    const purchase = Number(asset.purchaseValue || 0);
                                    const current = Number(asset.currentValue ?? purchase);
                                    const difference = current - purchase;

                                    return (
                                        <tr
                                            key={asset.id}
                                            className="border-t border-slate-800 hover:bg-slate-800/30"
                                        >
                                            {/* Name */}
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-slate-100">{asset.name}</p>
                                                {asset.description && (
                                                    <p className="text-xs text-slate-500 mt-0.5 max-w-[200px] truncate">
                                                        {asset.description}
                                                    </p>
                                                )}
                                            </td>

                                            {/* Type */}
                                            <td className="px-4 py-3">
                                                <span className="inline-flex rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">
                                                    {asset.type?.replaceAll("_", " ") || "-"}
                                                </span>
                                            </td>

                                            {/* Category */}
                                            <td className="px-4 py-3 text-slate-400 text-xs">
                                                {asset.assetCategoryId || "-"}
                                            </td>

                                            {/* Purchase value */}
                                            <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                                                ₹{formatINR(purchase)}
                                            </td>

                                            {/* Current value */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <p className="font-medium text-emerald-400">
                                                    ₹{formatINR(current)}
                                                </p>
                                                {difference !== 0 && (
                                                    <p className={`text-xs mt-0.5 ${difference > 0 ? "text-emerald-500" : "text-rose-400"}`}>
                                                        {difference > 0 ? "+" : ""}₹{formatINR(difference)}
                                                    </p>
                                                )}
                                            </td>

                                            {/* Date */}
                                            <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                                                {asset.purchaseDate || "-"}
                                            </td>

                                            {/* Payment method */}
                                            <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                                                {asset.paymentMethod?.replaceAll("_", " ") || "-"}
                                            </td>

                                            {/* Bank / Liability */}
                                            <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                                                {asset.bankName
                                                    ? `🏦 ${asset.bankName}`
                                                    : asset.liabilityName
                                                        ? `📋 ${asset.liabilityName}`
                                                        : "-"}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">

                                                    {/* Update current value */}
                                                    <button
                                                        type="button"
                                                        title="Update current value"
                                                        onClick={() => setModal({ mode: "valuation", asset })}
                                                        className="p-1.5 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-800"
                                                    >
                                                        <TrendingUp size={14} />
                                                    </button>

                                                    {/* Edit acquisition (purchase value / date / bank) */}
                                                    <button
                                                        type="button"
                                                        title="Edit acquisition details"
                                                        onClick={() => openAcquisition(asset)}
                                                        className="p-1.5 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800"
                                                    >
                                                        <DollarSign size={14} />
                                                    </button>

                                                    {/* Edit asset metadata */}
                                                    <button
                                                        type="button"
                                                        title="Edit asset"
                                                        onClick={() => openEdit(asset)}
                                                        className="p-1.5 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>

                                                    {/* Delete */}
                                                    <button
                                                        type="button"
                                                        title="Delete"
                                                        disabled={deleting}
                                                        onClick={() => handleDelete(asset.id)}
                                                        className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>

                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            <Modal
                open={modal?.mode === "add"}
                onClose={closeModal}
                title="Add Asset"
            >
                <AssetForm
                    form={form}
                    setForm={setForm}
                    onSubmit={submit}
                    onCancel={closeModal}
                    loading={saving}
                    editing={false}
                    assetCategories={assetCategories}
                    setAssetCategories={setAssetCategories}
                    categoriesLoading={categoriesLoading}
                    liabilities={liabilities}
                    liabilitiesLoading={liabilitiesLoading}
                    contacts={contacts}
    contactsLoading={contactsLoading}
    banks={banks}
    banksLoading={banksLoading}
                />
            </Modal>

            {/* Edit Metadata Modal */}
            <Modal
                open={modal?.mode === "edit"}
                onClose={closeModal}
                title="Edit Asset"
            >
                <AssetForm
                    form={form}
                    setForm={setForm}
                    onSubmit={submit}
                    onCancel={closeModal}
                    loading={saving}
                    editing={true}
                    assetCategories={assetCategories}
                    categoriesLoading={categoriesLoading}
                    liabilities={liabilities}
                    liabilitiesLoading={liabilitiesLoading}
                />
            </Modal>

            {/* Edit Acquisition Modal */}
            <Modal
                open={modal?.mode === "acquisition"}
                onClose={closeModal}
                title="Edit Acquisition Details"
            >
                {modal?.mode === "acquisition" && (
                    <AcquisitionForm
                        asset={modal.asset}
                        form={form}
                        setForm={setForm}
                        onSubmit={submit}
                        onCancel={closeModal}
                        loading={saving}
                    />
                )}
            </Modal>

            {/* Valuation Modal */}
            {modal?.mode === "valuation" && (
                <ValuationModal
                    asset={modal.asset}
                    onClose={() => setModal(null)}
                    onSuccess={loadAssets}
                />
            )}

        </div>
    );
}