export const POST_PAGE_COOKIE_KEYS = {
  AUTOSAVE: {
    isEditMode: "isEditMode",
    isMarkdownOn: "isMarkdownOn",
    isRawOn: "isRawOn",
  },
  SIDEBAR: {
    isSortable: "isSortable",
  },
} as const;

export type PostPageCookieKey =
  | (typeof POST_PAGE_COOKIE_KEYS.AUTOSAVE)[keyof typeof POST_PAGE_COOKIE_KEYS.AUTOSAVE]
  | (typeof POST_PAGE_COOKIE_KEYS.SIDEBAR)[keyof typeof POST_PAGE_COOKIE_KEYS.SIDEBAR];

export function setPostPageCookie(key: PostPageCookieKey, value: string) {
  document.cookie = `${key}=${value}; path=/; max-age=${60 * 60 * 24 * 7}`;
}
