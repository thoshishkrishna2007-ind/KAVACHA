import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { api } from '../api/client';
import { AppNotification } from '../types/backend';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatientById: (id: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onSelectPatientById,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen]);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#DCE7E3] overflow-hidden text-[#111e1a]">
        
        {/* Header */}
        <div className="bg-[#FAF8F1] border-b border-[#DCE7E3] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#267A68] text-white flex items-center justify-center shadow-xs">
              <Bell className="w-4 h-4 text-[#63DCE8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold font-display text-[#111e1a]">
                  Transition Safety Notification Center
                </h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#B42332] text-white font-bold">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#6f7975]">
                Real-time alerts for blocked gates, medication discrepancies, and escalations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] text-[#006971] hover:text-[#006150] font-semibold transition-colors cursor-pointer"
              >
                Mark all read
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-[#6f7975] hover:text-[#111e1a] hover:bg-black/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications Feed List */}
        <div className="p-4 space-y-2.5 max-h-[70vh] overflow-y-auto text-xs">
          {loading ? (
            <div className="py-8 text-center text-[#6f7975]">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-[#6f7975]">No notifications at this time.</div>
          ) : (
            notifications.map((notif) => {
              const isCritical = notif.severity === 'critical';
              const isWarning = notif.severity === 'warning';
              const isResolved = notif.severity === 'resolved';

              return (
                <div
                  key={notif.id}
                  className={`p-3 rounded-xl border transition-all ${
                    notif.read ? 'bg-[#FAF8F1]/60 border-[#DCE7E3]' : 'bg-white border-[#63DCE8]/60 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.2 rounded ${
                          isCritical
                            ? 'bg-[#B42332]/10 text-[#B42332]'
                            : isWarning
                            ? 'bg-[rgba(198,161,91,0.2)] text-[#9A6500]'
                            : isResolved
                            ? 'bg-[#e8f7f1] text-[#247A56]'
                            : 'bg-[#DDF8F8] text-[#006971]'
                        }`}
                      >
                        {notif.category}
                      </span>

                      <span className="font-bold text-[#111e1a]">
                        {notif.patientName}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-[#6f7975]">
                      {notif.createdAt}
                    </span>
                  </div>

                  <h5 className="font-semibold text-[#111e1a] text-xs">
                    {notif.title}
                  </h5>

                  <p className="text-[#3f4945] text-[11px] leading-relaxed mt-0.5">
                    {notif.message}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-[#DCE7E3]/60 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectPatientById(notif.transitionId);
                        onClose();
                      }}
                      className="text-[#006971] hover:text-[#006150] font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View Patient Transition</span>
                    </button>

                    {!notif.read && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(notif.id)}
                        className="text-[#6f7975] hover:text-[#111e1a] text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3 text-[#247A56]" />
                        <span>Acknowledge</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#FAF8F1] border-t border-[#DCE7E3] p-3 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#267A68] hover:bg-[#20594B] text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
