// ProfilePage.jsx
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../services/api';
import { useAuthStore } from '../context/authStore';
import { MapPin, Link, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => userAPI.getProfile(username).then((r) => r.data),
  });

  const followMutation = useMutation({
    mutationFn: () => userAPI.follow(data?.user?._id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['profile', username] });
      toast.success(res.data.following ? 'Followed!' : 'Unfollowed');
    },
  });

  if (isLoading) return <div className="flex justify-center items-center h-full"><Loader2 size={32} className="animate-spin text-primary-500" /></div>;

  const { user, posts, postCount } = data || {};
  const isOwnProfile = currentUser?.username === username;
  const isFollowing = user?.followers?.some((f) => f._id === currentUser?._id || f === currentUser?._id);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-20 h-20 rounded-2xl bg-primary-500/20 flex items-center justify-center text-3xl font-bold text-primary-400">
            {user?.displayName?.[0]?.toUpperCase()}
          </div>
          {!isOwnProfile && (
            <button onClick={() => followMutation.mutate()} className={isFollowing ? 'btn-ghost border border-slate-700' : 'btn-primary'}>
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>
        <h1 className="text-xl font-bold text-slate-100">{user?.displayName}</h1>
        <p className="text-slate-500 text-sm mb-3">@{user?.username}</p>
        {user?.bio && <p className="text-slate-300 text-sm mb-4">{user.bio}</p>}
        <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4">
          {user?.location && <span className="flex items-center gap-1"><MapPin size={14} />{user.location}</span>}
          {user?.website && <a href={user.website} className="flex items-center gap-1 text-primary-400 hover:underline"><Link size={14} />{user.website}</a>}
          {user?.createdAt && <span className="flex items-center gap-1"><Calendar size={14} />Joined {format(new Date(user.createdAt), 'MMM yyyy')}</span>}
        </div>
        <div className="flex gap-6 text-sm">
          <span><strong className="text-slate-100">{postCount}</strong> <span className="text-slate-500">Posts</span></span>
          <span><strong className="text-slate-100">{user?.followers?.length || 0}</strong> <span className="text-slate-500">Followers</span></span>
          <span><strong className="text-slate-100">{user?.following?.length || 0}</strong> <span className="text-slate-500">Following</span></span>
        </div>
      </div>

      <div className="space-y-4">
        {posts?.map((post) => (
          <div key={post._id} className="card p-4">
            <p className="text-slate-300 text-sm">{post.content}</p>
            <div className="flex gap-4 mt-3 text-xs text-slate-600">
              <span>❤️ {post.likes?.length || 0}</span>
              <span>💬 {post.comments?.length || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProfilePage;
