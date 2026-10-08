import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Plus, X, Heart, MessageCircle, Share2, Edit2, Trash2, 
  Upload, Video, Image as ImageIcon, Loader2, Send, CheckCircle2, MoreHorizontal 
} from 'lucide-react';
import { communityApi } from '../api/communityApi';
import { uploadApi } from '../api/uploadApi';
import { useAuth } from '../context/AuthContext';
import { getUserAvatar } from '../utils/avatar';

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modals & Active state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);
  const [commentsList, setCommentsList] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [shareToast, setShareToast] = useState('');

  // Create / Edit Form State
  const [postForm, setPostForm] = useState({
    title: '',
    category: 'Rescue Needed',
    description: '',
    photoUrl: '',
    videoUrl: ''
  });
  const [filePreview, setFilePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await communityApi.getAll();
      setPosts(data || []);
    } catch (err) {
      console.error('Failed to load community posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();
    reader.onload = (event) => {
      setFilePreview({
        url: event.target.result,
        isVideo
      });
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setPostForm({
      title: '',
      category: 'Rescue Needed',
      description: '',
      photoUrl: '',
      videoUrl: ''
    });
    setFilePreview(null);
    setSelectedFile(null);
    setEditingPost(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOpenEdit = (post) => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      category: post.category || 'Rescue Needed',
      description: post.description || '',
      photoUrl: post.photoUrl || '',
      videoUrl: post.videoUrl || ''
    });
    if (post.photoUrl) {
      setFilePreview({ url: post.photoUrl, isVideo: false });
    } else if (post.videoUrl) {
      setFilePreview({ url: post.videoUrl, isVideo: true });
    }
    setShowAddModal(true);
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!postForm.title.trim()) return;

    setSubmitting(true);
    try {
      let finalPhotoUrl = postForm.photoUrl;
      let finalVideoUrl = postForm.videoUrl;

      // Upload file to backend if selected
      if (selectedFile) {
        setUploadingMedia(true);
        try {
          const uploadRes = await uploadApi.uploadFile(selectedFile);
          const fullUrl = uploadRes.url.startsWith('http')
            ? uploadRes.url
            : `${window.location.origin.includes('localhost') ? 'http://localhost:8080' : ''}${uploadRes.url}`;

          if (selectedFile.type.startsWith('video/')) {
            finalVideoUrl = fullUrl;
            finalPhotoUrl = null;
          } else {
            finalPhotoUrl = fullUrl;
            finalVideoUrl = null;
          }
        } catch (uploadErr) {
          console.warn('Backend file upload fallback:', uploadErr);
          if (filePreview?.isVideo) {
            finalVideoUrl = filePreview.url;
          } else {
            finalPhotoUrl = filePreview?.url;
          }
        } finally {
          setUploadingMedia(false);
        }
      }

      if (editingPost) {
        // Update existing post
        await communityApi.update(editingPost.id, {
          title: postForm.title.trim(),
          category: postForm.category,
          description: postForm.description.trim(),
          photoUrl: finalPhotoUrl,
          videoUrl: finalVideoUrl
        });
      } else {
        // Create new post
        await communityApi.create({
          title: postForm.title.trim(),
          category: postForm.category,
          description: postForm.description.trim(),
          authorName: user?.name || 'Community Member',
          authorId: user?.userId,
          authorAvatar: user ? getUserAvatar(user) : null,
          photoUrl: finalPhotoUrl,
          videoUrl: finalVideoUrl,
          likesCount: 0,
          commentsCount: 0,
          timeAgo: 'Just now'
        });
      }

      setShowAddModal(false);
      resetForm();
      loadPosts();
    } catch (err) {
      console.error('Failed to submit post:', err);
      alert('Failed to save post. Please check backend connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Are you sure you want to delete your post?')) return;
    try {
      await communityApi.delete(id);
      loadPosts();
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert('Failed to delete post.');
    }
  };

  const handleLike = async (post) => {
    try {
      const updated = await communityApi.like(post.id);
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likesCount: updated.likesCount } : p));
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleShare = async (post) => {
    const shareData = {
      title: post.title,
      text: post.description,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.warn('Share dismissed');
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/community#post-${post.id}`);
      setShareToast('Link copied to clipboard!');
      setTimeout(() => setShareToast(''), 3000);
    }
  };

  const handleOpenComments = async (postId) => {
    setActiveCommentsPostId(postId);
    setLoadingComments(true);
    try {
      const data = await communityApi.getComments(postId);
      setCommentsList(data || []);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !activeCommentsPostId) return;

    try {
      const newComment = await communityApi.addComment(activeCommentsPostId, {
        authorId: user?.userId,
        authorName: user?.name || 'Community Member',
        authorAvatar: user ? getUserAvatar(user) : null,
        text: commentText.trim()
      });

      setCommentsList(prev => [...prev, newComment]);
      setCommentText('');

      // Update post comments count in feed
      setPosts(prev => prev.map(p => p.id === activeCommentsPostId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p));
    } catch (err) {
      console.error('Failed to add comment:', err);
      alert('Failed to submit comment.');
    }
  };

  const filteredPosts = filter === 'ALL'
    ? posts
    : posts.filter(p => p.category?.toLowerCase() === filter.toLowerCase());

  return (
    <div className="content-body" style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 800, fontSize: '13px', background: '#eef7f0', padding: '4px 12px', borderRadius: '14px', marginBottom: '8px' }}>
            <Users size={16} />
            <span>Community Animal Care</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>
            BrunoVerse Community Feed
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Photo/video updates, animal rescue alerts, community feeding drives, and adoption stories
          </p>
        </div>

        <button 
          className="btn-primary" 
          onClick={() => { resetForm(); setShowAddModal(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 700 }}
        >
          <Plus size={18} />
          <span>Share Update</span>
        </button>
      </div>

      {/* Share Toast Notification */}
      {shareToast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: 'var(--primary)', color: '#fff', padding: '12px 20px', borderRadius: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(0,0,0,0.2)', zIndex: 999 }}>
          <CheckCircle2 size={18} />
          <span>{shareToast}</span>
        </div>
      )}

      {/* Categories Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '20px' }}>
        {['ALL', 'Rescue Needed', 'Medical Help', 'Feeding', 'Adoption', 'General'].map((cat) => {
          const isSelected = filter.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 700,
                border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                background: isSelected ? 'var(--primary)' : '#ffffff',
                color: isSelected ? '#ffffff' : 'var(--text-primary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {cat === 'ALL' ? 'All Posts' : cat}
            </button>
          );
        })}
      </div>

      {/* Feed Grid / Stream */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 12px auto' }} />
          <div>Loading community feed...</div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="section-card" style={{ textAlign: 'center', padding: '60px 20px', alignItems: 'center' }}>
          <Users size={40} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 800 }}>No Posts Found</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '360px', margin: '6px 0 16px' }}>
            Be the first to share a rescue story, animal feeding drive, or adoption alert!
          </p>
          <button className="btn-primary" onClick={() => { resetForm(); setShowAddModal(true); }}>
            Create First Post
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {filteredPosts.map((post) => {
            const isOwnPost = user && (user.userId === post.authorId || user.name === post.authorName);
            const authorPhoto = post.authorAvatar || getUserAvatar({ name: post.authorName });

            return (
              <div 
                key={post.id} 
                id={`post-${post.id}`}
                className="section-card" 
                style={{ padding: '22px', borderRadius: '22px', border: '1px solid var(--border-color)', background: '#ffffff', boxShadow: 'var(--shadow-sm)' }}
              >
                {/* Author Info & Actions (Edit/Delete for own posts) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img 
                      src={authorPhoto} 
                      alt={post.authorName} 
                      style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-light)' }} 
                    />
                    <div>
                      <div style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {post.authorName || 'Animal Friend'}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        {post.timeAgo || 'Recently'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span 
                      style={{ 
                        fontSize: '11px', 
                        fontWeight: 700, 
                        padding: '3px 10px', 
                        borderRadius: '8px',
                        background: '#EEF7F0',
                        color: 'var(--primary)'
                      }}
                    >
                      {post.category || 'General'}
                    </span>

                    {/* Own post controls */}
                    {isOwnPost && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(post)}
                          title="Edit my post"
                          style={{ padding: '6px', borderRadius: '8px', border: 'none', background: '#F1F5F9', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePost(post.id)}
                          title="Delete my post"
                          style={{ padding: '6px', borderRadius: '8px', border: 'none', background: '#FEE2E2', color: '#DC2626', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Post Title & Description */}
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.3 }}>
                  {post.title}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '16px', whiteSpace: 'pre-line' }}>
                  {post.description}
                </p>

                {/* Media Preview (Photo or Video) */}
                {post.videoUrl ? (
                  <div style={{ width: '100%', maxHeight: '420px', borderRadius: '16px', overflow: 'hidden', background: '#000000', marginBottom: '16px' }}>
                    <video src={post.videoUrl} controls style={{ width: '100%', maxHeight: '420px', objectFit: 'contain' }} />
                  </div>
                ) : post.photoUrl ? (
                  <div style={{ width: '100%', maxHeight: '420px', borderRadius: '16px', overflow: 'hidden', background: '#F8FAFC', marginBottom: '16px' }}>
                    <img src={post.photoUrl} alt={post.title} style={{ width: '100%', maxHeight: '420px', objectFit: 'cover' }} />
                  </div>
                ) : null}

                {/* Interactive Action Bar: Like, Comment, Share */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', gap: '18px' }}>
                    {/* Like Button */}
                    <button
                      type="button"
                      onClick={() => handleLike(post)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'none',
                        border: 'none',
                        color: (post.likesCount || 0) > 0 ? '#DC2626' : 'var(--text-secondary)',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <Heart size={18} fill={(post.likesCount || 0) > 0 ? '#DC2626' : 'none'} />
                      <span>{post.likesCount || 0} Likes</span>
                    </button>

                    {/* Comment Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenComments(post.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <MessageCircle size={18} />
                      <span>{post.commentsCount || 0} Comments</span>
                    </button>
                  </div>

                  {/* Share Button */}
                  <button
                    type="button"
                    onClick={() => handleShare(post)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Share2 size={17} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Post Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" style={{ maxWidth: '600px', width: '95%', padding: '26px', borderRadius: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ marginBottom: '16px' }}>
              <h2 className="modal-title" style={{ fontSize: '20px', fontWeight: 800 }}>
                {editingPost ? 'Edit Post' : 'Share with Community'}
              </h2>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmitPost} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Post Title *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Feeding drive at Sector 15 Central Park" 
                  value={postForm.title} 
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select 
                  className="form-select" 
                  value={postForm.category} 
                  onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                >
                  <option value="Rescue Needed">Rescue Needed</option>
                  <option value="Medical Help">Medical Help</option>
                  <option value="Feeding">Feeding Drive</option>
                  <option value="Adoption">Adoption Notice</option>
                  <option value="General">General Animal Welfare</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description / Details *</label>
                <textarea 
                  className="form-textarea" 
                  rows={4} 
                  placeholder="Share details, timings, needs, or updates..."
                  value={postForm.description} 
                  onChange={(e) => setPostForm({ ...postForm, description: e.target.value })} 
                  required
                />
              </div>

              {/* Photo / Video Upload Preview */}
              <div className="form-group">
                <label className="form-label">Attach Photo or Video</label>
                {filePreview ? (
                  <div style={{ position: 'relative', width: '100%', height: '170px', borderRadius: '14px', overflow: 'hidden', border: '2px solid var(--primary)', background: '#000' }}>
                    {filePreview.isVideo ? (
                      <video src={filePreview.url} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <img src={filePreview.url} alt="Media Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                    <button
                      type="button"
                      onClick={() => { setFilePreview(null); setSelectedFile(null); }}
                      style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(220,38,38,0.9)', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{ border: '2px dashed #cbd5e1', borderRadius: '14px', padding: '18px', textAlign: 'center', background: '#f8fafc', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '6px', color: 'var(--primary)' }}>
                      <ImageIcon size={22} />
                      <Video size={22} />
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Click to upload Photo or Video</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>JPG, PNG, WEBP, MP4, WEBM</div>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*,video/*"
                  onChange={handleMediaFileChange}
                />
              </div>

              <div className="form-actions" style={{ marginTop: '8px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  <span>{editingPost ? 'Update Post' : 'Publish to Feed'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comments Drawer / Modal */}
      {activeCommentsPostId && (
        <div className="modal-overlay" onClick={() => setActiveCommentsPostId(null)}>
          <div className="modal-content" style={{ maxWidth: '540px', width: '95%', padding: '24px', borderRadius: '22px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageCircle size={20} color="var(--primary)" />
                <h2 className="modal-title" style={{ fontSize: '18px', fontWeight: 800 }}>Comments & Discussion</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setActiveCommentsPostId(null)}><X size={18} /></button>
            </div>

            {/* Comment List */}
            <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', padding: '6px 0', marginBottom: '16px' }}>
              {loadingComments ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Loading comments...</div>
              ) : commentsList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No comments yet. Share your thoughts or offer help!
                </div>
              ) : (
                commentsList.map((c) => (
                  <div key={c.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#F8FAFC', padding: '10px 12px', borderRadius: '12px' }}>
                    <img 
                      src={c.authorAvatar || getUserAvatar({ name: c.authorName })} 
                      alt={c.authorName} 
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--text-primary)' }}>{c.authorName}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>{c.text}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                required
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
