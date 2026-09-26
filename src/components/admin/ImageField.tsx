"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

/** حقل صورة: تكتب المسار، تختار من صور الموقع، أو ترفع صورة جديدة */
export default function ImageField({ value, onChange }: Props) {
  const [library, setLibrary] = useState<string[]>([]);
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [isUploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isPickerOpen || library.length > 0) return;
    fetch("/api/admin/upload")
      .then((response) => response.json())
      .then((data) => setLibrary(data.images ?? []))
      .catch(() => setLibrary([]));
  }, [isPickerOpen, library.length]);

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "فشل رفع الصورة");
      onChange(data.url);
      setLibrary((previous) => [data.url, ...previous]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "فشل الرفع");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="/images/example.jpg"
          dir="ltr"
          className="min-w-0 flex-1 rounded-lg border border-[#c9a227]/25 bg-[#0f0f0f] px-3 py-2 text-sm text-[#f5f0e6] outline-none focus:border-[#c9a227]"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center gap-2 rounded-lg bg-[#c9a227] px-3 py-2 text-xs font-bold text-[#0f0f0f] disabled:opacity-60"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          رفع صورة
        </button>
        <button
          type="button"
          onClick={() => setPickerOpen((open) => !open)}
          className="rounded-lg border border-[#c9a227]/40 px-3 py-2 text-xs font-bold text-[#c9a227]"
        >
          {isPickerOpen ? "إخفاء الصور" : "اختار من الصور"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-lg border border-red-500/40 p-2 text-red-400"
            aria-label="مسح الصورة"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
          event.target.value = "";
        }}
      />

      {error && <p className="text-xs text-red-400">{error}</p>}

      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt="معاينة"
          className="h-24 w-auto rounded-lg border border-[#c9a227]/20 object-cover"
        />
      )}

      {isPickerOpen && (
        <div className="grid max-h-56 grid-cols-3 gap-2 overflow-y-auto rounded-lg border border-[#c9a227]/20 bg-[#0f0f0f] p-2 sm:grid-cols-5">
          {library.length === 0 && (
            <p className="col-span-full p-2 text-xs text-[#f5f0e6]/50">
              مفيش صور متاحة.
            </p>
          )}
          {library.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => {
                onChange(src);
                setPickerOpen(false);
              }}
              className={`overflow-hidden rounded-lg border ${
                value === src ? "border-[#c9a227]" : "border-transparent"
              }`}
              title={src}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={src} className="h-16 w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
