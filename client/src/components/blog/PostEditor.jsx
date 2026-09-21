import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Send, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';
import './PostEditor.css';

const PostEditor = ({ initialData, onSubmit, loading, error, isEditMode }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    excerpt: '',
    content: '',
    coverImage: '',
    tags: [],
    status: 'draft'
  });
  
  const [tagInput, setTagInput] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [imageState, setImageState] = useState({ loading: false, error: false, validationError: null });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        category: initialData.category || '',
        excerpt: initialData.excerpt || '',
        content: initialData.content || '',
        coverImage: initialData.coverImage || '',
        tags: initialData.tags || [],
        status: initialData.status || 'draft'
      });
    }
  }, [initialData]);

  // Validate URL helper
  const validateImageUrl = (url) => {
    if (!url || !url.trim()) return { isValid: true, error: null };
    if (url.length > 2000) return { isValid: false, error: 'URL is too long.' };
    try {
      const parsed = new URL(url.trim());
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { isValid: false, error: 'Only HTTP and HTTPS URLs are allowed.' };
      }
      return { isValid: true, error: null };
    } catch (e) {
      return { isValid: false, error: 'Please enter a valid absolute URL.' };
    }
  };

  // Debounce the preview update
  useEffect(() => {
    const timer = setTimeout(() => {
      const url = formData.coverImage?.trim();
      const validation = validateImageUrl(url);
      if (validation.isValid) {
        setPreviewUrl(url);
        setImageState({ loading: !!url, error: false, validationError: null });
      } else {
        setPreviewUrl('');
        setImageState({ loading: false, error: false, validationError: validation.error });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.coverImage]);

  const handleImageLoad = () => {
    setImageState(prev => ({ ...prev, loading: false, error: false }));
  };

  const handleImageError = () => {
    setImageState(prev => ({ ...prev, loading: false, error: true }));
  };

  // Handle unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isSubmitting) return;

      const isDirty = initialData
        ? JSON.stringify(formData) !== JSON.stringify(initialData)
        : formData.title || formData.content || formData.excerpt || formData.category || formData.tags.length > 0;

      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData, initialData, isSubmitting]);

  const getContentWordCount = () => {
    if (!formData.content) return 0;
    return formData.content.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getCharCountClass = (current, max) => {
    if (current >= max) return 'char-count error';
    if (current >= max * 0.8) return 'char-count warning';
    return 'char-count';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // clear error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, trimmedTag] }));
    }
    setTagInput('');
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(e);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required.';
    if (!formData.category.trim()) errors.category = 'Category is required.';
    if (!formData.excerpt.trim()) errors.excerpt = 'Excerpt is required.';
    if (!formData.content.trim()) errors.content = 'Content is required.';
    
    if (imageState.validationError) {
      errors.coverImage = imageState.validationError;
    } else if (formData.coverImage && imageState.error) {
      errors.coverImage = 'Image could not be loaded. Please check the URL.';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (targetStatus) => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    // Pass the payload up
    onSubmit({
      ...formData,
      status: targetStatus
    });
  };

  return (
    <div className="post-editor-container">
      <header className="post-editor-header">
        <button 
          className="back-btn"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
          <span className="back-text">Back</span>
        </button>
        <div className="editor-actions">
          <button 
            className="btn-outline" 
            onClick={() => handleSubmit('draft')}
            disabled={loading}
          >
            <Save size={18} />
            {loading && formData.status === 'draft' ? 'Saving...' : 'Save Draft'}
          </button>
          <button 
            className="btn-primary" 
            onClick={() => handleSubmit('published')}
            disabled={loading}
          >
            <Send size={18} />
            {loading && formData.status === 'published' ? 'Publishing...' : 'Publish Article'}
          </button>
        </div>
      </header>

      {error && <div style={{ marginBottom: 'var(--space-xl)' }}><ErrorMessage message={error} /></div>}

      <div className="post-editor-form">
        <div className="form-group">
          <input
            type="text"
            name="title"
            className={`editor-title-input ${validationErrors.title ? 'is-invalid' : ''}`}
            placeholder="Give your article a clear title..."
            value={formData.title}
            onChange={handleChange}
            maxLength={120}
            aria-label="Article title"
          />
          <div className="field-meta">
            {validationErrors.title ? (
              <span className="field-error">{validationErrors.title}</span>
            ) : (
              <span></span>
            )}
            <span className={getCharCountClass(formData.title.length, 120)}>
              {formData.title.length} / 120
            </span>
          </div>
        </div>

        <div className="form-group">
          <input
            type="text"
            name="category"
            className={`editor-input ${validationErrors.category ? 'is-invalid' : ''}`}
            placeholder="Category (e.g., React, Node.js)"
            value={formData.category}
            onChange={handleChange}
            aria-label="Category"
          />
          {validationErrors.category && <span className="field-error">{validationErrors.category}</span>}
        </div>

        <div className="form-group">
          <label className="editor-label" htmlFor="coverImage">Cover Image URL</label>
          <input
            type="text"
            id="coverImage"
            name="coverImage"
            className={`editor-input ${validationErrors.coverImage ? 'is-invalid' : ''}`}
            placeholder="https://example.com/your-cover-image.jpg"
            value={formData.coverImage}
            onChange={handleChange}
            aria-label="Cover Image URL"
          />
          <div className="field-meta">
            {validationErrors.coverImage ? (
              <span className="field-error">{validationErrors.coverImage}</span>
            ) : (
              <span className="field-helper">
                Optional. Add an image URL for your article cover.
                <span className="helper-note">Use a direct image URL. External images can be removed or blocked by their host.</span>
              </span>
            )}
          </div>
          
          {previewUrl && (
            <div className="image-preview-container">
              {imageState.loading && <div className="image-preview-loading"><LoadingSpinner /></div>}
              {imageState.error && !imageState.loading && (
                <div className="image-preview-error">
                  <span>Image could not be loaded.</span>
                </div>
              )}
              {!imageState.error && (
                <img 
                  src={previewUrl} 
                  alt="Cover preview" 
                  className={`image-preview ${imageState.loading ? 'loading' : ''}`} 
                  onLoad={handleImageLoad} 
                  onError={handleImageError} 
                />
              )}
            </div>
          )}
        </div>

        <div className="form-group">
          <textarea
            name="excerpt"
            className={`editor-textarea editor-excerpt ${validationErrors.excerpt ? 'is-invalid' : ''}`}
            placeholder="Write a short summary of your article..."
            value={formData.excerpt}
            onChange={handleChange}
            maxLength={300}
            rows={3}
            aria-label="Article excerpt"
          />
          <div className="field-meta">
            {validationErrors.excerpt ? (
              <span className="field-error">{validationErrors.excerpt}</span>
            ) : (
              <span></span>
            )}
            <span className={getCharCountClass(formData.excerpt.length, 300)}>
              {formData.excerpt.length} / 300
            </span>
          </div>
        </div>

        <div className="form-group">
          <textarea
            name="content"
            className={`editor-textarea editor-content ${validationErrors.content ? 'is-invalid' : ''}`}
            placeholder="Start writing your article..."
            value={formData.content}
            onChange={handleChange}
            rows={25}
            aria-label="Article content"
          />
          <div className="field-meta">
            {validationErrors.content ? (
              <span className="field-error">{validationErrors.content}</span>
            ) : (
              <span></span>
            )}
            <span className="word-count">{getContentWordCount()} words</span>
          </div>
        </div>

        <div className="form-group">
          <div className="tags-input-wrapper">
            <input
              type="text"
              className="editor-input"
              placeholder="Add tags (press Enter)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              aria-label="Add a tag"
            />
            <button className="add-tag-btn" onClick={handleAddTag} aria-label="Add tag">
              <Plus size={20} />
            </button>
          </div>
          
          {formData.tags.length > 0 && (
            <div className="editor-tags-list">
              {formData.tags.map(tag => (
                <span key={tag} className="editor-tag-chip">
                  {tag}
                  <button 
                    className="remove-tag-btn" 
                    onClick={() => handleRemoveTag(tag)}
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Sticky Actions */}
      <div className="mobile-editor-actions">
        <button 
          className="btn-outline mobile-btn" 
          onClick={() => handleSubmit('draft')}
          disabled={loading}
        >
          <Save size={18} /> Draft
        </button>
        <button 
          className="btn-primary mobile-btn" 
          onClick={() => handleSubmit('published')}
          disabled={loading}
        >
          <Send size={18} /> Publish
        </button>
      </div>
    </div>
  );
};

export default PostEditor;
