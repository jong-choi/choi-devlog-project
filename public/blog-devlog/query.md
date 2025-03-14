테이블의 정책을 삭제하는 쿼리

```postgres sql
DO $$
DECLARE policy_record RECORD;
BEGIN
-- public.posts 테이블의 모든 RLS 정책 삭제
FOR policy_record IN (SELECT polname FROM pg_policy WHERE polrelid = 'public.posts'::regclass)
LOOP
EXECUTE format('DROP POLICY IF EXISTS %I ON public.posts CASCADE;', policy_record.polname);
END LOOP;

-- public.subcategories 테이블의 모든 RLS 정책 삭제
FOR policy_record IN (SELECT polname FROM pg_policy WHERE polrelid = 'public.subcategories'::regclass)
LOOP
EXECUTE format('DROP POLICY IF EXISTS %I ON public.subcategories CASCADE;', policy_record.polname);
END LOOP;

-- storage.objects 테이블의 모든 RLS 정책 삭제
FOR policy_record IN (SELECT polname FROM pg_policy WHERE polrelid = 'storage.objects'::regclass)
LOOP
EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects CASCADE;', policy_record.polname);
END LOOP;
END $$;
```

"public"."posts", "public"."subcategories" 테이블에

- 조회 - 누구나
- 생성 - 로그인된 사용자만
- 수정 및 삭제 - 자신이 작성한 Row만

```postgres sql
-- public.posts 테이블에 RLS 정책 적용
create policy "Enable delete for users based on user_id"
on "public"."posts"
to public
using (
(( SELECT auth.uid() AS uid) = user_id)
);

create policy "Enable insert for authenticated users only"
on "public"."posts"
to authenticated
with check (
true
);

create policy "Enable update for users based on user_id"
on "public"."posts"
to public
using (
(( SELECT auth.uid() AS uid) = user_id)
)
with check (
(( SELECT auth.uid() AS uid) = user_id)
);

create policy "Enable read access for all users"
on "public"."posts"
to public
using (
true
);

-- public.subcategories 테이블에 RLS 정책 적용
create policy "Enable delete for users based on user_id"
on "public"."subcategories"
to public
using (
(( SELECT auth.uid() AS uid) = user_id)
);

create policy "Enable insert for authenticated users only"
on "public"."subcategories"
to authenticated
with check (
true
);

create policy "Enable update for users based on user_id"
on "public"."subcategories"
to public
using (
(( SELECT auth.uid() AS uid) = user_id)
)
with check (
(( SELECT auth.uid() AS uid) = user_id)
);

create policy "Enable read access for all users"
on "public"."subcategories"
to public
using (
true
);
```

테이블의 정책을 삭제하는 쿼리

```postgres sql
DO $$
DECLARE policy_record RECORD;
BEGIN
    -- storage.objects 테이블의 모든 RLS 정책 삭제
    FOR policy_record IN (SELECT polname FROM pg_policy WHERE polrelid = 'storage.objects'::regclass)
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects CASCADE;', policy_record.polname);
    END LOOP;
END $$;
```

스토리지에 정책을 추가하기 [저장소 액세스 제어](https://supabase.com/docs/guides/storage/security/access-control#access-policies)

on storage.objects에 아래의 정책을 추가해주세요

- 조회 - 누구나
- 생성 - 로그인된 사용자만

```postgres sql
-- 모든 사용자가 파일을 읽을 수 있도록 허용
CREATE POLICY "Enable read access for all users"
ON storage.objects
FOR SELECT
TO public
USING (true);

-- 인증된 사용자만 업로드 가능
CREATE POLICY "Enable insert for authenticated users only"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (true);
```
