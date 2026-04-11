import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Pencil, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/lib/db';

const EditableContent = ({ pageSlug, sectionKey, initialContent, type = 'text', className = '' }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Check if user has admin privileges
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      if (!pageSlug || !sectionKey) return;
      try {
        setLoading(true);
        const data = await db.pageContent.get(pageSlug, sectionKey);
        if (data && data.content) {
          setContent(data.content);
        }
      } catch (error) {
        console.error("Failed to fetch content:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [pageSlug, sectionKey]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await db.pageContent.upsert(pageSlug, sectionKey, content);
      setIsEditing(false);
      toast({
        title: "Content Updated",
        description: "Changes have been saved to the database."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Re-fetch to reset to DB state if needed, or just keep current state
  };

  if (loading) return <span className={`${className} opacity-50`}>{content}</span>;

  if (!isAdmin) {
    if (type === 'html') {
      return <div className={className} dangerouslySetInnerHTML={{ __html: content }} />;
    }
    return <div className={className}>{content}</div>;
  }

  return (
    <div className={`relative group border-2 border-transparent hover:border-dashed hover:border-red-500/50 rounded-lg p-1 transition-all ${isEditing ? 'border-red-500 bg-neutral-800/50' : ''}`}>
      {!isEditing && (
        <button
          onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
          className="absolute -top-3 -right-3 z-20 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          title="Edit Content"
        >
          <Pencil className="w-3 h-3" />
        </button>
      )}

      {isEditing ? (
        <div className="space-y-2 relative z-30">
          {type === 'textarea' || type === 'html' ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-md p-2 text-white min-h-[100px] focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          ) : (
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          )}
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={handleCancel} className="h-7 w-7 p-0 hover:bg-neutral-700">
              <X className="w-4 h-4 text-red-400" />
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="h-7 w-7 p-0 bg-green-600 hover:bg-green-700">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      ) : (
        <>
          {type === 'html' ? (
            <div className={className} dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <div className={className}>{content}</div>
          )}
        </>
      )}
    </div>
  );
};

export default EditableContent;