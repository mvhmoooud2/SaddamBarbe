"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  FolderOpen,
  ImagePlus,
  Loader2,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import Image from "next/image";
import { asset } from "@/lib/base-path";

type Props = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
};

/**
 * حقل إدارة الصور مع دعم Supabase Storage:
 * - رفع مباشر للـ Bucket
 * - اختيار من مكتبة الصور المرفوعة
 * - معاينة فورية ومسح وتغيير
 */
export default function ImageField({ value, onChange, label }: Props) {
  const [library, setLibrary] = useState<string[]>([]);
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [isUploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      void upload(file);
    }
  }

  function copyUrl() {
    if (!value) return;
    void navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const resolvedSrc = value ? (value.startsWith("http") || value.startsWith("data:") ? value : asset(value)) : "";

  return (
    <div className="space-y-2">
      {/* معاينة وشريط التحكم */}
      <div className="flex flex-wrap items-center gap-3">
        {/* معاينة مصغرة للصورة الحالية */}
        {value ? (
          <div className="relative group h-14 w-20 shrink-0 overflow-hidden rounded-xl border border-[#c9a227]/40 bg-[#0f0f0f]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolvedSrc}
              alt="معاينة"
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-1 top-1 rounded-full bg-red-600/90 p-1 text-white opacity-0 transition group-hover:opacity-100"
              title="إزالة الصورة"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="flex h-14 w-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-[#c9a227]/30 bg-[#0a0a0a] text-[#c9a227]/60"
          >
            <UploadCloud className="h-5 w-5" />
          </div>
        )}

        {/* حقل الرابط اليدوي */}
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="رابط الصورة (Supabase Storage أو مسار محلي)"
          dir="ltr"
          className="min-w-0 flex-1 rounded-xl border border-[#c9a227]/25 bg-[#0a0a0a] px-3.5 py-2.5 text-xs text-[#f5f0e6] placeholder-[#f5f0e6]/30 outline-none transition focus:border-[#c9a227]"
        />

        {/* أزرار العمليات */}
        <div className="flex items-center gap-1.5">
          {/* زر الرفع */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#c9a227] px-3 py-2 text-xs font-bold text-[#0f0f0f] transition hover:bg-[#e6be3f] disabled:opacity-50"
            title="رفع صورة جديدة إلى Supabase Storage"
          >
            {isUploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ImagePlus className="h-3.5 w-3.5" />
            )}
            رفع
          </button>

          {/* زر فتح المكتبة */}
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#c9a227]/30 bg-[#1a1a1a] px-3 py-2 text-xs font-medium text-[#f5f0e6] transition hover:border-[#c9a227] hover:text-[#c9a227]"
            title="اختيار من الصور السابقة"
          >
            <FolderOpen className="h-3.5 w-3.5 text-[#c9a227]" />
            المكتبة
          </button>

          {/* زر نسخ الرابط */}
          {value && (
            <button
              type="button"
              onClick={copyUrl}
              className="rounded-xl border border-[#c9a227]/20 bg-[#1a1a1a] p-2 text-[#f5f0e6]/70 transition hover:text-[#c9a227]"
              title="نسخ الرابط"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
            event.target.value = "";
          }}
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-300">
          {error}
        </p>
      )}

      {/* نافذة اختيار الصور من المكتبة */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-3xl border border-[#c9a227]/30 bg-[#141414] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-[#c9a227]/20 pb-4">
              <div>
                <h3 className="text-base font-bold text-[#f5f0e6]">
                  مكتبة الصور (Supabase Storage)
                </h3>
                <p className="text-xs text-[#f5f0e6]/50">
                  اضغط على أي صورة لاختيارها في الحقل الحالي
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="rounded-full p-1.5 text-[#f5f0e6]/60 hover:bg-[#c9a227]/10 hover:text-[#f5f0e6]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {library.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-[#f5f0e6]/50">
                  <UploadCloud className="mb-2 h-10 w-10 text-[#c9a227]/40" />
                  <p className="text-sm">لا توجد صور بعد في المكتبة</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {library.map((imagePath) => {
                    const isSelected = value === imagePath;
                    const previewUrl = imagePath.startsWith("http")
                      ? imagePath
                      : asset(imagePath);

                    return (
                      <button
                        key={imagePath}
                        type="button"
                        onClick={() => {
                          onChange(imagePath);
                          setPickerOpen(false);
                        }}
                        className={`group relative aspect-video overflow-hidden rounded-xl border text-right transition ${
                          isSelected
                            ? "border-[#c9a227] ring-2 ring-[#c9a227]"
                            : "border-[#c9a227]/20 hover:border-[#c9a227]/60"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewUrl}
                          alt=""
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-[#c9a227]/40">
                            <Check className="h-6 w-6 text-[#0f0f0f] font-bold" />
                          </div>
                        )}
                        <span className="absolute bottom-0 left-0 right-0 truncate bg-black/75 px-1.5 py-0.5 text-[10px] text-[#f5f0e6]/80" dir="ltr">
                          {imagePath.split("/").pop()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[#c9a227]/20 pt-4">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#c9a227] px-4 py-2 text-xs font-bold text-[#0f0f0f]"
              >
                <UploadCloud className="h-4 w-4" />
                رفع صورة جديدة الآن
              </button>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="rounded-xl border border-[#f5f0e6]/20 px-4 py-2 text-xs font-semibold text-[#f5f0e6]/70 hover:text-[#f5f0e6]"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
