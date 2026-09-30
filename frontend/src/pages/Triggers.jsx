import { useEffect, useState } from "react";

import {
    getTriggers,
    createTrigger,
    updateTrigger,
    deleteTrigger,
    fireTrigger,
} from "../services/api";

import StatusBadge from "../components/StatusBadge";


const emptyForm = {
    name: "",
    event_key: "",
    description: "",
    active: true,
};


function getChannelLabel(channel) {
    const labels = {
        email: "Email",
        whatsapp: "WhatsApp",
        web_push: "Web Push",
    };

    return labels[channel] || channel;
}


function Triggers() {

    const [triggers, setTriggers] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    // CRUD modal
    const [showFormModal, setShowFormModal] =
        useState(false);

    const [editingTrigger, setEditingTrigger] =
        useState(null);

    const [form, setForm] =
        useState(emptyForm);

    const [saving, setSaving] =
        useState(false);

    // Fire modal
    const [selectedTrigger, setSelectedTrigger] =
        useState(null);

    const emptyRecipients = {
        email: "",
        whatsapp: "",
        web_push: "",
    };

    const [recipients, setRecipients] =
        useState({ ...emptyRecipients });

    const [firing, setFiring] =
        useState(false);

    const [fireResult, setFireResult] =
        useState(null);


    // =====================================
    // LOAD TRIGGERS
    // =====================================

    const loadTriggers = async () => {

        try {

            setLoading(true);
            setError("");

            const data = await getTriggers();

            setTriggers(data);

        } catch (err) {

            console.error(
                "Failed to load triggers:",
                err
            );

            setError(
                "Unable to load triggers."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        loadTriggers();
    }, []);


    // =====================================
    // OPEN CREATE MODAL
    // =====================================

    const openCreateModal = () => {

        setEditingTrigger(null);

        setForm({
            ...emptyForm,
        });

        setError("");
        setMessage("");

        setShowFormModal(true);
    };


    // =====================================
    // OPEN EDIT MODAL
    // =====================================

    const openEditModal = (trigger) => {

        setEditingTrigger(trigger);

        setForm({
            name: trigger.name || "",
            event_key: trigger.event_key || "",
            description:
                trigger.description || "",
            active: trigger.active,
        });

        setError("");
        setMessage("");

        setShowFormModal(true);
    };


    // =====================================
    // CLOSE FORM MODAL
    // =====================================

    const closeFormModal = () => {

        if (saving) {
            return;
        }

        setShowFormModal(false);

        setEditingTrigger(null);

        setForm({
            ...emptyForm,
        });
    };


    // =====================================
    // FORM INPUT
    // =====================================

    const handleInputChange = (
        event
    ) => {

        const {
            name,
            value,
            type,
            checked,
        } = event.target;

        setForm((previous) => ({
            ...previous,

            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };


    // =====================================
    // SAVE TRIGGER
    // =====================================

    const handleSaveTrigger = async (
        event
    ) => {

        event.preventDefault();

        if (!form.name.trim()) {

            setError(
                "Trigger name is required."
            );

            return;
        }

        if (!form.event_key.trim()) {

            setError(
                "Event key is required."
            );

            return;
        }


        try {

            setSaving(true);
            setError("");

            const payload = {
                name: form.name.trim(),
                event_key:
                    form.event_key.trim(),
                description:
                    form.description.trim(),
                active: form.active,
            };


            if (editingTrigger) {

                await updateTrigger(
                    editingTrigger.id,
                    payload
                );

                setMessage(
                    "Trigger updated successfully."
                );

            } else {

                await createTrigger(
                    payload
                );

                setMessage(
                    "Trigger created successfully."
                );
            }


            closeFormModal();

            await loadTriggers();

        } catch (err) {

            console.error(
                "Failed to save trigger:",
                err
            );

            const backendError =
                err?.response?.data;

            if (
                backendError?.name
            ) {

                setError(
                    `Name: ${backendError.name.join(
                        " "
                    )}`
                );

            } else if (
                backendError?.event_key
            ) {

                setError(
                    `Event Key: ${backendError.event_key.join(
                        " "
                    )}`
                );

            } else if (
                backendError?.detail
            ) {

                setError(
                    backendError.detail
                );

            } else {

                setError(
                    "Failed to save trigger."
                );
            }

        } finally {

            setSaving(false);

        }
    };


    // =====================================
    // TOGGLE TRIGGER
    // =====================================

    const handleToggleTrigger = async (
        trigger
    ) => {

        try {

            setError("");
            setMessage("");

            await updateTrigger(
                trigger.id,
                {
                    active: !trigger.active,
                }
            );

            setMessage(
                `${trigger.name} is now ${!trigger.active
                    ? "active"
                    : "inactive"
                }.`
            );

            await loadTriggers();

        } catch (err) {

            console.error(
                "Failed to update trigger:",
                err
            );

            setError(
                "Failed to update trigger status."
            );
        }
    };


    // =====================================
    // DELETE TRIGGER
    // =====================================

    const handleDeleteTrigger = async (
        trigger
    ) => {

        const confirmed =
            window.confirm(
                `Delete "${trigger.name}"? This will also delete its notification templates and related trigger records.`
            );

        if (!confirmed) {
            return;
        }


        try {

            setError("");
            setMessage("");

            await deleteTrigger(
                trigger.id
            );

            setMessage(
                "Trigger deleted successfully."
            );

            await loadTriggers();

        } catch (err) {

            console.error(
                "Failed to delete trigger:",
                err
            );

            setError(
                "Failed to delete trigger."
            );
        }
    };


    // =====================================
    // OPEN FIRE MODAL
    // =====================================

    const openFireModal = (
        trigger
    ) => {

        setSelectedTrigger(trigger);

        setRecipients({ ...emptyRecipients });

        setFireResult(null);

        setError("");
        setMessage("");
    };


    // =====================================
    // CLOSE FIRE MODAL
    // =====================================

    const closeFireModal = () => {

        if (firing) {
            return;
        }

        setSelectedTrigger(null);

        setRecipients({ ...emptyRecipients });

        setFireResult(null);
    };


    // =====================================
    // FIRE TRIGGER
    // =====================================

    const handleFireTrigger = async (
        event
    ) => {

        event.preventDefault();

        if (!selectedTrigger) {
            return;
        }

        const cleanedRecipients = {
            email: recipients.email.trim(),
            whatsapp: recipients.whatsapp.trim(),
            web_push: recipients.web_push.trim(),
        };

        if (!Object.values(cleanedRecipients).some(Boolean)) {
            setError("Enter at least one channel recipient.");
            return;
        }

        try {

            setFiring(true);

            setError("");
            setMessage("");
            setFireResult(null);

            const result =
                await fireTrigger(
                    selectedTrigger.id,
                    cleanedRecipients
                );


            if (result.success) {

                setMessage(
                    `"${selectedTrigger.name}" executed successfully.`
                );

                setFireResult(
                    result.notifications || []
                );

            } else {

                setError(
                    result.message ||
                    "Trigger could not be fired."
                );

            }

        } catch (err) {

            console.error(
                "Trigger error:",
                err
            );

            const backendMessage =
                err?.response?.data?.message;

            setError(
                backendMessage ||
                "Failed to execute trigger."
            );

        } finally {

            setFiring(false);

        }
    };


    // =====================================
    // LOADING
    // =====================================

    if (loading) {

        return (
            <div className="dashboard-page">

                <div className="dashboard-loading">
                    Loading triggers...
                </div>

            </div>
        );
    }


    // =====================================
    // PAGE
    // =====================================

    return (
        <div className="dashboard-page">

            {/* HEADER */}

            <div className="dashboard-header">

                <div>

                    <h1>
                        Triggers
                    </h1>

                    <p>
                        Create, manage and execute
                        notification triggers.
                    </p>

                </div>


                <div className="dashboard-header-actions">

                    <button
                        type="button"
                        className="refresh-button"
                        onClick={() =>{
                            setMessage("")
                            setError("")
                            loadTriggers("")
                        }}
                    >
                        ↻ Refresh
                    </button>

                    <button
                        type="button"
                        className="primary-action-button"
                        onClick={openCreateModal}
                    >
                        + Create Trigger
                    </button>

                </div>

            </div>


            {/* ERROR */}

            {error && (
                <div className="dashboard-error">
                    {error}
                </div>
            )}


            {/* SUCCESS */}

            {message && (
                <div className="dashboard-success">
                    {message}
                </div>
            )}


            {/* TRIGGER LIST */}

            <div className="dashboard-section">

                <div className="section-header">

                    <div>

                        <h2>
                            Notification Triggers
                        </h2>

                        <p>
                            Configure events that start
                            notification workflows.
                        </p>

                    </div>


                    <span className="record-count">
                        {triggers.length} triggers
                    </span>

                </div>


                {triggers.length === 0 ? (

                    <div className="empty-state">

                        <div className="empty-state-icon">
                            ⚡
                        </div>

                        <h3>
                            No triggers found
                        </h3>

                        <p>
                            Create your first notification
                            trigger.
                        </p>

                    </div>

                ) : (

                    <div className="trigger-table-wrapper">

                        <table className="notification-table">

                            <thead>

                                <tr>

                                    <th>
                                        Name
                                    </th>

                                    <th>
                                        Event Key
                                    </th>

                                    <th>
                                        Description
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Created
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {triggers.map(
                                    (trigger) => (

                                        <tr
                                            key={
                                                trigger.id
                                            }
                                        >

                                            <td>

                                                <div className="table-primary">
                                                    {trigger.name}
                                                </div>

                                                <div className="table-secondary">
                                                    ID #{trigger.id}
                                                </div>

                                            </td>


                                            <td>

                                                <code className="event-key">
                                                    {
                                                        trigger.event_key
                                                    }
                                                </code>

                                            </td>


                                            <td>

                                                <div className="trigger-description">

                                                    {
                                                        trigger.description ||
                                                        "No description"
                                                    }

                                                </div>

                                            </td>


                                            <td>

                                                <button
                                                    type="button"
                                                    className="trigger-status-button"
                                                    onClick={() =>
                                                        handleToggleTrigger(
                                                            trigger
                                                        )
                                                    }
                                                >

                                                    <StatusBadge
                                                        status={
                                                            trigger.active
                                                                ? "active"
                                                                : "inactive"
                                                        }
                                                    />

                                                </button>

                                            </td>


                                            <td>

                                                <span className="date-text">

                                                    {new Date(
                                                        trigger.created_at
                                                    ).toLocaleString(
                                                        "en-IN",
                                                        {
                                                            dateStyle:
                                                                "medium",
                                                        }
                                                    )}

                                                </span>

                                            </td>


                                            <td>

                                                <div className="trigger-actions">

                                                    <button
                                                        type="button"
                                                        className="fire-button"
                                                        disabled={
                                                            !trigger.active
                                                        }
                                                        onClick={() =>
                                                            openFireModal(
                                                                trigger
                                                            )
                                                        }
                                                    >
                                                        Fire
                                                    </button>


                                                    <button
                                                        type="button"
                                                        className="trigger-edit-button"
                                                        onClick={() =>
                                                            openEditModal(
                                                                trigger
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>


                                                    <button
                                                        type="button"
                                                        className="trigger-delete-button"
                                                        onClick={() =>
                                                            handleDeleteTrigger(
                                                                trigger
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =================================
          CREATE / EDIT MODAL
      ================================= */}

            {showFormModal && (

                <div
                    className="fire-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeFormModal();
                        }

                    }}
                >

                    <div className="fire-modal">

                        <div className="fire-modal-header">

                            <div>

                                <h2>
                                    {editingTrigger
                                        ? "Edit Trigger"
                                        : "Create Trigger"}
                                </h2>

                                <p>
                                    Configure a notification
                                    event for your system.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="modal-close-button"
                                onClick={
                                    closeFormModal
                                }
                                disabled={saving}
                            >
                                ×
                            </button>

                        </div>


                        <form
                            className="fire-form"
                            onSubmit={
                                handleSaveTrigger
                            }
                        >

                            <div className="form-group">

                                <label htmlFor="trigger-name">
                                    Trigger Name
                                </label>

                                <input
                                    id="trigger-name"
                                    name="name"
                                    type="text"
                                    value={form.name}
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="Payment Completed"
                                    disabled={saving}
                                    required
                                />

                            </div>


                            <div className="form-group">

                                <label htmlFor="trigger-event-key">
                                    Event Key
                                </label>

                                <input
                                    id="trigger-event-key"
                                    name="event_key"
                                    type="text"
                                    value={
                                        form.event_key
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="payment.completed"
                                    disabled={saving}
                                    required
                                />

                                <small>
                                    Use a unique machine-readable
                                    event identifier.
                                </small>

                            </div>


                            <div className="form-group">

                                <label htmlFor="trigger-description">
                                    Description
                                </label>

                                <textarea
                                    id="trigger-description"
                                    name="description"
                                    value={
                                        form.description
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="Describe when this trigger should be executed."
                                    rows="4"
                                    disabled={saving}
                                />

                            </div>


                            <label className="template-checkbox">

                                <input
                                    type="checkbox"
                                    name="active"
                                    checked={
                                        form.active
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    disabled={saving}
                                />

                                <span>
                                    Trigger is active
                                </span>

                            </label>


                            <div className="fire-form-actions">

                                <button
                                    type="button"
                                    className="modal-cancel-button"
                                    onClick={
                                        closeFormModal
                                    }
                                    disabled={saving}
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="modal-save-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingTrigger
                                            ? "Update Trigger"
                                            : "Create Trigger"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =================================
          FIRE TRIGGER MODAL
      ================================= */}

            {selectedTrigger && (

                <div
                    className="fire-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeFireModal();
                        }

                    }}
                >

                    <div className="fire-modal">

                        <div className="fire-modal-header">

                            <div>

                                <h2>
                                    Fire Notification
                                </h2>

                                <p>
                                    Execute this trigger and
                                    send notifications.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="modal-close-button"
                                onClick={
                                    closeFireModal
                                }
                                disabled={firing}
                            >
                                ×
                            </button>

                        </div>


                        {!fireResult ? (

                            <form
                                className="fire-form"
                                onSubmit={
                                    handleFireTrigger
                                }
                            >

                                <div className="fire-trigger-info">

                                    <span>
                                        Trigger
                                    </span>

                                    <strong>
                                        {
                                            selectedTrigger.name
                                        }
                                    </strong>

                                    <code>
                                        {
                                            selectedTrigger.event_key
                                        }
                                    </code>

                                </div>



                                <div className="form-group">
                                    <label htmlFor="fire-email">
                                        Email Recipient
                                    </label>
                                    <input
                                        id="fire-email"
                                        type="email"
                                        value={recipients.email}
                                        onChange={(event) =>
                                            setRecipients((previous) => ({
                                                ...previous,
                                                email: event.target.value,
                                            }))
                                        }
                                        placeholder="yourname@gmail.com"
                                        disabled={firing}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="fire-whatsapp">
                                        WhatsApp Recipient
                                    </label>
                                    <input
                                        id="fire-whatsapp"
                                        type="tel"
                                        value={recipients.whatsapp}
                                        onChange={(event) =>
                                            setRecipients((previous) => ({
                                                ...previous,
                                                whatsapp: event.target.value,
                                            }))
                                        }
                                        placeholder="919876543210"
                                        disabled={firing}
                                    />
                                    <small>
                                        Enter country code and phone number.
                                        Leave blank to skip WhatsApp.
                                    </small>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="fire-web-push">
                                        Web Push Recipient
                                    </label>
                                    <input
                                        id="fire-web-push"
                                        type="text"
                                        value={recipients.web_push}
                                        onChange={(event) =>
                                            setRecipients((previous) => ({
                                                ...previous,
                                                web_push: event.target.value,
                                            }))
                                        }
                                        placeholder="OneSignal Subscription ID"
                                        disabled={firing}
                                    />
                                </div>



                                <div className="fire-info-box">

                                    <strong>
                                        What will happen?
                                    </strong>

                                    <p>
                                        The system will check all
                                        enabled templates for this
                                        trigger and attempt delivery
                                        through their configured
                                        channels.
                                    </p>

                                </div>


                                <div className="fire-form-actions">

                                    <button
                                        type="button"
                                        className="modal-cancel-button"
                                        onClick={
                                            closeFireModal
                                        }
                                        disabled={firing}
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="submit"
                                        className="modal-save-button"
                                        disabled={firing}
                                    >
                                        {firing
                                            ? "Executing..."
                                            : "Fire Trigger"}
                                    </button>

                                </div>

                            </form>

                        ) : (

                            <div className="fire-result">

                                <div className="fire-success-icon">
                                    ✓
                                </div>

                                <h3>
                                    Trigger Executed
                                </h3>

                                <p>
                                    Notification delivery
                                    attempts have been
                                    recorded.
                                </p>


                                <div className="fire-result-list">

                                    {fireResult.map(
                                        (notification) => (

                                            <div
                                                className="fire-result-item"
                                                key={
                                                    notification.id
                                                }
                                            >

                                                <div>

                                                    <strong>
                                                        {getChannelLabel(
                                                            notification.channel
                                                        )}
                                                    </strong>

                                                    <span>
                                                        {
                                                            notification.recipient
                                                        }
                                                    </span>

                                                </div>


                                                <StatusBadge
                                                    status={
                                                        notification.status
                                                    }
                                                />

                                            </div>

                                        )
                                    )}

                                </div>


                                <div className="fire-result-actions">

                                    <button
                                        type="button"
                                        className="modal-cancel-button"
                                        onClick={
                                            closeFireModal
                                        }
                                    >
                                        Close
                                    </button>

                                </div>

                            </div>

                        )}

                    </div>

                </div>

            )}

        </div>
    );
}


export default Triggers;