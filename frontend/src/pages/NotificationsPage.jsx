import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationAPI } from '../services/api';
import { Heart, MessageCircle, UserPlus, Bell, Loader2, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ICONS = { like: Heart, comment: MessageCircle, follow: UserPlus, message: MessageCircle };
const COLORS = { like: 'text-red-400', comment: 'text-accent-400', follow: 'text-emerald-400', message: 'text-primary-400' };

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationAPI.getAll().then((r) => r.data),
  });

  const readAllMutation = useMutation({
    mutationFn: notificationAPI.readAll,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Notifications</h1>
        {data?.unreadCount > 0 && (
          <button onClick={() => readAllMutation.mutate()} className="btn-ghost flex items-center gap-2 text-sm">
            <CheckCheck size={16} />
            Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-primary-500" /></div>
      ) : data?.notifications?.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">
          <Bell size={32} className="mx-auto mb-3 opacity-30" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.notifications.map((notif) => {
            const Icon = ICONS[notif.type] || Bell;
            const color = COLORS[notif.type] || 'text-slate-400';
            return (
              <div key={notif._id} className={`card p-4 flex items-center gap-4 transition-all ${!notif.isRead ? 'border-primary-500/20 bg-primary-500/5' : ''}`}>
                <div className={`w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 ${color}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {notif.sender?.displayName?.[0]?.toUpperCase()}
                    </div>
                    <p className="text-sm text-slate-300">{notif.text}</p>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</p>
                </div>
                {!notif.isRead && <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
