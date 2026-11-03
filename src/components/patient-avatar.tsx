import * as React from "react";
import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

export type GenderType = "female" | "male" | "other" | "neutral" | string;

export function FemaleCartoonAvatar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-full select-none", className)}
      aria-label="Female cartoon avatar"
    >
      <defs>
        <linearGradient id="female-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FCE7F3" />
          <stop offset="100%" stopColor="#CCFBF1" />
        </linearGradient>
        <linearGradient id="female-hair" x1="20" y1="10" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4A2810" />
          <stop offset="100%" stopColor="#2A1405" />
        </linearGradient>
        <linearGradient id="female-scrub" x1="30" y1="75" x2="70" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0D9488" />
          <stop offset="100%" stopColor="#0F766E" />
        </linearGradient>
      </defs>

      {/* Background circle */}
      <circle cx="50" cy="50" r="50" fill="url(#female-bg)" />

      {/* Back Hair */}
      <path
        d="M24 40 C20 56, 21 74, 28 85 C31 82, 36 76, 36 68 C36 58, 30 45, 24 40 Z"
        fill="url(#female-hair)"
      />
      <path
        d="M76 40 C80 56, 79 74, 72 85 C69 82, 64 76, 64 68 C64 58, 70 45, 76 40 Z"
        fill="url(#female-hair)"
      />

      {/* Neck */}
      <path d="M43 65 L43 78 C43 81, 57 81, 57 78 L57 65 Z" fill="#F7C5A8" />
      <path d="M43 73 C46 76, 54 76, 57 73 L57 78 C57 81, 43 81, 43 78 Z" fill="#E8AE90" />

      {/* Clothes / Scrubs */}
      <path d="M22 100 C22 83, 36 78, 50 80 C64 78, 78 83, 78 100 Z" fill="url(#female-scrub)" />
      {/* V-neck */}
      <path d="M43 80 L50 92 L57 80 Z" fill="#F7C5A8" />
      <path d="M44 80 L50 88 L56 80" stroke="#042F2E" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Ears */}
      <circle cx="29" cy="54" r="4.5" fill="#FBD5BE" />
      <circle cx="71" cy="54" r="4.5" fill="#FBD5BE" />
      <circle cx="29" cy="56" r="1.5" fill="#F59E0B" />
      <circle cx="71" cy="56" r="1.5" fill="#F59E0B" />

      {/* Head / Face */}
      <ellipse cx="50" cy="52" rx="20" ry="22" fill="#FBD5BE" />

      {/* Cheeks blush */}
      <circle cx="36" cy="58" r="4" fill="#F472B6" opacity="0.38" />
      <circle cx="64" cy="58" r="4" fill="#F472B6" opacity="0.38" />

      {/* Eyebrows */}
      <path d="M36 45 Q41 42 46 44" stroke="#4A2810" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M54 44 Q59 42 64 45" stroke="#4A2810" strokeWidth="1.8" strokeLinecap="round" fill="none" />

      {/* Eyes */}
      <circle cx="41" cy="52" r="3" fill="#1E293B" />
      <circle cx="42" cy="51" r="1" fill="#FFFFFF" />
      <circle cx="59" cy="52" r="3" fill="#1E293B" />
      <circle cx="60" cy="51" r="1" fill="#FFFFFF" />

      {/* Eyelashes */}
      <path d="M37 48 Q41 45 45 48" stroke="#1E293B" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M55 48 Q59 45 63 48" stroke="#1E293B" strokeWidth="1.2" strokeLinecap="round" fill="none" />

      {/* Nose */}
      <path d="M50 53 Q51.5 56.5 49 57.5" stroke="#E29578" strokeWidth="1.4" strokeLinecap="round" fill="none" />

      {/* Smile */}
      <path d="M44 62 Q50 68 56 62" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Front Hair */}
      <path
        d="M28 46 C27 28, 38 18, 50 18 C63 18, 73 28, 72 46 C68 35, 59 30, 50 31 C40 32, 33 38, 28 46 Z"
        fill="url(#female-hair)"
      />
      <path
        d="M28 43 C33 34, 42 30, 51 30 C43 32, 35 38, 31 46 Z"
        fill="#6A3B18"
        opacity="0.65"
      />
    </svg>
  );
}

export function MaleCartoonAvatar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-full select-none", className)}
      aria-label="Male cartoon avatar"
    >
      <defs>
        <linearGradient id="male-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E0F2FE" />
          <stop offset="100%" stopColor="#EDE9FE" />
        </linearGradient>
        <linearGradient id="male-hair" x1="20" y1="10" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="male-polo" x1="30" y1="75" x2="70" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>
      </defs>

      {/* Background circle */}
      <circle cx="50" cy="50" r="50" fill="url(#male-bg)" />

      {/* Ears */}
      <circle cx="27" cy="54" r="5" fill="#FBD5BE" />
      <circle cx="73" cy="54" r="5" fill="#FBD5BE" />

      {/* Neck */}
      <path d="M43 65 L43 78 C43 81, 57 81, 57 78 L57 65 Z" fill="#F7C5A8" />
      <path d="M43 73 C46 76, 54 76, 57 73 L57 78 C57 81, 43 81, 43 78 Z" fill="#E8AE90" />

      {/* Polo Shirt */}
      <path d="M21 100 C21 83, 35 78, 50 80 C65 78, 79 83, 79 100 Z" fill="url(#male-polo)" />
      {/* Polo Collar */}
      <path d="M42 80 L50 93 L58 80 Z" fill="#F7C5A8" />
      <path d="M38 79 L49 89 L49 98 L51 98 L51 89 L62 79 Z" fill="#0C4A6E" opacity="0.3" />

      {/* Head / Face */}
      <rect x="29" y="33" width="42" height="43" rx="19" fill="#FBD5BE" />

      {/* Cheeks warmth */}
      <circle cx="36" cy="60" r="4" fill="#F97316" opacity="0.2" />
      <circle cx="64" cy="60" r="4" fill="#F97316" opacity="0.2" />

      {/* Eyebrows */}
      <path d="M35 44 Q41 41 47 43" stroke="#1E293B" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M53 43 Q59 41 65 44" stroke="#1E293B" strokeWidth="2.4" strokeLinecap="round" fill="none" />

      {/* Eyes */}
      <circle cx="41" cy="52" r="3" fill="#1E293B" />
      <circle cx="42" cy="51" r="1" fill="#FFFFFF" />
      <circle cx="59" cy="52" r="3" fill="#1E293B" />
      <circle cx="60" cy="51" r="1" fill="#FFFFFF" />

      {/* Nose */}
      <path d="M50 53 Q52 56 49 57.5" stroke="#E29578" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Smile */}
      <path d="M43 63 Q50 69 57 63" stroke="#991B1B" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Modern textured short hair */}
      <path
        d="M26 39 C26 22, 37 15, 50 15 C63 15, 74 22, 74 39 C70 30, 60 23, 49 23 C38 23, 31 29, 26 39 Z"
        fill="url(#male-hair)"
      />
      <path
        d="M26 34 C31 22, 45 16, 61 18 C50 20, 37 24, 32 35 Z"
        fill="#334155"
      />
    </svg>
  );
}

export function NeutralCartoonAvatar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-full select-none", className)}
      aria-label="Neutral cartoon avatar"
    >
      <defs>
        <linearGradient id="neutral-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#E0E7FF" />
        </linearGradient>
        <linearGradient id="neutral-hair" x1="20" y1="10" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#374151" />
          <stop offset="100%" stopColor="#1F2937" />
        </linearGradient>
        <linearGradient id="neutral-scrub" x1="30" y1="75" x2="70" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>
      </defs>

      {/* Background circle */}
      <circle cx="50" cy="50" r="50" fill="url(#neutral-bg)" />

      {/* Ears */}
      <circle cx="28" cy="53" r="4.5" fill="#FBD5BE" />
      <circle cx="72" cy="53" r="4.5" fill="#FBD5BE" />

      {/* Neck */}
      <path d="M44 65 L44 78 C44 81, 56 81, 56 78 L56 65 Z" fill="#F7C5A8" />

      {/* Shirt */}
      <path d="M23 100 C23 83, 36 78, 50 80 C64 78, 77 83, 77 100 Z" fill="url(#neutral-scrub)" />
      <path d="M43 80 L50 91 L57 80 Z" fill="#F7C5A8" />
      <path d="M45 80 L50 87 L55 80" stroke="#312E81" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Head */}
      <ellipse cx="50" cy="52" rx="20" ry="21" fill="#FBD5BE" />

      {/* Cheeks */}
      <circle cx="37" cy="58" r="3.5" fill="#F43F5E" opacity="0.22" />
      <circle cx="63" cy="58" r="3.5" fill="#F43F5E" opacity="0.22" />

      {/* Eyebrows */}
      <path d="M37 45 Q41 42 46 44" stroke="#374151" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M54 44 Q59 42 63 45" stroke="#374151" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Eyes */}
      <circle cx="41" cy="51" r="2.8" fill="#1E293B" />
      <circle cx="42" cy="50" r="0.9" fill="#FFFFFF" />
      <circle cx="59" cy="51" r="2.8" fill="#1E293B" />
      <circle cx="60" cy="50" r="0.9" fill="#FFFFFF" />

      {/* Nose */}
      <path d="M50 53 Q51.5 56 49 57" stroke="#E29578" strokeWidth="1.4" strokeLinecap="round" fill="none" />

      {/* Smile */}
      <path d="M44 62 Q50 67 56 62" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Curly/wavy neat neutral hair */}
      <path
        d="M28 42 C28 24, 38 18, 50 18 C62 18, 72 24, 72 42 C68 33, 60 26, 50 26 C40 26, 32 33, 28 42 Z"
        fill="url(#neutral-hair)"
      />
      <circle cx="34" cy="27" r="5" fill="#4B5563" />
      <circle cx="46" cy="22" r="5" fill="#4B5563" />
      <circle cx="58" cy="23" r="5" fill="#4B5563" />
      <circle cx="66" cy="29" r="4.5" fill="#4B5563" />
    </svg>
  );
}

export interface PatientAvatarProps {
  user?: User | null;
  gender?: GenderType | null;
  avatarUrl?: string | null;
  name?: string | null;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  forceCartoon?: boolean;
}

const sizeClasses = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

/**
 * Renders patient avatar with priority:
 * 1. If not forceCartoon, user's Google photo / custom avatarUrl if valid.
 * 2. Cartoon avatar matching selected gender ('female' | 'male' | 'other' / 'neutral').
 * 3. Initial letter fallback if needed.
 */
export function PatientAvatar({
  user,
  gender,
  avatarUrl,
  name,
  className,
  size = "md",
  forceCartoon = false,
}: PatientAvatarProps) {
  const [imageError, setImageError] = useState(false);

  // 1. Resolve direct Google or uploaded avatar image
  const resolvedUrl =
    !forceCartoon && !imageError
      ? avatarUrl ||
        (typeof user?.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null) ||
        (typeof user?.user_metadata?.picture === "string" ? user.user_metadata.picture : null)
      : null;

  // 2. Resolve gender
  const resolvedGender = (
    gender ||
    (typeof user?.user_metadata?.gender === "string" ? user.user_metadata.gender : null) ||
    (typeof window !== "undefined" ? localStorage.getItem("physio_patient_gender") : null) ||
    "neutral"
  ).toLowerCase();

  const containerSize = sizeClasses[size];

  if (resolvedUrl) {
    return (
      <div
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-primary/20 bg-muted shadow-sm transition-transform hover:scale-105",
          containerSize,
          className,
        )}
      >
        <img
          src={resolvedUrl}
          alt={name || "Patient avatar"}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // 3. Render cartoon avatar based on gender
  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-primary/20 shadow-sm transition-transform hover:scale-105 bg-background",
        containerSize,
        className,
      )}
    >
      {resolvedGender === "female" ? (
        <FemaleCartoonAvatar />
      ) : resolvedGender === "male" ? (
        <MaleCartoonAvatar />
      ) : (
        <NeutralCartoonAvatar />
      )}
    </div>
  );
}

