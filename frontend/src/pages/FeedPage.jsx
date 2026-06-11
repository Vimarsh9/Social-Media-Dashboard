import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postAPI } from '../services/api';
import { useAuthStore } from '../context/authStore';
import { Heart, MessageCircle, Share2, Image, Loader2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

function CreatePost() {
  const [content, setContent] = useState('');
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => postAPI.create({ content }),
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      toast.success('Post created!');
    },
    onError: () => toast.error('Failed to create post'),
  });

  return (
    <div className="card p-4 mb-6">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold shrink-0">
          {user?.displayName?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="input-field resize-none h-20 text-sm"
            maxLength={2000}
          />
          <div className="flex items-center justify-between mt-3">
            <button className="flex items-center gap-2 text-slate-500 hover:text-primary-400 text-sm transition-colors">
              <Image size={16} />
              <span>Media</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-600">{content.length}/2000</span>
              <button
                onClick={() => mutate()}
                disabled={!content.trim() || isPending}
                className="btn-primary flex items-center gap-2 text-sm py-1.5"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostCard({ post }) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const isLiked = post.likes?.includes(user?._id);

  const likeMutation = useMutation({
    mutationFn: () => postAPI.like(post._id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feed'] }),
  });

  const commentMutation = useMutation({
    mutationFn: () => postAPI.comment(post._id, commentText),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  return (
    <div className="card p-5 mb-4 animate-fade-in">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-400 font-bold shrink-0">
          {post.author?.displayName?.[0]?.toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-slate-100">{post.author?.displayName}</span>
            <span className="text-slate-500 text-xs">@{post.author?.username}</span>
          </div>
          <span className="text-xs text-slate-600">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
        </div>
      </div>

      <p className="text-slate-300 text-sm leading-relaxed mb-4">{post.content}</p>

      <div className="flex items-center gap-4 pt-3 border-t border-slate-800">
        <button
          onClick={() => likeMutation.mutate()}
          className={`flex items-center gap-1.5 text-sm transition-colors ${isLiked ? 'text-red-400' : 'text-slate-500 hover:text-red-400'}`}
        >
          <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
          <span>{post.likes?.length || 0}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-400 transition-colors"
        >
          <MessageCircle size={16} />
          <span>{post.comments?.length || 0}</span>
        </button>
        <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-400 transition-colors">
          <Share2 size={16} />
          <span>Share</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 space-y-3 animate-slide-up">
          {post.comments?.map((c) => (
            <div key={c._id} className="flex gap-2 text-sm">
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                {c.user?.displayName?.[0]?.toUpperCase()}
              </div>
              <div className="bg-slate-800 rounded-xl px-3 py-2 flex-1">
                <span className="font-medium text-slate-300 text-xs">{c.user?.displayName}</span>
                <p className="text-slate-400 text-xs mt-0.5">{c.text}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="input-field text-sm py-2"
              onKeyDown={(e) => e.key === 'Enter' && commentText.trim() && commentMutation.mutate()}
            />
            <button onClick={() => commentMutation.mutate()} disabled={!commentText.trim()} className="btn-primary text-sm px-3 py-2">
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FeedPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['feed'],
    queryFn: () => postAPI.getFeed().then((r) => r.data),
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Feed</h1>
      <CreatePost />
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-primary-500" /></div>
      ) : data?.posts?.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">
          <p className="text-lg">No posts yet.</p>
          <p className="text-sm mt-1">Follow people or create your first post!</p>
        </div>
      ) : (
        data?.posts?.map((post) => <PostCard key={post._id} post={post} />)
      )}
    </div>
  );
}
