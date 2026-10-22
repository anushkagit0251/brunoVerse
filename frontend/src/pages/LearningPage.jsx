import React, { useState, useMemo } from 'react';
import { 
  BookOpen, Search, ArrowRight, X, Clock, CheckCircle2, 
  Lightbulb, AlertTriangle, ChevronRight, Share2, Bookmark, 
  Sparkles, Stethoscope, Heart, Shield, ShieldAlert, Award
} from 'lucide-react';
import { LEARNING_CATEGORIES, LEARNING_TOPICS } from '../data/learningArticles';

export default function LearningPage() {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const topicId = params.get('topic');
    if (topicId) {
      const found = LEARNING_TOPICS.find(t => t.id === topicId);
      if (found) {
        setSelectedTopic(found);
      }
    }
  }, []);

  const toggleBookmark = (id) => {
    setBookmarkedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleShare = async (topic) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: topic.title,
          text: topic.summary,
          url: window.location.href,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }
    navigator.clipboard?.writeText(`${topic.title} - BrunoVerse Knowledge Portal: ${window.location.href}`);
    setCopiedId(topic.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredTopics = useMemo(() => {
    return LEARNING_TOPICS.filter(t => {
      const matchesCat = activeCategory === 'ALL' || t.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.paragraphs.some(p => p.toLowerCase().includes(q));
      return matchesCat && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="dashboard-content" style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 20px 60px' }}>
      {/* Knowledge Portal Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 800, fontSize: '13px', background: '#eef7f0', padding: '6px 14px', borderRadius: '16px', marginBottom: '10px' }}>
          <BookOpen size={16} />
          <span>BrunoVerse Veterinary Knowledge Portal</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              Animal Healthcare & Welfare Learning Center
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '720px' }}>
              Authoritative, evidence-based educational guides authored by veterinary practitioners and animal rescue specialists. Explore essential care protocols, clinical first aid, and preventative longevity guidelines.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '8px 16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <Award size={20} color="var(--primary)" />
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '14px' }}>{LEARNING_TOPICS.length}</span> Peer-Reviewed Clinical Topics
            </div>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Navigation */}
      <div style={{ marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '640px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search guides by title, clinical symptoms, emergency care, nutrition..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '13px 16px 13px 44px',
              borderRadius: '16px',
              border: '1.5px solid var(--border-color)',
              background: '#ffffff',
              fontSize: '14px',
              color: 'var(--text-primary)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* 9 Category Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', scrollbarWidth: 'none' }}>
          {LEARNING_CATEGORIES.map(cat => {
            const isSelected = activeCategory === cat.id;
            const count = cat.id === 'ALL' 
              ? LEARNING_TOPICS.length 
              : LEARNING_TOPICS.filter(t => t.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '9px 16px',
                  borderRadius: '24px',
                  border: isSelected ? '1.5px solid var(--primary)' : '1px solid #e2e8f0',
                  background: isSelected ? 'var(--primary)' : '#ffffff',
                  color: isSelected ? '#ffffff' : 'var(--text-primary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 3px 10px rgba(45, 106, 79, 0.2)' : 'none'
                }}
              >
                <span>{cat.label}</span>
                <span style={{
                  padding: '2px 7px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: isSelected ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                  color: isSelected ? '#ffffff' : '#64748b'
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Topics Grid */}
      {filteredTopics.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
          <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '14px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>No Knowledge Guides Found</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            Try adjusting your search terms or selecting a different category.
          </p>
          <button 
            type="button" 
            className="btn-primary" 
            onClick={() => { setActiveCategory('ALL'); setSearchQuery(''); }}
            style={{ padding: '8px 20px', fontSize: '13px' }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
          {filteredTopics.map(topic => {
            const isBookmarked = bookmarkedIds.includes(topic.id);
            return (
              <div 
                key={topic.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedTopic(topic)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.03)';
                }}
              >
                {/* Card Header Image */}
                <div style={{ height: '190px', position: 'relative', overflow: 'hidden' }}>
                  <img 
                    src={topic.image} 
                    alt={topic.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Shield size={13} />
                    <span>{topic.category}</span>
                  </div>
                  <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(topic.id);
                      }}
                      style={{
                        background: 'rgba(255,255,255,0.92)',
                        backdropFilter: 'blur(8px)',
                        border: 'none',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: isBookmarked ? '#ea580c' : '#64748b'
                      }}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark guide'}
                    >
                      <Bookmark size={16} fill={isBookmarked ? '#ea580c' : 'none'} />
                    </button>
                  </div>
                </div>

                {/* Card Content Body */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>
                    <Clock size={14} />
                    <span>{topic.readTime}</span>
                    <span>•</span>
                    <span>Veterinary Council</span>
                  </div>

                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35, marginBottom: '10px' }}>
                    {topic.title}
                  </h3>

                  <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '18px', flex: 1 }}>
                    {topic.summary}
                  </p>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Key Points & Clinical Warnings <ChevronRight size={14} />
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTopic(topic);
                      }}
                      style={{
                        background: '#eef7f0',
                        color: 'var(--primary)',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <span>Read Guide</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Educational Article Reading Modal */}
      {selectedTopic && (
        <div 
          className="modal-backdrop"
          onClick={() => setSelectedTopic(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              maxWidth: '820px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0',
              padding: '0'
            }}
          >
            {/* Modal Header Image with Close & Actions */}
            <div style={{ position: 'relative', height: '260px', width: '100%' }}>
              <img 
                src={selectedTopic.image} 
                alt={selectedTopic.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.4) 100%)' }} />

              <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleShare(selectedTopic)}
                  style={{
                    background: 'rgba(255,255,255,0.9)',
                    border: 'none',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#1e293b'
                  }}
                  title="Share article"
                >
                  <Share2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => toggleBookmark(selectedTopic.id)}
                  style={{
                    background: 'rgba(255,255,255,0.9)',
                    border: 'none',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: bookmarkedIds.includes(selectedTopic.id) ? '#ea580c' : '#1e293b'
                  }}
                  title="Bookmark"
                >
                  <Bookmark size={16} fill={bookmarkedIds.includes(selectedTopic.id) ? '#ea580c' : 'none'} />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTopic(null)}
                  style={{
                    background: 'rgba(255,255,255,0.9)',
                    border: 'none',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#1e293b'
                  }}
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ position: 'absolute', bottom: '20px', left: '24px', right: '24px', color: '#ffffff' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(45,106,79,0.9)', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
                  <Shield size={14} />
                  <span>{selectedTopic.category}</span>
                  <span>•</span>
                  <span>{selectedTopic.readTime}</span>
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, lineHeight: 1.25, color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  {selectedTopic.title}
                </h2>
              </div>
            </div>

            {/* Modal Body Content */}
            <div style={{ padding: '28px 28px 36px' }}>
              {copiedId && (
                <div style={{ padding: '10px 14px', background: '#eef7f0', color: '#2d6a4f', borderRadius: '12px', fontSize: '13px', fontWeight: 700, marginBottom: '18px', textAlign: 'center' }}>
                  Link copied to clipboard! Share with fellow animal caretakers.
                </div>
              )}

              {/* 2–5 Paragraphs of Educational Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
                {selectedTopic.paragraphs.map((p, idx) => (
                  <p key={idx} style={{ fontSize: '15px', lineHeight: 1.7, color: '#334155' }}>
                    {p}
                  </p>
                ))}
              </div>

              {/* Key Points Section */}
              <div style={{ background: '#f8fafc', borderRadius: '18px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
                  <CheckCircle2 size={18} color="var(--primary)" />
                  <span>Key Clinical Takeaways</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '8px', display: 'flex', flexDirection: 'column', gap: '10px', listStyleType: 'none' }}>
                  {selectedTopic.keyPoints.map((kp, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', marginTop: '8px', flexShrink: 0 }} />
                      <span>{kp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tips Section */}
              <div style={{ background: '#fefce8', borderRadius: '18px', border: '1px solid #fef08a', padding: '20px', marginBottom: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 800, color: '#854d0e', marginBottom: '12px' }}>
                  <Lightbulb size={18} color="#ca8a04" />
                  <span>Practical Pet Care Tips</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedTopic.tips.map((tip, idx) => (
                    <div key={idx} style={{ fontSize: '13.5px', color: '#713f12', lineHeight: 1.5, display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 800 }}>•</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Important Warning Box */}
              <div style={{ background: '#fff1f2', borderRadius: '18px', border: '1.5px solid #fecdd3', padding: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 800, color: '#be123c', marginBottom: '8px' }}>
                  <AlertTriangle size={18} color="#e11d48" />
                  <span>CRITICAL VETERINARY WARNING</span>
                </div>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#9f1239', lineHeight: 1.5, fontWeight: 500 }}>
                  {selectedTopic.warning}
                </p>
              </div>

              {/* "Learn More" Section */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
                  Learn More & Recommended Next Steps:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedTopic.learnMore.map((lm, idx) => (
                    <div key={idx} style={{ fontSize: '13px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ChevronRight size={14} />
                      <span style={{ fontWeight: 500 }}>{lm}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer CTA */}
              <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setSelectedTopic(null)}
                  style={{ padding: '10px 22px' }}
                >
                  Back to Learning Portal
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handleShare(selectedTopic)}
                  style={{ padding: '10px 22px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Share2 size={16} />
                  <span>Share This Guide</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
