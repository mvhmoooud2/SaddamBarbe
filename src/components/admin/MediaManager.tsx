"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  RefreshCcw,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { asset } from "@/lib/base-path";

type MediaItem = {
  url: string;
  name: string;
  isSupabase?: boolean;
};

export default function MediaManager() {
  const [images, setImages] = useState<MediaItem[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [isUploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/upload");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "فشل تحميل الصور");
      const list = (data.images || []).map((url: string) => ({
        url,
        name: url.split("/").pop() || "image",
        isSupabase: url.startsWith("http"),
      }));
      setImages(list);
    } catch (e: any) {
      setError(e.message || "فشل تحميل الصور");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadImages();
  }, [loadImages]);

  async function uploadFiles(files: FileList | File[]) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        if (res.ok) successCount++;
      } catch {
        // continue
      }
    }

    setUploading(false);
    if (successCount > 0) {
      setNotice(`تم رفع ${successCount} صورة بنجاح إلى Supabase Storage ✅`);
      void loadImages();
      setTimeout(() => setNotice(null), 4000);
    } else {
      setError("فشل رفع الصور، تأكد من إعدادات Supabase Storage أو حجم الملف");
    }
  }

  async function deleteImage(item: MediaItem) {
    if (!confirm(`هل أنت متأكد من حذف هذه الصورة: ${item.name}؟`)) return;

    try {
      const res = await fetch(
        `/api/admin/upload?path=${encodeURIComponent(item.url)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setNotice("تم حذف الصورة ✅");
        setImages((prev) => prev.filter((img) => img.url !== item.url));
        setTimeout(() => setNotice(null), 3000);
      } else {
        setError("تعذر حذف الصورة");
      }
    } catch (e: any) {
      setError(e.message || "فشل الحذف");
    }
  }

  function copy(url: string) {
    void navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  }

  return (
    <div className="space-y-6">
      {/* الهيدر */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-[#f5f0e6]">
            <FolderOpen className="h-5 w-5 text-[#c9a227]" />
            مكتبة صور Supabase Storage
          </h2>
          <p className="text-xs text-[#f5f0e6]/50">
            ارفع صور الخدمات والعروض والفرع هنا، وانسخ روابطها لتستخدمها في أي مكان
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => void loadImages()}
            className="inline-flex items-center gap-2 rounded-full border border-[#c9a227]/40 px-4 py-2 text-xs font-bold text-[#c9a227] hover:bg-[#c9a227]/10"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            تحديث
          </button>
          <button
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-2 rounded-full bg-[#c9a227] px-5 py-2 text-xs font-bold text-[#0f0f0f] shadow-lg hover:bg-[#e6be3f] disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="h-4 w-4" />
            )}
            رفع صور جديدة
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) void uploadFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {notice && (
        <p className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2.5 text-sm text-green-300">
          {notice}
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
          {error}
        </p>
      )}

      {/* منطقة السحب والإفلات */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files) void uploadFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#c9a227]/30 bg-[#141414] p-8 text-center transition hover:border-[#c9a227] hover:bg-[#181818]"
      >
        <UploadCloud className="mb-3 h-10 w-10 text-[#c9a227]" />
        <p className="text-sm font-bold text-[#f5f0e6]">
          اضغط هنا لاختيار صور من جهازك أو اسحبها وأفلتها مباشرة
        </p>
        <p className="mt-1 text-xs text-[#f5f0e6]/40">
          يدعم JPG, PNG, WEBP, GIF, SVG حتى 15 ميجابايت لكل صورة
        </p>
      </div>

      {/* شبكة الصور */}
      {isLoading ? (
        <div className="flex justify-center py-16 text-[#c9a227]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : images.length === 0 ? (
        <div className="rounded-2xl border border-[#c9a227]/20 bg-[#141414] py-16 text-center text-[#f5f0e6]/50">
          <ImageIcon className="mx-auto mb-2 h-10 w-10 text-[#c9a227]/30" />
          <p className="text-sm">لا توجد صور بعد في مكتبة التخزين</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {images.map((item) => {
            const previewUrl = item.url.startsWith("http")
              ? item.url
              : asset(item.url);
            const isCopied = copiedUrl === item.url;

            return (
              <div
                key={item.url}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#c9a227]/20 bg-[#141414] shadow transition hover:border-[#c9a227]/60"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt={item.name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                  {item.isSupabase && (
                    <span className="absolute left-2 top-2 rounded-full bg-[#c9a227] px-2 py-0.5 text-[10px] font-black text-[#0f0f0f]">
                      Supabase
                    </span>
                  )}
                </div>

                <div className="flex flex-col justify-between p-3">
                  <p className="truncate text-xs font-medium text-[#f5f0e6]" dir="ltr">
                    {item.name}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between gap-1 border-t border-[#c9a227]/10 pt-2">
                    <button
                      type="button"
                      onClick={() => copy(item.url)}
                      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition ${
                        isCopied
                          ? "bg-green-500/20 text-green-300"
                          : "bg-[#c9a227]/15 text-[#c9a227] hover:bg-[#c9a227]/25"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3 w-3" /> تم النسخ
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> نسخ الرابط
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => void deleteImage(item)}
                      className="rounded-lg p-1 text-red-400 opacity-60 transition hover:bg-red-500/20 hover:opacity-100"
                      title="حذف الصورة"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
