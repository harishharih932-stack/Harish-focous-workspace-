import { useEffect, useRef, useState, useCallback } from "react";
import {
  Link2, Plus, Trash2, Archive, Play, Pause, RotateCcw, StickyNote,
  CheckSquare, Timer, Volume2, VolumeX, X, ExternalLink, GripVertical,
  Upload, FileText, Link, LayoutList, Clock,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ------------------------------ Types & storage ------------------------------
type Status = "TODO" | "DOING" | "DONE";
type TabId = "tasks" | "links" | "focus" | "notes";
interface Task { id: string; title: string; status: Status; createdAt: number; }
interface LinkItem { id: string; url: string; title: string; domain: string; favicon: string; createdAt: number; }
interface Note { id: string; text: string; updatedAt: number; }

function useLocal<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : initial; }
    catch { return initial; }
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
  }, [key, state]);
  return [state, setState] as const;
}

const uid = () => Math.random().toString(36).slice(2, 10);
const domainOf = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };

// ------------------------------ Root ------------------------------
export function Workspace() {
  const [activeTab, setActiveTab] = useState<TabId>("tasks");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-[1400px] px-6 pb-24 pt-8 lg:px-10">
        <Hero />
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)} className="mt-10">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="tasks" className="gap-1.5">
              <LayoutList className="h-4 w-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="links" className="gap-1.5">
              <Link className="h-4 w-4" />
              <span className="hidden sm:inline">Links</span>
            </TabsTrigger>
            <TabsTrigger value="focus" className="gap-1.5">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Focus</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-1.5">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Notes</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="mt-6">
            <Kanban />
          </TabsContent>
          <TabsContent value="links" className="mt-6">
            <Links />
          </TabsContent>
          <TabsContent value="focus" className="mt-6">
            <Focus />
          </TabsContent>
          <TabsContent value="notes" className="mt-6">
            <Notes />
          </TabsContent>
        </Tabs>
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto max-w-[1400px] px-6 py-6 text-sm text-muted-foreground lg:px-10">
          Focus — a calm place to work. Data stays on this device.
        </div>
      </footer>
    </div>
  );
}

// ------------------------------ Header + Hero ------------------------------
function Header() {
  const [time, setTime] = useState<Date | null>(null);
  useEffect(() => { setTime(new Date()); const i = setInterval(() => setTime(new Date()), 30_000); return () => clearInterval(i); }, []);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 lg:px-10">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground text-sm font-semibold">F</div>
          <div>
            <div className="text-sm font-semibold leading-tight">Focus</div>
            <div className="text-xs text-muted-foreground">Minimalist workspace</div>
          </div>
        </div>
        <div className="text-sm tabular-nums text-muted-foreground" suppressHydrationWarning>
          {time ? time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  return (
    <div className="flex flex-col gap-3 border-b border-border pb-8">
      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{today}</span>
      <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-foreground md:text-6xl">
        One clean tab. <span className="italic text-muted-foreground">Every workflow.</span>
      </h1>
      <p className="max-w-2xl text-base text-muted-foreground">
        Kanban tasks, saved links, focus timer and quick notes — organized on a single, quiet canvas.
      </p>
    </div>
  );
}

// ------------------------------ Kanban ------------------------------
const COLUMNS: { key: Status; label: string }[] = [
  { key: "TODO", label: "To do" },
  { key: "DOING", label: "Doing" },
  { key: "DONE", label: "Done" },
];

function Kanban() {
  const [tasks, setTasks] = useLocal<Task[]>("wk.tasks", []);
  const [drafts, setDrafts] = useState<Record<Status, string>>({ TODO: "", DOING: "", DONE: "" });
  const [dragId, setDragId] = useState<string | null>(null);

  const add = (status: Status) => {
    const title = drafts[status].trim();
    if (!title) return;
    setTasks(t => [...t, { id: uid(), title, status, createdAt: Date.now() }]);
    setDrafts(d => ({ ...d, [status]: "" }));
  };
  const move = (id: string, status: Status) => setTasks(t => t.map(x => x.id === id ? { ...x, status } : x));
  const remove = (id: string) => setTasks(t => t.filter(x => x.id !== id));

  return (
    <section id="tasks" className="rounded-xl border border-border bg-card">
      <SectionHead icon={<CheckSquare className="h-4 w-4" />} title="Tasks" hint={`${tasks.length} total`} />
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
        {COLUMNS.map(col => (
          <div
            key={col.key}
            onDragOver={e => e.preventDefault()}
            onDrop={() => { if (dragId) { move(dragId, col.key); setDragId(null); } }}
            className="flex flex-col rounded-lg bg-[var(--color-surface)] p-3"
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col.label}</span>
              <span className="text-xs text-muted-foreground">{tasks.filter(t => t.status === col.key).length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {tasks.filter(t => t.status === col.key).map(t => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={() => setDragId(t.id)}
                  className="group flex items-start gap-2 rounded-md border border-border bg-card p-3 shadow-sm transition hover:shadow"
                >
                  <GripVertical className="mt-0.5 h-4 w-4 shrink-0 cursor-grab text-muted-foreground/60" />
                  <span className="flex-1 text-sm">{t.title}</span>
                  <button onClick={() => remove(t.id)} className="opacity-0 transition group-hover:opacity-100" aria-label="Delete">
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={drafts[col.key]}
                onChange={e => setDrafts(d => ({ ...d, [col.key]: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && add(col.key)}
                placeholder="Add a task…"
                className="flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
              />
              <button onClick={() => add(col.key)} className="grid place-items-center rounded-md bg-primary px-3 text-primary-foreground hover:opacity-90">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ------------------------------ Links ------------------------------
function Links() {
  const [links, setLinks] = useLocal<LinkItem[]>("wk.links", []);
  const [url, setUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const add = () => {
    const u = url.trim();
    if (!u) return;
    const withProto = /^https?:\/\//i.test(u) ? u : `https://${u}`;
    const d = domainOf(withProto);
    setLinks(l => [{ id: uid(), url: withProto, title: d || withProto, domain: d, favicon: d ? `https://www.google.com/s2/favicons?domain=${d}&sz=64` : "", createdAt: Date.now() }, ...l]);
    setUrl("");
  };
  const remove = (id: string) => setLinks(l => l.filter(x => x.id !== id));

  const addUrl = useCallback((urlText: string) => {
    const u = urlText.trim();
    if (!u) return;
    const withProto = /^https?:\/\//i.test(u) ? u : `https://${u}`;
    const d = domainOf(withProto);
    setLinks(l => [{ id: uid(), url: withProto, title: d || withProto, domain: d, favicon: d ? `https://www.google.com/s2/favicons?domain=${d}&sz=64` : "", createdAt: Date.now() }, ...l]);
  }, [setLinks]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    // Check for dragged URL text
    const text = e.dataTransfer.getData("text/plain");
    if (text && /^https?:\/\//i.test(text)) {
      addUrl(text);
      return;
    }

    // Check for files
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      Array.from(files).forEach(file => {
        // For text files, read content as URLs
        if (file.type === "text/plain" || file.name.endsWith(".txt")) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const content = event.target?.result as string;
            const urls = content.split(/[\s\n]+/).filter(u => /^https?:\/\//i.test(u));
            urls.forEach(url => addUrl(url));
          };
          reader.readAsText(file);
        } else if (file.type.startsWith("image/")) {
          // For images, create a local object URL
          const localUrl = URL.createObjectURL(file);
          setLinks(l => [{
            id: uid(),
            url: localUrl,
            title: file.name,
            domain: "Local file",
            favicon: "",
            createdAt: Date.now()
          }, ...l]);
        } else {
          // For other files, create a reference entry
          setLinks(l => [{
            id: uid(),
            url: `file:${file.name}`,
            title: file.name,
            domain: "Local file",
            favicon: "",
            createdAt: Date.now()
          }, ...l]);
        }
      });
    }
  }, [addUrl, setLinks]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const shown = links;
  return (
    <section id="links" className="rounded-xl border border-border bg-card">
      <SectionHead icon={<Link2 className="h-4 w-4" />} title="Links" hint={`${links.length} saved`} />
      <div className="flex gap-2 border-b border-border px-4 py-3">
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          placeholder="Paste a URL or drag files here…"
          className="flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        />
        <button onClick={add} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> Save
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`relative min-h-[200px] transition-colors ${isDragging ? "bg-primary/5" : ""}`}
      >
        {isDragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-primary/50 bg-primary/5">
            <div className="text-center">
              <Upload className="mx-auto h-10 w-10 text-primary/60" />
              <p className="mt-2 text-sm font-medium text-primary">Drop URLs or files here</p>
              <p className="text-xs text-muted-foreground">URLs, text files with links, images</p>
            </div>
          </div>
        )}

        {shown.length === 0 ? (
          !isDragging && <Empty label="No links saved yet. Paste a URL above or drag files here." />
        ) : (
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map(l => (
              <a key={l.id} href={l.url} target="_blank" rel="noreferrer"
                className="group relative flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition hover:border-foreground/20 hover:shadow-sm">
                <div className="flex items-center gap-2">
                  {l.favicon
                    ? <img src={l.favicon} alt="" className="h-5 w-5 rounded-sm" />
                    : <div className="h-5 w-5 grid place-items-center rounded-sm bg-secondary text-muted-foreground">
                        {l.domain === "Local file" ? <FileText className="h-3 w-3" /> : l.domain[0]?.toUpperCase() || "?"}
                      </div>}
                  <span className="truncate text-xs text-muted-foreground">{l.domain}</span>
                  <ExternalLink className="ml-auto h-3.5 w-3.5 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                </div>
                <div className="line-clamp-2 text-sm font-medium text-foreground">{l.title}</div>
                <button
                  onClick={e => { e.preventDefault(); remove(l.id); }}
                  className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground opacity-0 transition hover:bg-secondary group-hover:opacity-100"
                  aria-label="Remove"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ------------------------------ Focus / Pomodoro ------------------------------
const WORK = 25 * 60, BREAK = 5 * 60;

function Focus() {
  const [mode, setMode] = useState<"work" | "break">("work");
  const [remaining, setRemaining] = useState(WORK);
  const [running, setRunning] = useState(false);
  const [muted, setMuted] = useState(true);
  const [track, setTrack] = useState<string>("none");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!running) return;
    const i = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
    return () => clearInterval(i);
  }, [running]);

  useEffect(() => {
    if (remaining === 0) {
      setRunning(false);
      const next = mode === "work" ? "break" : "work";
      setMode(next);
      setRemaining(next === "work" ? WORK : BREAK);
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification(next === "break" ? "Break time" : "Back to focus");
      }
    }
  }, [remaining, mode]);

  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    a.muted = muted;
    if (track === "none") { a.pause(); return; }
    a.src = TRACKS[track];
    a.loop = true; a.volume = 0.5;
    if (running) a.play().catch(() => {});
  }, [track, running, muted]);

  const total = mode === "work" ? WORK : BREAK;
  const pct = ((total - remaining) / total) * 100;
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  const requestNotify = () => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") Notification.requestPermission();
  };

  return (
    <section id="focus" className="rounded-xl border border-border bg-card">
      <SectionHead icon={<Timer className="h-4 w-4" />} title="Focus" hint={mode === "work" ? "Work" : "Break"} />
      <div className="p-6">
        <div className="relative mx-auto grid h-44 w-44 place-items-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="var(--color-border)" strokeWidth="3" />
            <circle cx="50" cy="50" r="46" fill="none" stroke="var(--color-primary)" strokeWidth="3"
              strokeDasharray={`${(pct / 100) * 289} 289`} strokeLinecap="round" />
          </svg>
          <div className="text-center">
            <div className="font-display text-4xl tabular-nums">{mm}:{ss}</div>
            <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{mode}</div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-center gap-2">
          <button onClick={() => { setRunning(r => !r); requestNotify(); }}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90">
            {running ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> Start</>}
          </button>
          <button onClick={() => { setRunning(false); setRemaining(mode === "work" ? WORK : BREAK); }}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary">
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>
        <div className="mt-6 rounded-lg border border-border p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ambient</span>
            <button onClick={() => setMuted(m => !m)} className="text-muted-foreground hover:text-foreground">
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(TRACKS).map(k => (
              <button key={k} onClick={() => setTrack(k)}
                className={`rounded-full border px-3 py-1 text-xs transition ${track === k ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground"}`}>
                {LABELS[k]}
              </button>
            ))}
          </div>
          <audio ref={audioRef} />
        </div>
      </div>
    </section>
  );
}

const TRACKS: Record<string, string> = {
  none: "",
  rain: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_1a53b1b1a9.mp3?filename=rain-and-thunder-nature-sounds-8009.mp3",
  lofi: "https://cdn.pixabay.com/download/audio/2022/10/25/audio_946bc7f4b7.mp3?filename=lofi-study-112191.mp3",
  forest: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8e5b3e0a2.mp3?filename=forest-with-small-river-birds-and-nature-field-recording-6735.mp3",
};
const LABELS: Record<string, string> = { none: "Off", rain: "Rain", lofi: "Lo-Fi", forest: "Forest" };

// ------------------------------ Notes ------------------------------
function Notes() {
  const [notes, setNotes] = useLocal<Note[]>("wk.notes", []);
  const [draft, setDraft] = useState("");
  const add = () => {
    const text = draft.trim(); if (!text) return;
    setNotes(n => [{ id: uid(), text, updatedAt: Date.now() }, ...n]);
    setDraft("");
  };
  const remove = (id: string) => setNotes(n => n.filter(x => x.id !== id));
  return (
    <section id="notes" className="rounded-xl border border-border bg-card">
      <SectionHead icon={<StickyNote className="h-4 w-4" />} title="Notes" hint={`${notes.length}`} />
      <div className="space-y-3 p-4">
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Quick thought…"
          rows={3}
          className="w-full resize-none rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        />
        <div className="flex justify-end">
          <button onClick={add} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4" /> Add note
          </button>
        </div>
        <div className="space-y-2">
          {notes.map(n => (
            <div key={n.id} className="group flex items-start gap-2 rounded-md border border-border bg-[var(--color-surface)] p-3">
              <p className="flex-1 whitespace-pre-wrap text-sm">{n.text}</p>
              <button onClick={() => remove(n.id)} className="opacity-0 transition group-hover:opacity-100">
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
          {notes.length === 0 && <Empty label="No notes yet." small />}
        </div>
      </div>
    </section>
  );
}

// ------------------------------ Shared ------------------------------
function SectionHead({ icon, title, hint, right }: { icon: React.ReactNode; title: string; hint?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-secondary text-muted-foreground">{icon}</span>
        <h2 className="text-sm font-semibold">{title}</h2>
        {hint && <span className="text-xs text-muted-foreground">· {hint}</span>}
      </div>
      {right}
    </div>
  );
}

function Empty({ label, small }: { label: string; small?: boolean }) {
  return (
    <div className={`grid place-items-center text-center text-sm text-muted-foreground ${small ? "py-6" : "py-14"}`}>
      <Archive className="mb-2 h-5 w-5 opacity-50" />
      {label}
    </div>
  );
}
