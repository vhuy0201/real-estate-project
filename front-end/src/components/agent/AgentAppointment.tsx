import { useEffect, useMemo, useState } from "react";
import type { AgentAppointment } from "@/types/AgentAppointment";
import { getAllAppointmentsByAgent } from "@/services/agent.service";
import { getLanguage } from "@/utils/storage";
import { acceptAppointment } from "@/services/agent.service";
import { rejectAppointment } from "@/services/agent.service";
import { toast, Bounce, ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";

const AgentListAppointment = () => {
    const [appointments, setAppointments] = useState<AgentAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"pending" | "accepted" | "rejected">("pending");
    const language = getLanguage();
    const { t } = useTranslation('bookAppointment');
    const stats = useMemo(() => {
        const totalPending = appointments.filter((a) => a.status === "pending").length;
        const totalAccepted = appointments.filter((a) => a.status === "accepted").length;
        const totalRejected = appointments.filter((a) => a.status === "rejected").length;
        return { totalPending, totalAccepted, totalRejected, total: appointments.length };
    }, [appointments]);

    useEffect(() => {
        const fetchAgentAppointments = async () => {
            try {
                const data = await getAllAppointmentsByAgent();
                setAppointments(data);
                console.log(data)
            } catch (error) {
                console.error("Failed to fetch agent appointments:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAgentAppointments();
    }, []);

    const handleAccept = async (appointmentId: string, time: Date) => {
        try {
            const res = await acceptAppointment(appointmentId, time);
            toast.success("Accept appointment successfully");
            console.log(res);
            setAppointments(prev =>
                prev.map(a =>
                    a._id === appointmentId
                        ? { ...a, status: "accepted", final_time: time }
                        : a
                )
            );
        } catch (error) {
            console.log("Cannot accept ");
            toast.error("Cannot accept appointments");
            throw error;
        }

    };

    const handleReject = async (appointmentId: string) => {
        try {
            const res = await rejectAppointment(appointmentId);
            toast.success("Reject appointment successfully");
            console.log(res);
            setAppointments(prev =>
                prev.map(a =>
                    a._id === appointmentId
                        ? { ...a, status: "rejected" }
                        : a
                )
            );
        } catch (error) {
            console.log("Cannnot reject");
            toast.error("Cannot reject appointments");
            throw error;
        }
    };

    const filteredAppointments = appointments.filter(
        (a) => a.status === filter
    );


    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-6xl px-2 py-10">
                <header className="flex flex-col gap-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-8 text-white shadow-xl">
                    <div className="flex flex-wrap items-center justify-between gap-4 ">
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-slate-300">{t('appointment.agentPortal')}</p>

                            <h1 className="text-3xl font-semibold mt-2">{t('appointment.title')}</h1>

                        </div>
                        <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-medium backdrop-blur  ">
                            <span className="text-slate-200">{t('appointment.status')}</span>
                            <div className="flex overflow-hidden rounded-full border border-white/20 ">
                                {(["pending", "accepted", "rejected"] as const).map((item) => (
                                    <button
                                        key={item}
                                        onClick={() => setFilter(item)}
                                        className={`px-2 py-1  text-xs font-semibold uppercase tracking-wide transition ${filter === item ? "bg-white text-slate-900" : "text-white/70"}`}
                                    >
                                        {item === "pending" ? t('appointment.pending') : item === "accepted" ? t('appointment.accepted') : t('appointment.rejected')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-4">
                        <div className="rounded-2xl bg-white/10 p-4 backdrop-blur shadow-inner">
                            <p className="text-sm text-slate-300">{t('appointment.totalAppointments')}</p>
                            <p className="text-3xl font-semibold">{stats.total}</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-4 backdrop-blur shadow-inner">
                            <p className="text-sm text-slate-300">{t('appointment.totalPending')}</p>
                            <p className="text-3xl font-semibold text-amber-200">{stats.totalPending}</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-4 backdrop-blur shadow-inner">
                            <p className="text-sm text-slate-300">{t('appointment.totalAccepted')}</p>
                            <p className="text-3xl font-semibold text-emerald-200">{stats.totalAccepted}</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-4 backdrop-blur shadow-inner">
                            <p className="text-sm text-slate-300">{t('appointment.totalRejected')}</p>
                            <p className="text-3xl font-semibold text-rose-200">{stats.totalRejected}</p>
                        </div>
                    </div>
                </header>

                <section className="mt-8">
                    {loading ? (
                        <div className="grid gap-6 md:grid-cols-2">
                            {[1, 2, 3, 4].map((item) => (
                                <div key={item} className="h-48 animate-pulse rounded-3xl bg-white shadow-lg" />
                            ))}
                        </div>
                    ) : filteredAppointments.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
                            <p className="text-lg font-medium text-slate-700">{t('appointment.noAppointments')}</p>

                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                            {filteredAppointments.map((appointment) => (
                                <article
                                    key={appointment._id}
                                    className="flex h-full flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/70 transition hover:-translate-y-1 hover:shadow-xl"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-slate-400">{t('appointment.Real Estate')}</p>
                                            <h2 className="text-xl font-semibold text-slate-900">{appointment.property_id.title[language]}</h2>
                                            <p className="text-sm text-slate-500">📍 {appointment.property_id.address[language]}</p>
                                        </div>
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${appointment.status === "pending"
                                                ? "bg-amber-100 text-amber-700"
                                                : appointment.status === "accepted"
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-rose-100 text-rose-700"
                                                }`}
                                        >
                                            {appointment.status === "pending" ? t('appointment.pending') : appointment.status === "accepted" ? t('appointment.accepted') : t('appointment.rejected')}
                                        </span>
                                    </div>

                                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-600">
                                        <p className="font-semibold text-slate-700">{t('appointment.customer')}</p>
                                        <p>{appointment.buyer_id.fullName}</p>
                                        <p className="text-xs text-slate-500">{appointment.buyer_id.email}</p>
                                    </div>

                                    {filter === "pending" ? (
                                        <div className="flex flex-col gap-3">
                                            <p className="text-sm font-semibold text-slate-700">{t('appointment.time')}</p>
                                            {appointment.times.map((timeSlot) => (
                                                <div
                                                    key={timeSlot._id}
                                                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600"
                                                >
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-medium text-slate-800">
                                                            {new Date(timeSlot.time).toLocaleString()}
                                                        </span>
                                                        <span className="text-xs text-slate-500">{timeSlot.note || t('appointment.noNote')}</span>
                                                    </div>
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        <button
                                                            onClick={() => handleAccept(appointment._id, new Date(timeSlot.time))}
                                                            className="flex-1 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                                                        >
                                                            {t('appointment.accept')}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => handleReject(appointment._id)}
                                                className="rounded-2xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"
                                            >
                                                {t('appointment.rejectAppointment')}
                                            </button>
                                        </div>
                                    ) : filter === "accepted" ? (
                                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
                                            <p className="text-xs uppercase tracking-wide text-emerald-600">{t('appointment.finalTime')}</p>
                                            <p className="text-lg font-semibold text-emerald-800">
                                                {appointment.final_time ? new Date(appointment.final_time).toLocaleString() : t('appointment.updating')}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
                                            <p className="text-xs uppercase tracking-wide text-rose-600">{t('appointment.rejected')}</p>
                                            <p>{t('appointment.appointmentRejectedNotice')}</p>
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>
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
        </div>
    );
};

export default AgentListAppointment;
