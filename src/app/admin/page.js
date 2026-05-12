"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useSupabase } from "@/contexts/SupabaseContext";
import {
  getAllGuests,
  createGuest,
  updateGuest,
  deleteGuest,
  isAdmin,
} from "@/lib/supabase";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Check,
  AlertCircle,
  Mail,
  Loader2,
  ArrowLeft,
  Copy,
  Check as CheckIcon,
  KeyRound,
} from "lucide-react";

export default function Admin() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, signIn, signOut, verifyCode } = useSupabase();
  const [copiedId, setCopiedId] = useState(null);

  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Email login states
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState(null);

  // OTP verification states
  const [otpCode, setOtpCode] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    reservedSpots: 1,
  });
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const adminStatus = await isAdmin(user.email);
        if (adminStatus) {
          setIsAuthorized(true);
          await loadGuests();
        } else {
          setIsAuthorized(false);
        }
      } catch (err) {
        console.error("Error checking admin status:", err);
        setIsAuthorized(false);
      }
      setLoading(false);
    }

    checkAuth();
  }, [user]);

  const loadGuests = async () => {
    try {
      const data = await getAllGuests();
      setGuests(data);
    } catch (err) {
      console.error("Error loading guests:", err);
    }
  };

  const handleCopyLink = (guest) => {
    const link = `${window.location.origin}/?code=${guest.url_code}`;
    navigator.clipboard.writeText(link);
    setCopiedId(guest.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailError(null);
    setSendingEmail(true);

    try {
      await signIn(email);
      setEmailSent(true);
    } catch (err) {
      console.error("Error sending code:", err);
      setEmailError("Failed to send code. Please try again.");
    }

    setSendingEmail(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError(null);
    setVerifyingOtp(true);

    try {
      await verifyCode(email, otpCode);
    } catch (err) {
      console.error("OTP verification error:", err);
      if (err?.message?.includes("expired")) {
        setOtpError("Code expired. Please request a new one.");
      } else {
        setOtpError("Invalid code. Please check and try again.");
      }
    }

    setVerifyingOtp(false);
  };

  const handleResendCode = async () => {
    setOtpError(null);
    try {
      await signIn(email);
      setOtpCode("");
      setOtpError("New code sent!");
    } catch (err) {
      setOtpError("Failed to resend code. Please try again.");
    }
  };

  const handleLogout = async () => {
    setIsAuthorized(false);
    setGuests([]);
    try { sessionStorage.removeItem("guestCode"); } catch {}
    await signOut();
  };

  const handleAddGuest = () => {
    setEditingGuest(null);
    setFormData({ name: "", email: "", reservedSpots: 1 });
    setFormError(null);
    setShowModal(true);
  };

  const handleEditGuest = (guest) => {
    setEditingGuest(guest);
    setFormData({
      name: guest.name,
      email: guest.email || "",
      reservedSpots: guest.reserved_spots,
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleDeleteGuest = async (guestId) => {
    try {
      await deleteGuest(guestId);
      await loadGuests();
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting guest:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    try {
      if (editingGuest) {
        await updateGuest(editingGuest.id, formData);
      } else {
        await createGuest(formData);
      }
      await loadGuests();
      setShowModal(false);
    } catch (err) {
      console.error("Error saving guest:", err);
      setFormError(err.message || "Error saving guest");
    }

    setSaving(false);
  };

  const filteredGuests = guests.filter(
    (guest) =>
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (guest.email &&
        guest.email.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const totalInvites = guests.length;

  const totalSeats = guests.reduce(
    (sum, g) => sum + (g.reserved_spots ?? 0),
    0,
  );

  const confirmedSeats = guests.reduce(
    (sum, g) => sum + (g.rsvp === true ? (g.rsvp_count ?? 0) : 0),
    0,
  );

  const declinedInvites = guests.filter((g) => g.rsvp === false).length;

  // Pending seats = reserved seats for invites that haven’t responded yet
  const pendingSeats = guests.reduce(
    (sum, g) => sum + (g.rsvp === null ? (g.reserved_spots ?? 0) : 0),
    0,
  );

  const confirmedAdults = guests.reduce(
    (sum, g) => sum + (g.rsvp === true ? (g.adults_count ?? 0) : 0),
    0,
  );

  const confirmedKids7to9 = guests.reduce(
    (sum, g) => sum + (g.rsvp === true ? (g.kids_7_to_9_count ?? 0) : 0),
    0,
  );

  const confirmedKids6Under = guests.reduce(
    (sum, g) => sum + (g.rsvp === true ? (g.kids_6_under_count ?? 0) : 0),
    0,
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-indigo dark:text-pink">
          {t("common.loading")}
        </div>
      </div>
    );
  }

  // Not logged in - show email login
  if (!user) {
    return (
      <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <div className="glass-card">
            <AnimatePresence mode="wait">
              {!emailSent ? (
                <motion.div
                  key="email-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="w-16 h-16 bg-indigo/10 dark:bg-pink/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8 text-indigo dark:text-pink" />
                  </div>

                  <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">
                    Admin Login
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Enter your admin email to access the dashboard
                  </p>

                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@email.com"
                        required
                        className="input-field text-center"
                      />
                    </div>

                    {emailError && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 text-sm">
                        {emailError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={sendingEmail}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      {sendingEmail ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="w-5 h-5" />
                          Send Login Code
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="otp-verify"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8"
                >
                  <div className="w-16 h-16 bg-indigo/10 dark:bg-pink/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <KeyRound className="w-8 h-8 text-indigo dark:text-pink" />
                  </div>

                  <h2 className="text-2xl font-bold text-indigo dark:text-pink mb-2">
                    Enter Your Code
                  </h2>

                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    We sent a 6-digit code to:
                  </p>

                  <p className="text-lg font-medium text-indigo dark:text-pink mb-6">
                    {email}
                  </p>

                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="000000"
                      required
                      className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                    />

                    {otpError && (
                      <div className={`p-3 rounded-lg text-sm ${
                        otpError === "New code sent!"
                          ? "bg-green-50 dark:bg-green-900/20 text-green-600"
                          : "bg-red-50 dark:bg-red-900/20 text-red-600"
                      }`}>
                        {otpError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={otpCode.length < 6 || verifyingOtp}
                      className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {verifyingOtp ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify & Login"
                      )}
                    </button>
                  </form>

                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
                    <button
                      onClick={handleResendCode}
                      className="text-sm text-gray-500 hover:text-indigo dark:hover:text-pink mx-auto block"
                    >
                      Resend code
                    </button>

                    <button
                      onClick={() => {
                        setEmailSent(false);
                        setEmail("");
                        setOtpCode("");
                        setOtpError(null);
                      }}
                      className="text-sm text-gray-500 hover:text-indigo dark:hover:text-pink flex items-center gap-2 mx-auto"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Use a different email
                    </button>
                  </div>

                  <p className="text-xs text-gray-400 mt-4">
                    If you don&apos;t see the email, check your spam folder.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // Logged in but not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <div className="glass-card">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
              {t("admin.accessDenied")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t("admin.accessDeniedMessage")}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Signed in as: {user.email}
            </p>
            <button onClick={handleLogout} className="btn-outline">
              {t("common.logout")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-indigo dark:text-pink">
              {t("admin.title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t("admin.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user.email}</span>
            <button
              onClick={handleAddGuest}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {t("admin.addGuest")}
            </button>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("admin.search")}
              className="input-field pl-10"
            />
          </div>
        </motion.div>

        {/* Guests Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card overflow-x-auto"
        >
          {filteredGuests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {t("admin.noGuests")}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("admin.name")}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("admin.email")}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("admin.reservedSpots")}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("admin.rsvpStatus")}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("admin.language")}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t("admin.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map((guest) => (
                  <tr
                    key={guest.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4 text-sm">{guest.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {guest.email || "-"}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {guest.reserved_spots}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {guest.rsvp === null ? (
                        <span className="text-gray-400">Pending</span>
                      ) : guest.rsvp ? (
                        <span className="text-green-600">
                          <span className="flex items-center gap-1">
                            <Check className="w-4 h-4" />
                            Yes ({guest.rsvp_count})
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {guest.adults_count || 0} adults, {guest.kids_7_to_9_count || 0} kids 7-9, {guest.kids_6_under_count || 0} kids ≤6
                          </span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600">
                          <X className="w-4 h-4" />
                          No
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm uppercase">
                      {guest.language}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyLink(guest)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-indigo dark:text-pink"
                          title="Copy personal link"
                        >
                          {copiedId === guest.id ? (
                            <CheckIcon className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEditGuest(guest)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-indigo dark:text-pink"
                          title={t("admin.editGuest")}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(guest)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
                          title={t("admin.deleteGuest")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="glass-card text-center">
            <p className="text-3xl font-bold text-indigo dark:text-pink">
              {totalInvites}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Invites</p>
          </div>

          <div className="glass-card text-center">
            <p className="text-3xl font-bold text-red-600 dark:text-red-500">
              {declinedInvites}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Declined Invites
            </p>
          </div>

          <div className="glass-card text-center">
            <p className="text-3xl font-bold text-indigo dark:text-pink">
              {totalSeats}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Guests
            </p>
          </div>

          <div className="glass-card text-center">
            <p className="text-3xl font-bold text-green-600">
              {confirmedSeats}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Confirmed Guests
            </p>
          </div>

          <div className="glass-card text-center">
            <p className="text-3xl font-bold text-gold">{pendingSeats}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Pending Guests
            </p>
          </div>

          <div className="glass-card text-center">
            <p className="text-3xl font-bold text-indigo dark:text-pink">{confirmedAdults}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Adults / +9
            </p>
          </div>

          <div className="glass-card text-center">
            <p className="text-3xl font-bold text-indigo dark:text-pink">{confirmedKids7to9}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Kids 7–9
            </p>
          </div>

          <div className="glass-card text-center">
            <p className="text-3xl font-bold text-indigo dark:text-pink">{confirmedKids6Under}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Kids ≤ 6
            </p>
          </div>
        </motion.div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {editingGuest ? t("admin.editGuest") : t("admin.addGuest")}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("admin.name")} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("admin.email")}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Required for email login. Guest will receive a login code at
                    this address.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("admin.reservedSpots")} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.reservedSpots}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reservedSpots: parseInt(e.target.value) || 1,
                      })
                    }
                    required
                    className="input-field"
                  />
                </div>

                {formError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 text-sm">
                    {formError}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-outline flex-1"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    {saving ? t("common.loading") : t("common.save")}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-sm text-center"
            >
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
                Delete Guest?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete{" "}
                <strong>{showDeleteConfirm.name}</strong>? This action cannot be
                undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="btn-outline flex-1"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={() => handleDeleteGuest(showDeleteConfirm.id)}
                  className="btn-secondary flex-1 bg-red-500 hover:bg-red-600"
                >
                  {t("admin.deleteGuest")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}