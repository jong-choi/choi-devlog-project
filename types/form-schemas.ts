import { z } from "zod";

const messages = {
  slug: "영문 소문자, 숫자, 하이픈(-)만 사용하세요",
  titleRequired: "제목을 입력해주세요",
  nameRequired: "이름을 입력해주세요",
  selectSeries: "시리즈를 선택해주세요",
  selectCategory: "주제를 선택해주세요",
  shortDescMax: "요약은 최대 500자까지 입력 가능합니다",
  deleteConfirm: "지금 삭제",
} as const;

export const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SlugField = z.string().regex(slugRegex, messages.slug);
const NonEmpty = (msg: string) => z.string().min(1, msg);

const PostBaseFields = {
  url_slug: SlugField,
  subcategory_id: NonEmpty(messages.selectSeries),
  is_private: z.boolean(),
};

export const PostCreateSchema = z.object({
  title: NonEmpty(messages.titleRequired),
  ...PostBaseFields,
});

export const PostUpdateSchema = z.object(PostBaseFields).extend({
  short_description: z
    .string()
    .max(500, messages.shortDescMax)
    .optional()
    .or(z.literal("")),
});

export const CategorySchema = z.object({
  name: NonEmpty(messages.nameRequired),
});

const SubcategoryBase = z.object({
  name: NonEmpty(messages.nameRequired),
  category_id: NonEmpty(messages.selectCategory),
  url_slug: SlugField,
});

export const SubcategoryCreateSchema = SubcategoryBase;
export const SubcategoryUpdateSchema = SubcategoryBase;

export const DeleteConfirmSchema = z.object({
  confirm: z.literal(messages.deleteConfirm),
});

export type PostCreateForm = z.infer<typeof PostCreateSchema>;
export type PostUpdateForm = z.infer<typeof PostUpdateSchema>;
export type CategoryForm = z.infer<typeof CategorySchema>;
export type SubcategoryCreateForm = z.infer<typeof SubcategoryCreateSchema>;
export type SubcategoryUpdateForm = z.infer<typeof SubcategoryUpdateSchema>;
export type DeleteConfirmForm = z.infer<typeof DeleteConfirmSchema>;
