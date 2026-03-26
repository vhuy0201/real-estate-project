import React, { useEffect, useState, useMemo } from 'react';
import { getAllAssignments } from '../../services/agent.service';
import type { AssignAgent } from '../../types/AsssignAgents';
import { Bounce, toast, ToastContainer } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { acceptAssignAgent } from '../../services/agent.service';
import { rejectAssignAgent } from '../../services/agent.service';
import { Pagination, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from '@mui/material';
import { getLanguage } from '@/utils/storage';

type FilterStatus = "all" | "pending" | "accepted" | "rejected";

const AssignAgentPage = () => {
    const [assignments, setAssignments] = useState<AssignAgent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterStatus>("all");
    const [page, setPage] = useState(1);
    const itemsPerPage = 6;
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectNote, setRejectNote] = useState("");
    const [selectedRejectId, setSelectedRejectId] = useState<string | null>(null);
    const { t } = useTranslation(['listAgents', 'assignAgent']);
    const language = getLanguage();
    useEffect(() => {
        const fetchAllAssign = async () => {
            try {
                const response = await getAllAssignments();
                setAssignments(response || []);
            } catch (error) {
                console.log('Cannot fetch assignments', error);
                toast.error('Cannot fetch assignments');
            } finally {
                setLoading(false);
            }
        };
        fetchAllAssign();
    }, []);

    const handleAccept = async (id: string) => {
        try {
            const data = await acceptAssignAgent(id);

            toast.success(t('assignAgent:toastAcceptSuccess'));
            setAssignments(prev =>
                prev.map(a =>
                    a._id === id
                        ? { ...a, status: "accepted" as const }
                        : a
                )
            );
            return data;
        } catch (error: any) {
            console.error("Error accepting assignment:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Error accepting assignment";
            toast.error('' + errorMessage);
        }
    };
    const handleOpenRejectModal = (id: string) => {
        setSelectedRejectId(id);
        setRejectNote("");
        setRejectModalOpen(true);
    };

    const handleCloseRejectModal = () => {
        setRejectModalOpen(false);
        setSelectedRejectId(null);
        setRejectNote("");
    };

    const handleReject = async () => {
        if (!selectedRejectId) return;

        if (!rejectNote.trim()) {
            toast.error(t('assignAgent:toastMissingReason'));
            return;
        }

        try {
            const response = await rejectAssignAgent(selectedRejectId, rejectNote.trim());
            console.log("Response data:", response);
            toast.success(t('assignAgent:toastRejectSuccess'));
            setAssignments(prev =>
                prev.map(a =>
                    a._id === selectedRejectId
                        ? { ...a, status: "rejected" }
                        : a
                )
            );
            handleCloseRejectModal();
        } catch (error: any) {
            console.error("Error rejecting assignment:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Error rejecting assignment";
            toast.error(errorMessage);
        }
    };

    const stats = useMemo(() => {
        const totalPending = assignments.filter((a) => a.status === "pending").length;
        const totalAccepted = assignments.filter((a) => a.status === "accepted").length;
        const totalRejected = assignments.filter((a) => a.status === "rejected").length;
        return { totalPending, totalAccepted, totalRejected, total: assignments.length };
    }, [assignments]);

    const filteredAssignments = useMemo(() => {
        if (filter === "all") {
            return assignments;
        }
        return assignments.filter((a) => a.status === filter);
    }, [assignments, filter]);

    const paginatedAssignments = useMemo(() => {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredAssignments.slice(startIndex, endIndex);
    }, [filteredAssignments, page]);

    const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        setPage(1);
    }, [filter]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">{t('assignAgent:assignAgent')}</h1>
                    <p className="text-slate-600 text-sm sm:text-base">{t('assignAgent:manageRequests')}</p>

                </div>

                {!loading && assignments.length > 0 && (
                    <div className="mb-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6 text-white shadow-xl">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                            <div>
                                <p className="text-sm uppercase tracking-wide text-slate-300 mb-1">{t('assignAgent:filterStatus')}</p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {(["all", "pending", "accepted", "rejected"] as FilterStatus[]).map((item) => (
                                        <button
                                            key={item}
                                            onClick={() => setFilter(item)}
                                            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${filter === item
                                                ? "bg-white text-slate-900 shadow-lg"
                                                : "bg-white/10 text-white/70 hover:bg-white/20"
                                                }`}
                                        >
                                            {item === "all" ? t('assignAgent:all') : item === "pending" ? t('assignAgent:pending') : item === "accepted" ? t('assignAgent:accepted') : t('assignAgent:rejected')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl bg-white/10 p-4 backdrop-blur border border-white/20">
                                <p className="text-xs text-slate-300 mb-1">{t('assignAgent:total')}</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <div className="rounded-xl bg-white/10 p-4 backdrop-blur border border-white/20">
                                <p className="text-xs text-slate-300 mb-1">{t('assignAgent:totalPending')}</p>
                                <p className="text-2xl font-bold text-amber-200">{stats.totalPending}</p>
                            </div>
                            <div className="rounded-xl bg-white/10 p-4 backdrop-blur border border-white/20">
                                <p className="text-xs text-slate-300 mb-1">{t('assignAgent:totalAccepted')}</p>
                                <p className="text-2xl font-bold text-emerald-200">{stats.totalAccepted}</p>
                            </div>
                            <div className="rounded-xl bg-white/10 p-4 backdrop-blur border border-white/20">
                                <p className="text-xs text-slate-300 mb-1">{t('assignAgent:totalRejected')}</p>
                                <p className="text-2xl font-bold text-rose-200">{stats.totalRejected}</p>
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-40 animate-pulse rounded-2xl bg-white shadow-md border border-slate-200" />
                        ))}
                    </div>
                ) : assignments.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
                        <p className="text-lg font-medium text-slate-600">{t('noAgentFound')}</p>
                    </div>
                ) : filteredAssignments.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
                        <p className="text-lg font-medium text-slate-600">
                            {`${t('assignAgent:notFoundWithStatus')} `}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 mb-8">
                            {paginatedAssignments.map((item) => (
                                <div
                                    key={item._id}
                                    className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-md border border-slate-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <p className="text-xl font-bold text-slate-900 mb-1 line-clamp-2">
                                                    {item.property_id?.title[language]}
                                                </p>
                                                <p className="text-slate-500 text-sm flex items-center gap-1">

                                                    <span className="line-clamp-1">{item.property_id?.address[language]}</span>
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                                                <p className="text-xs text-slate-500 mb-1">{t('assignAgent:owner')}</p>
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {item.owner_id.fullName}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">{item.owner_id.email}</p>
                                            </div>

                                            <span
                                                className={`
                                                    inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full
                                                    ${item.status === "pending"
                                                        ? "bg-amber-100 text-amber-700 border border-amber-200"
                                                        : item.status === "accepted"
                                                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                                            : "bg-rose-100 text-rose-700 border border-rose-200"
                                                    }
                                                `}
                                            >
                                                {item.status}
                                            </span>
                                        </div>

                                        {item.status === "pending" && (
                                            <div className="flex flex-col sm:flex-row gap-2 sm:ml-4">
                                                <button
                                                    onClick={() => handleAccept(item._id)}
                                                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-all duration-200 hover:from-emerald-700 hover:to-emerald-800 hover:shadow-md active:scale-95"
                                                >
                                                    {t('assignAgent:btnAccept')}
                                                </button>
                                                <button
                                                    onClick={() => handleOpenRejectModal(item._id)}
                                                    className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-all duration-200 hover:from-rose-700 hover:to-rose-800 hover:shadow-md active:scale-95"
                                                >
                                                    {t('assignAgent:btnReject')}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center mt-8 pb-4 truncate">

                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    onChange={handlePageChange}
                                    color="primary"
                                    size="large"
                                    showFirstButton
                                    showLastButton
                                    siblingCount={0}
                                    boundaryCount={1}
                                    sx={{
                                        '& .MuiPaginationItem-root': {
                                            fontSize: { xs: '0.75rem', sm: '1rem' },
                                        },
                                    }}
                                />

                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Reject Modal */}
            <Dialog
                open={rejectModalOpen}
                onClose={handleCloseRejectModal}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                    }
                }}
            >
                <DialogTitle sx={{
                    bgcolor: "error.light",
                    color: "error.contrastText",
                    fontWeight: "bold",
                    fontSize: "1.25rem"
                }}>
                    {t('assignAgent:modalRejectTitle')}
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {t('assignAgent:modalRejectSubtitle')}
                    </Typography>
                    <TextField
                        autoFocus
                        fullWidth
                        multiline
                        rows={4}
                        label={t('assignAgent:rejectReasonLabel')}
                        placeholder={t('assignAgent:rejectReasonPlaceholder')}
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        variant="outlined"
                        sx={{ mt: 1 }}
                        inputProps={{
                            maxLength: 500
                        }}
                        helperText={`${rejectNote.length}/500 ký tự`}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button
                        onClick={handleCloseRejectModal}
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                    >
                        {t('assignAgent:btnCancel')}
                    </Button>
                    <Button
                        onClick={handleReject}
                        variant="contained"
                        color="error"
                        disabled={!rejectNote.trim()}
                        sx={{ borderRadius: 2 }}
                    >
                        {t('assignAgent:btnConfirmReject')}
                    </Button>
                </DialogActions>
            </Dialog>

            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
            />
        </div>
    );
};

export default AssignAgentPage;
