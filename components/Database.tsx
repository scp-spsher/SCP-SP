import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Archive,
  Bold,
  FileText,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Plus,
  RefreshCw,
  Save,
  Search,
  Underline,
  X
} from 'lucide-react';
import { ObjectClass, SCPArchiveArticle } from '../types';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';
import type { StoredUser } from '../services/authService';

interface DatabaseProps {
  currentUser: StoredUser;
  routeSlug?: string | null;
  onArticleRouteChange?: (slug: string | null) => void;
}

const LOCAL_ARCHIVE_KEY = 'scp_local_archive_articles_v1';

type EditorMode = 'view' | 'create' | 'edit';

const normalizeScpSlug = (value: string): string | null => {
  const cleaned = value
    .toUpperCase()
    .replace(/SCP-/g, '')
    .replace(/[^A-Z0-9-]/g, '')
    .trim();

  if (!cleaned) return null;
  return `SCP-${cleaned}`;
};

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').trim();

const sanitizeRichText = (html: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const allowedTags = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'UL', 'OL', 'LI', 'A', 'H3', 'H4', 'BLOCKQUOTE']);
  const allowedAttrs: Record<string, string[]> = { A: ['href', 'target', 'rel'] };

  const walk = (node: Node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toUpperCase();

      if (!allowedTags.has(tag)) {
        const parent = el.parentNode;
        if (parent) {
          while (el.firstChild) parent.insertBefore(el.firstChild, el);
          parent.removeChild(el);
          return;
        }
      } else {
        const allowedForTag = allowedAttrs[tag] || [];
        Array.from(el.attributes).forEach((attr) => {
          if (!allowedForTag.includes(attr.name.toLowerCase())) {
            el.removeAttribute(attr.name);
          }
        });

        if (tag === 'A') {
          const href = el.getAttribute('href') || '';
          if (!/^https?:\/\//i.test(href) && !href.startsWith('/')) {
            el.removeAttribute('href');
          } else {
            el.setAttribute('target', '_blank');
            el.setAttribute('rel', 'noopener noreferrer');
          }
        }
      }
    }

    Array.from(node.childNodes).forEach(walk);
  };

  walk(doc.body);
  return doc.body.innerHTML.trim();
};

const objectClassColor = (cls: ObjectClass | string) => {
  const colors: Record<string, string> = {
    [ObjectClass.SAFE]: 'text-green-400 border-green-500/60',
    [ObjectClass.EUCLID]: 'text-yellow-400 border-yellow-500/60',
    [ObjectClass.KETER]: 'text-red-400 border-red-500/60',
    [ObjectClass.THAUMIEL]: 'text-purple-400 border-purple-500/60',
    [ObjectClass.NEUTRALIZED]: 'text-gray-300 border-gray-500/60'
  };
  return colors[cls] || 'text-gray-300 border-gray-500/60';
};

const nowIso = () => new Date().toISOString();

const mapRowToArticle = (row: any): SCPArchiveArticle => ({
  id: String(row.id),
  slug: String(row.slug || ''),
  title: String(row.title || row.slug || 'SCP'),
  object_class: (row.object_class || ObjectClass.EUCLID) as ObjectClass,
  summary: String(row.summary || ''),
  content_html: String(row.content_html || ''),
  author_id: String(row.author_id || ''),
  author_name: String(row.author_name || 'Unknown'),
  created_at: String(row.created_at || nowIso()),
  updated_at: String(row.updated_at || row.created_at || nowIso())
});

const Database: React.FC<DatabaseProps> = ({ currentUser, routeSlug, onArticleRouteChange }) => {
  const editorRef = useRef<HTMLDivElement | null>(null);

  const [articles, setArticles] = useState<SCPArchiveArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [mode, setMode] = useState<EditorMode>('view');
  const [slugInput, setSlugInput] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [objectClass, setObjectClass] = useState<ObjectClass>(ObjectClass.EUCLID);
  const [editorHtml, setEditorHtml] = useState('<p></p>');

  const selectedArticle = useMemo(
    () => articles.find((article) => article.slug === selectedSlug) || null,
    [articles, selectedSlug]
  );

  const filteredArticles = useMemo(() => {
    if (!searchTerm.trim()) return articles;
    const q = searchTerm.toLowerCase().trim();
    return articles.filter(
      (article) =>
        article.slug.toLowerCase().includes(q) ||
        article.title.toLowerCase().includes(q) ||
        article.summary.toLowerCase().includes(q)
    );
  }, [articles, searchTerm]);

  const resetEditor = useCallback(() => {
    setSlugInput('');
    setTitle('');
    setSummary('');
    setObjectClass(ObjectClass.EUCLID);
    setEditorHtml('<p></p>');
    if (editorRef.current) editorRef.current.innerHTML = '<p></p>';
  }, []);

  const loadArticles = useCallback(async (showSpinner = true) => {
    if (showSpinner) setIsLoading(true);
    setError(null);

    try {
      if (isSupabaseConfigured()) {
        const { data, error: fetchError } = await supabase!
          .from('scp_articles')
          .select('*')
          .order('updated_at', { ascending: false });

        if (fetchError) throw fetchError;
        const mapped = (data || []).map(mapRowToArticle);
        setArticles(mapped);
      } else {
        const raw = localStorage.getItem(LOCAL_ARCHIVE_KEY);
        const parsed: SCPArchiveArticle[] = raw ? JSON.parse(raw) : [];
        parsed.sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
        setArticles(parsed);
      }
    } catch (e: any) {
      setError(`Ошибка загрузки архива: ${e?.message || 'неизвестно'}`);
    } finally {
      if (showSpinner) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArticles(true);
  }, [loadArticles]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const channel = supabase!
      .channel('scp-archive-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scp_articles' }, () => loadArticles(false))
      .subscribe();

    return () => {
      supabase!.removeChannel(channel);
    };
  }, [loadArticles]);

  useEffect(() => {
    if (mode === 'create') {
      if (selectedSlug) setSelectedSlug(null);
      return;
    }

    if (routeSlug) {
      const normalized = normalizeScpSlug(routeSlug) || routeSlug.toUpperCase();
      setSelectedSlug(normalized);
      setMode('view');
      return;
    }

    if (!selectedSlug && articles.length > 0) {
      setSelectedSlug(articles[0].slug);
      onArticleRouteChange?.(articles[0].slug);
    }
  }, [articles, mode, onArticleRouteChange, routeSlug, selectedSlug]);

  useEffect(() => {
    if (!selectedArticle) return;
    if (!editorRef.current) return;
    if (mode !== 'edit') return;
    editorRef.current.innerHTML = selectedArticle.content_html;
    setEditorHtml(selectedArticle.content_html);
  }, [mode, selectedArticle]);

  const openArticle = useCallback(
    (article: SCPArchiveArticle) => {
      setMode('view');
      setSelectedSlug(article.slug);
      onArticleRouteChange?.(article.slug);
    },
    [onArticleRouteChange]
  );

  const startCreate = () => {
    setMode('create');
    setSelectedSlug(null);
    onArticleRouteChange?.(null);
    resetEditor();
  };

  const startEdit = () => {
    if (!selectedArticle) return;
    setMode('edit');
    setSlugInput(selectedArticle.slug);
    setTitle(selectedArticle.title);
    setSummary(selectedArticle.summary);
    setObjectClass(selectedArticle.object_class);
    setEditorHtml(selectedArticle.content_html || '<p></p>');
    if (editorRef.current) editorRef.current.innerHTML = selectedArticle.content_html || '<p></p>';
  };

  const cancelEditor = () => {
    if (selectedArticle) {
      setMode('view');
      if (editorRef.current) editorRef.current.innerHTML = selectedArticle.content_html;
      setEditorHtml(selectedArticle.content_html);
      return;
    }
    setMode('view');
    resetEditor();
  };

  const execEditorCommand = (command: string, value?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    setEditorHtml(editorRef.current.innerHTML);
  };

  const addLink = () => {
    const href = prompt('Введите URL (https://...)');
    if (!href) return;
    execEditorCommand('createLink', href);
  };

  const persistLocal = (next: SCPArchiveArticle[]) => {
    localStorage.setItem(LOCAL_ARCHIVE_KEY, JSON.stringify(next));
    setArticles(next.sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1)));
  };

  const handleSave = async () => {
    const normalizedSlug = normalizeScpSlug(slugInput);
    if (!normalizedSlug) {
      setError('Введите корректный идентификатор, например SCP-173.');
      return;
    }

    const normalizedTitle = title.trim() || normalizedSlug;
    const sanitized = sanitizeRichText(editorRef.current?.innerHTML || editorHtml || '');
    if (!stripHtml(sanitized)) {
      setError('Текст статьи не может быть пустым.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (isSupabaseConfigured()) {
        const {
          data: { session }
        } = await supabase!.auth.getSession();

        if (!session?.user?.id) {
          throw new Error('Нет активной Supabase-сессии. Перезайдите в аккаунт.');
        }

        const payload = {
          slug: normalizedSlug,
          title: normalizedTitle,
          object_class: objectClass,
          summary: summary.trim(),
          content_html: sanitized,
          author_id: session.user.id,
          author_name: currentUser.name || session.user.email || 'Unknown',
          updated_at: nowIso()
        };

        const { data, error: saveError } = await supabase!
          .from('scp_articles')
          .upsert(payload, { onConflict: 'slug' })
          .select('*')
          .single();

        if (saveError) throw saveError;
        const saved = mapRowToArticle(data);
        setMode('view');
        setSelectedSlug(saved.slug);
        onArticleRouteChange?.(saved.slug);
        await loadArticles(false);
      } else {
        const payload = {
          slug: normalizedSlug,
          title: normalizedTitle,
          object_class: objectClass,
          summary: summary.trim(),
          content_html: sanitized,
          author_id: currentUser.id,
          author_name: currentUser.name,
          updated_at: nowIso()
        };

        const existing = articles.find((article) => article.slug === normalizedSlug);
        const next: SCPArchiveArticle[] = existing
          ? articles.map((article) =>
              article.slug === normalizedSlug
                ? {
                    ...article,
                    title: payload.title,
                    object_class: payload.object_class,
                    summary: payload.summary,
                    content_html: payload.content_html,
                    author_id: payload.author_id,
                    author_name: payload.author_name,
                    updated_at: payload.updated_at
                  }
                : article
            )
          : [
              {
                id: crypto.randomUUID(),
                slug: payload.slug,
                title: payload.title,
                object_class: payload.object_class,
                summary: payload.summary,
                content_html: payload.content_html,
                author_id: payload.author_id,
                author_name: payload.author_name,
                created_at: nowIso(),
                updated_at: payload.updated_at
              },
              ...articles
            ];

        persistLocal(next);
        setMode('view');
        setSelectedSlug(normalizedSlug);
        onArticleRouteChange?.(normalizedSlug);
      }
    } catch (e: any) {
      const code = e?.code ? ` [${e.code}]` : '';
      setError(`Ошибка сохранения${code}: ${e?.message || 'неизвестно'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const onSaveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    void handleSave();
  };

  const articleUrl = selectedArticle ? `${window.location.origin}/${selectedArticle.slug}` : '';

  return (
    <div className="flex flex-col min-h-screen h-full gap-6 bg-black p-4 text-gray-200">
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <h2 className="text-2xl font-bold tracking-widest text-white uppercase flex items-center gap-3">
          <Archive size={24} /> Архив SCP-статей
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadArticles(true)}
            className="px-3 py-2 border border-gray-700 text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={14} /> Обновить
          </button>
          <button
            onClick={startCreate}
            className="px-3 py-2 border border-scp-terminal text-scp-terminal text-xs uppercase tracking-wider hover:bg-scp-terminal hover:text-black transition-colors flex items-center gap-2"
          >
            <Plus size={14} /> Новая статья
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1">
        <aside className="md:col-span-4 flex flex-col gap-4 bg-gray-900/40 border border-gray-800 p-4">
          <div className="flex gap-2">
            <div className="flex-1 flex items-center border border-gray-700 bg-black px-2">
              <Search size={16} className="text-gray-500" />
              <input
                type="text"
                placeholder="Поиск SCP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent px-2 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <RefreshCw className="animate-spin text-scp-terminal" size={28} />
              </div>
            ) : filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => openArticle(article)}
                  className={`w-full text-left p-3 border-l-2 transition-all ${
                    selectedSlug === article.slug && mode === 'view'
                      ? 'border-scp-terminal bg-gray-800/80'
                      : 'border-transparent hover:bg-gray-800/50'
                  }`}
                >
                  <div className="font-bold text-sm text-white">{article.slug}</div>
                  <div className="text-xs text-gray-300 truncate">{article.title}</div>
                  <div className="text-[10px] text-gray-500 uppercase mt-1">{article.author_name}</div>
                </button>
              ))
            ) : (
              <div className="text-center text-xs uppercase text-gray-500 py-10">Статьи не найдены</div>
            )}
          </div>
        </aside>

        <main className="md:col-span-8 bg-gray-900/30 border border-gray-800 p-6">
          {error && (
            <div className="mb-4 p-3 border border-red-900 bg-red-950/20 text-red-300 text-sm">{error}</div>
          )}

          {(mode === 'create' || mode === 'edit') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold uppercase tracking-wider">
                  {mode === 'create' ? 'Создание статьи' : `Редактирование ${selectedArticle?.slug || ''}`}
                </h3>
                <button
                  onClick={cancelEditor}
                  className="px-2 py-1 border border-gray-700 hover:bg-gray-800 text-xs flex items-center gap-1"
                >
                  <X size={14} /> Закрыть
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={slugInput}
                  onChange={(e) => setSlugInput(e.target.value)}
                  placeholder="SCP-173"
                  className="bg-black border border-gray-700 p-2 text-sm focus:outline-none focus:border-scp-terminal"
                />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Название статьи"
                  className="bg-black border border-gray-700 p-2 text-sm focus:outline-none focus:border-scp-terminal"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select
                  value={objectClass}
                  onChange={(e) => setObjectClass(e.target.value as ObjectClass)}
                  className="bg-black border border-gray-700 p-2 text-sm focus:outline-none focus:border-scp-terminal"
                >
                  {Object.values(ObjectClass).map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Краткое описание"
                  className="bg-black border border-gray-700 p-2 text-sm focus:outline-none focus:border-scp-terminal"
                />
              </div>

              <div className="border border-gray-700 bg-black">
                <div className="flex flex-wrap items-center gap-2 border-b border-gray-800 p-2">
                  <button type="button" className="p-1.5 hover:bg-gray-800" onClick={() => execEditorCommand('bold')} title="Жирный">
                    <Bold size={16} />
                  </button>
                  <button type="button" className="p-1.5 hover:bg-gray-800" onClick={() => execEditorCommand('italic')} title="Курсив">
                    <Italic size={16} />
                  </button>
                  <button type="button" className="p-1.5 hover:bg-gray-800" onClick={() => execEditorCommand('underline')} title="Подчеркнутый">
                    <Underline size={16} />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 hover:bg-gray-800"
                    onClick={() => execEditorCommand('insertUnorderedList')}
                    title="Маркированный список"
                  >
                    <List size={16} />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 hover:bg-gray-800"
                    onClick={() => execEditorCommand('insertOrderedList')}
                    title="Нумерованный список"
                  >
                    <ListOrdered size={16} />
                  </button>
                  <button type="button" className="p-1.5 hover:bg-gray-800" onClick={addLink} title="Ссылка">
                    <LinkIcon size={16} />
                  </button>
                  <button type="button" className="p-1.5 hover:bg-gray-800 text-xs px-2" onClick={() => execEditorCommand('formatBlock', 'h3')}>
                    H3
                  </button>
                  <button type="button" className="p-1.5 hover:bg-gray-800 text-xs px-2" onClick={() => execEditorCommand('formatBlock', 'p')}>
                    P
                  </button>
                </div>

                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => setEditorHtml((e.target as HTMLDivElement).innerHTML)}
                  className="min-h-[360px] p-4 text-sm focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onSaveClick}
                  disabled={isSaving}
                  className="px-4 py-2 border border-scp-terminal text-scp-terminal text-xs uppercase tracking-widest hover:bg-scp-terminal hover:text-black transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={cancelEditor}
                  className="px-4 py-2 border border-gray-700 text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors"
                >
                  Отмена
                </button>
                {isSaving && <span className="text-xs text-gray-400 uppercase">Сохранение...</span>}
              </div>
            </div>
          )}

          {mode === 'view' && selectedArticle && (
            <article className="space-y-4">
              <header className="border-b border-gray-800 pb-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h1 className="text-3xl font-black tracking-tight">{selectedArticle.slug}</h1>
                  <div className={`px-3 py-1 border text-xs font-bold ${objectClassColor(selectedArticle.object_class)}`}>
                    {selectedArticle.object_class}
                  </div>
                </div>
                <h2 className="text-xl text-white mt-2">{selectedArticle.title}</h2>
                {selectedArticle.summary && <p className="text-sm text-gray-400 mt-2">{selectedArticle.summary}</p>}
                <div className="text-[11px] uppercase text-gray-500 mt-3 flex flex-wrap gap-4">
                  <span>Автор: {selectedArticle.author_name}</span>
                  <span>Обновлено: {new Date(selectedArticle.updated_at).toLocaleString()}</span>
                </div>
                <div className="mt-3 text-xs text-scp-terminal break-all">{articleUrl}</div>
              </header>

              <section
                className="prose prose-invert max-w-none prose-p:my-3 prose-li:my-1"
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(selectedArticle.content_html) }}
              />

              <div className="pt-4 border-t border-gray-800">
                <button
                  onClick={startEdit}
                  className="px-3 py-2 border border-gray-700 text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors"
                >
                  Редактировать
                </button>
              </div>
            </article>
          )}

          {mode === 'view' && !selectedArticle && (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <FileText size={64} className="mb-3" />
              <p className="uppercase tracking-widest text-xs">Выберите статью или создайте новую</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Database;
