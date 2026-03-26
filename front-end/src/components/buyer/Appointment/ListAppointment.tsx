import React, { useEffect, useState, useMemo } from 'react';
import type { Appointment } from '@/types/Appointment';
import { cancelAppointmentBuyer, getAllAppoinments } from '@/services/buyer.service';
import { getLanguage } from '@/utils/storage';
import { Pagination, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import useTitle from '@/hooks/useTitle';
import { Bounce, toast, ToastContainer } from 'react-toastify';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
type FilterStatus = "all" | "pending" | "accepted" | "rejected";

const ListAppointment = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
    const [page, setPage] = useState(1);

    const itemsPerPage = 6;
    const language = getLanguage();
    const { t } = useTranslation('bookAppointment');
    useTitle(t('appointment.pageTitleFull'));

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await getAllAppoinments();
                console.log("Response appointment:", response);
                setAppointments(response || []);
            } catch (error) {
                console.error("Failed to fetch appointments:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    const stats = useMemo(() => {
        const totalPending = appointments.filter((a) => a.status === "pending").length;
        const totalAccepted = appointments.filter((a) => a.status === "accepted").length;
        const totalRejected = appointments.filter((a) => a.status === "rejected").length;
        return { totalPending, totalAccepted, totalRejected, total: appointments.length };
    }, [appointments]);

    const filteredAppointments = useMemo(() => {
        let filtered = appointments;
        if (statusFilter !== "all") {
            filtered = appointments.filter((a) => a.status === statusFilter);
        }
        return filtered.sort((a, b) => new Date(a.final_time).getTime() - new Date(b.final_time).getTime());
    }, [appointments, statusFilter]);

    const paginatedAppointments = useMemo(() => {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredAppointments.slice(startIndex, endIndex);
    }, [filteredAppointments, page]);

    const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const handleCancelAppointment = (appointmentId: string) => {
        const cancelAppointment = async () => {
            try {
                await cancelAppointmentBuyer(appointmentId);
                toast.success(t('appointment.cancelSuccess'));
                setAppointments(prev =>
                    prev.map(a =>
                        a._id === appointmentId ? { ...a, status: "rejected" } : a
                    )
                );

            } catch (error) {
                console.error("Failed to cancel appointment:", error);
                toast.error(t('appointment.cancelError'));
            }
        };
        cancelAppointment();
    };


    useEffect(() => {
        setPage(1);
    }, [statusFilter]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                        {t('appointment.pageTitle')}
                    </h1>
                    <p className="text-slate-600 text-sm sm:text-base">
                        {t('appointment.pageDescription')}
                    </p>
                </div>

                {!loading && appointments.length > 0 && (
                    <div className="mb-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6 text-white shadow-xl">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                            <div>
                                <p className="text-sm uppercase tracking-wide text-slate-300 mb-1">{t('appointment.filterStatus')}</p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {(["all", "pending", "accepted", "rejected"] as FilterStatus[]).map((item) => (
                                        <button
                                            key={item}
                                            onClick={() => setStatusFilter(item)}
                                            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${statusFilter === item
                                                ? "bg-white text-slate-900 shadow-lg"
                                                : "bg-white/10 text-white/70 hover:bg-white/20"
                                                }`}
                                        >
                                            {item === "all" ? t('appointment.all') : item === "pending" ? t('appointment.pending') : item === "accepted" ? t('appointment.accepted') : t('appointment.rejected')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl bg-white/10 p-4 backdrop-blur border border-white/20">
                                <p className="text-xs text-slate-300 mb-1">{t('appointment.total')}</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <div className="rounded-xl bg-white/10 p-4 backdrop-blur border border-white/20">
                                <p className="text-xs text-slate-300 mb-1">{t('appointment.totalPending')}</p>
                                <p className="text-2xl font-bold text-amber-200">{stats.totalPending}</p>
                            </div>
                            <div className="rounded-xl bg-white/10 p-4 backdrop-blur border border-white/20">
                                <p className="text-xs text-slate-300 mb-1">{t('appointment.totalAccepted')}</p>
                                <p className="text-2xl font-bold text-emerald-200">{stats.totalAccepted}</p>
                            </div>
                            <div className="rounded-xl bg-white/10 p-4 backdrop-blur border border-white/20">
                                <p className="text-xs text-slate-300 mb-1">{t('appointment.totalRejected')}</p>
                                <p className="text-2xl font-bold text-rose-200">{stats.totalRejected}</p>
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-64 animate-pulse rounded-2xl bg-white shadow-md border border-slate-200" />
                        ))}
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
                        <p className="text-lg font-medium text-slate-600">
                            {t('appointment.noAppointments')}
                        </p>
                    </div>
                ) : filteredAppointments.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
                        <p className="text-lg font-medium text-slate-600">
                            {t('appointment.noAppointmentsWithStatus')} "{statusFilter === "all" ? t('appointment.all') : statusFilter === "pending" ? t('appointment.pending') : statusFilter === "accepted" ? t('appointment.accepted') : t('appointment.rejected')}"
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-6 md:grid-cols-2 mb-8">
                            {paginatedAppointments.map((appointment) => (
                                <div
                                    key={appointment._id}
                                    className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-md border border-slate-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div className="flex-1">
                                            <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                                                {t('appointment.Real Estate')}
                                            </p>
                                            <h2 className="text-xl font-bold text-slate-900 mb-1 line-clamp-2">
                                                {appointment.property_id?.title[language] || appointment.property_id?.title.en}
                                            </h2>
                                            <p className="text-sm text-slate-500 flex items-center gap-1">
                                                <span>📍</span>
                                                <span className="line-clamp-1">
                                                    {appointment.property_id?.address[language] || appointment.property_id?.address.en}
                                                </span>
                                            </p>
                                            {appointment.property_id?.price && (
                                                <p className="text-lg font-semibold text-emerald-600 mt-2">
                                                    {appointment.property_id.price.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')} {language === 'vi' ? 'VNĐ' : 'USD'}
                                                </p>
                                            )}
                                        </div>
                                        <span
                                            className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide whitespace-nowrap ${appointment.status === "pending"
                                                ? "bg-amber-100 text-amber-700 border border-amber-200"
                                                : appointment.status === "accepted"
                                                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                                    : "bg-rose-100 text-rose-700 border border-rose-200"
                                                }`}
                                        >
                                            {appointment.status === "pending"
                                                ? t('appointment.pending')
                                                : appointment.status === "accepted"
                                                    ? t('appointment.accepted')
                                                    : t('appointment.rejected')}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                                            <p className="text-xs text-slate-500 mb-2">{t('appointment.appointmentInfo')}</p>
                                            <div className="space-y-2">
                                                <div>
                                                    <p className="text-xs text-slate-500">{t('appointment.timeLabel')}</p>
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {new Date(appointment.final_time).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                                {appointment.location && (
                                                    <div>
                                                        <p className="text-xs text-slate-500">{t('appointment.location')}</p>
                                                        <p className="text-sm font-medium text-slate-800">
                                                            📍 {appointment.location}
                                                        </p>
                                                    </div>
                                                )}
                                                {appointment.times && appointment.times.length > 0 && appointment.times[0].note && (
                                                    <div>
                                                        <p className="text-xs text-slate-500">{t('appointment.noteLabel')}</p>
                                                        <p className="text-sm text-slate-700">{appointment.times[0].note}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
                                            <p className="text-xs text-slate-500 mb-2">{t('appointment.agent')}</p>
                                            <p className="text-sm font-semibold text-slate-800">
                                                {appointment.agent_id?.fullName || t('appointment.noAgent')}
                                            </p>
                                            {appointment.agent_id?.email && (
                                                <p className="text-xs text-slate-500 mt-1">{appointment.agent_id.email}</p>
                                            )}
                                        </div>

                                        {appointment.seller_id && (
                                            <div className="rounded-xl bg-purple-50 p-4 border border-purple-100">
                                                <p className="text-xs text-slate-500 mb-2">{t('appointment.owner')}</p>
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {appointment.seller_id.fullName}
                                                </p>
                                                {appointment.seller_id.email && (
                                                    <p className="text-xs text-slate-500 mt-1">{appointment.seller_id.email}</p>
                                                )}
                                                {appointment.seller_id.phone && (
                                                    <p className="text-xs text-slate-500">{appointment.seller_id.phone}</p>
                                                )}
                                            </div>
                                        )}

                                        {appointment.status === "accepted" && (
                                            <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200">
                                                <p className="text-xs font-semibold text-emerald-700 mb-1">
                                                    ✓ {t('appointment.acceptedMessage')}
                                                </p>
                                                <p className="text-xs text-emerald-600">
                                                    {t('appointment.acceptedInstruction')}
                                                </p>
                                            </div>
                                        )}

                                        {appointment.status === "rejected" && (
                                            <div className="rounded-xl bg-rose-50 p-4 border border-rose-200">
                                                <p className="text-xs font-semibold text-rose-700 mb-1">
                                                    ✗ {t('appointment.rejectedMessage')}
                                                </p>
                                                <p className="text-xs text-rose-600">
                                                    {t('appointment.rejectedInstruction')}
                                                </p>
                                            </div>
                                        )}
                                        {appointment.status === "pending" && (
                                            <div className="flex justify-center mt-2">
                                                <button
                                                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
                                                    onClick={() => handleCancelAppointment(appointment._id)}
                                                >
                                                    <CancelOutlinedIcon className="text-lg" />
                                                    {t('appointment.cancel')}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
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

                        {totalPages > 1 && (
                            <div className="flex justify-center mt-8 pb-4">
                                <Stack spacing={2}>
                                    <Pagination
                                        count={totalPages}
                                        page={page}
                                        onChange={handlePageChange}
                                        color="primary"
                                        size="large"
                                        showFirstButton
                                        showLastButton
                                        sx={{
                                            '& .MuiPaginationItem-root': {
                                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                            },
                                        }}
                                    />
                                </Stack>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ListAppointment;