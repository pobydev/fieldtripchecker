# 2026학년도 2학년 현장체험학습 참여 현황

Next.js App Router, TypeScript, Tailwind CSS, Supabase로 만든 1회성 현장체험학습 참여 현황 입력 웹앱입니다.

## 프로젝트 구조

```text
app/
  api/reset/route.ts
  api/status/route.ts
  admin/page.tsx
  trip/lotte/page.tsx
  trip/lotte/class/[classNo]/page.tsx
  trip/nanta/page.tsx
  trip/nanta/class/[classNo]/page.tsx
components/
lib/
supabase/
  schema.sql
  add-finalized-fields.sql
  add-note-field.sql
  seed.sql
  realtime.sql
```

## 설치

```bash
npm install
```

## 환경 변수

`.env.example`을 참고해 `.env.local`을 만듭니다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-publishable-key
SUPABASE_SECRET_KEY=sb_secret_your-secret-key
ADMIN_PASSWORD=202621
```

`SUPABASE_SECRET_KEY`는 서버 API Route에서만 사용하며 클라이언트에 노출하지 않습니다.
기존 Legacy 키를 쓰는 경우 `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`도 fallback으로 동작합니다.

## Supabase SQL

1. `supabase/schema.sql` 실행
2. 기존 테이블을 이미 만든 상태라면 `supabase/add-finalized-fields.sql` 실행
3. 기존 테이블을 이미 만든 상태라면 `supabase/add-note-field.sql` 실행
4. `supabase/seed.sql` 실행
5. `supabase/realtime.sql` 실행

Realtime은 Dashboard의 `Database > Replication`에서 `public.field_trip_status`를 `supabase_realtime` publication에 추가해도 됩니다.

## 로컬 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

## Vercel 배포

1. 이 프로젝트를 Git 저장소에 올립니다.
2. Vercel에서 새 프로젝트로 import합니다.
3. Environment Variables에 `.env.example`의 3개 값을 등록합니다.
4. Build Command는 `npm run build`, Output은 Next.js 기본값을 사용합니다.
5. 배포 후 생성된 URL을 교사에게 공유합니다.

## 운영 당일 사용 방법

1. 홈 화면에서 `롯데월드` 또는 `난타공연`을 선택합니다.
2. 담임선생님은 본인 반을 선택해 재적, 참여, 불참, 불참 번호를 입력합니다.
3. 롯데월드는 연간이용권 소지자수도 입력합니다.
4. 최종 확인 전이면 임시 저장으로 저장합니다.
5. 최종 확인이 끝난 반은 `이 반의 현황을 최종 확인했습니다.`를 체크하고 저장합니다.
6. 관리자 화면(`/admin`)에서 미입력, 임시 저장, 최종 완료 현황을 확인합니다.
7. 관리자 화면은 Supabase Realtime으로 즉시 갱신되고, 10초마다 polling으로 보정됩니다.
8. 필요 시 CSV를 다운로드하거나 데이터를 초기화합니다.
