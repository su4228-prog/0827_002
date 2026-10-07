# 📚 교보문고 클론 코딩

교보문고 UI를 참고해 제작한 **온라인 서점 클론 프로젝트**입니다.  
HTML5 · CSS3 · Vanilla JavaScript를 기반으로 메인/상세 화면을 구현하고, **Kakao 도서 검색 REST API**를 연동해 여러 도서 섹션을 실제 데이터로 동적 렌더링했습니다.

**HTML5 · CSS3 · Vanilla JavaScript · ES Module · Kakao REST API**


🔗 Site Link : https://su4228-prog.github.io/0827_002/
🔗 Demo :https://github.com/user-attachments/assets/24f107a4-d09c-4055-97cd-91db008ce881


---
## 📌 프로젝트 개요


| 항목 | 내용 |
| --- | --- |
| 프로젝트명 | 교보문고 클론 코딩 |
| 참고 서비스 | 교보문고 |
| 구성 페이지 | `index.html` 메인 · `sub.html` 상세 |
| 핵심 기술 | Kakao 도서 검색 API · ES Module · DOM 동적 렌더링 · 슬라이더 |
| 실행 구조 | 별도 빌드 과정 없는 정적 웹 프로젝트 |
| 메인 데이터 | Kakao API + 로컬 이미지 리소스 |
| 상세 데이터 | ADsP 상품 정보 + Kakao API 기반 추천 도서 |

---

## ✨ 주요 구현

| 구분 | 구현 내용 |
| --- | --- |
| **메인 UI** | 스티키 헤더, 메인 비주얼 슬라이더, 미니 슬라이더, 배너·콘텐츠 슬라이더 |
| **API 도서 섹션** | 오늘의 선택, MD 추천, 출판사 추천, 트렌드+, AI Picks, 베스트 |
| **상세 UI** | 표지 갤러리, 상세 탭 스크롤, 콘텐츠 펼치기·접기, 리뷰 이미지 라이트박스 |
| **상세 API 섹션** | AI 연관 추천, 이 분야의 베스트, 키워드 Pick, 저자 도서, 이 분야 신간 |
| **구매 인터랙션** | 수량 증감, 수량에 따른 총 상품금액 자동 계산 |
| **데이터 처리** | 제목·ISBN 중복 제거, 제외 키워드 필터링, 누락 데이터 검사, HTML 이스케이프 |

---

## 🏗️ 시스템 아키텍처

```text
┌──────────────────────────── 사용자 브라우저 ────────────────────────────┐
│                                                                         │
│  ┌──────────────────────┐              ┌───────────────────────────┐   │
│  │     index.html       │              │        sub.html           │   │
│  │      메인 페이지      │              │        상세 페이지         │   │
│  └──────────┬───────────┘              └────────────┬──────────────┘   │
│             │                                        │                  │
│      ┌──────▼──────┐                          ┌──────▼──────┐          │
│      │  layout.js  │                          │   sub.js    │          │
│      │ - 헤더       │                          │ - 갤러리     │          │
│      │ - 메인 슬라이더│                         │ - 상세 탭     │          │
│      │ - 미니 슬라이더│                         │ - 리뷰 확대   │          │
│      └─────────────┘                          │ - 수량 계산   │          │
│                                               │ - 추천 도서   │          │
│      ┌─────────────┐                          └──────┬──────┘          │
│      │   init.js   │                                 │                 │
│      │ 초기 실행점  │                                 │ fetch()         │
│      └──────┬──────┘                                 │                 │
│             ▼                                        │                 │
│      ┌─────────────┐                                 │                 │
│      │ sections.js │                                 │                 │
│      │ 섹션별 렌더링 │                                 │                 │
│      └──────┬──────┘                                 │                 │
│             │                                        │                 │
│      ┌──────▼──────────────┐                         │                 │
│      │ book-components.js │                         │                 │
│      │ - 공통 도서 카드     │                         │                 │
│      │ - 중복 제거          │                         │                 │
│      │ - 공통 슬라이더      │                         │                 │
│      └──────┬──────────────┘                         │                 │
│             │                                        │                 │
│      ┌──────▼──────┐                                 │                 │
│      │   core.js   │                                 │                 │
│      │ - API 호출   │────── fetch() ──────────────────┤                 │
│      │ - 공통 헬퍼  │                                 │                 │
│      │ - 데이터 필터│                                 │                 │
│      └─────────────┘                                 │                 │
│                                                                         │
│   도서 카드 / 일부 배너 클릭 ───────────────► sub.html 이동             │
└──────────────────────────────────────────────┬──────────────────────────┘
                                               │
                                               ▼
                         ┌────────────────────────────────────┐
                         │       Kakao REST API (외부)        │
                         │  GET /v3/search/book?query=...     │
                         │  documents[] + meta                │
                         └────────────────────────────────────┘
```

---

## 🔄 데이터 흐름

### 메인 페이지

```text
페이지 진입
   │
   ▼
init.js
   │
   ├─ loadChoice()
   ├─ loadMD()
   ├─ loadPublisherBooks()
   ├─ loadTrendBooks()
   ├─ loadAIPicks()
   └─ loadBestBooks()
   │
   ▼
Promise.all()로 API 섹션 동시 로딩
   │
   ▼
collectUniqueBooks()
   │
   ├─ fetchKakaoBooks()
   ├─ 제목 / 썸네일 누락 검사
   ├─ 제외 키워드 필터링
   ├─ 제목 정규화 후 중복 제거
   └─ ISBN 중복 제거
   │
   ▼
createStandardBook() / 섹션별 카드 생성
   │
   ▼
DOM에 도서 카드 렌더링
```

### 상세 페이지

```text
sub.html 진입
   │
   ├─ ADsP 상품 상세 정보 표시
   │
   └─ sub.js 실행
         │
         ├─ 갤러리 / 탭 / 리뷰 / 구매 수량 인터랙션
         │
         └─ collectSubBooks()
               │
               ▼
          fetchSubBooks()
               │
               ▼
          Kakao REST API
               │
               ▼
          추천·연관 도서 영역 렌더링
```

---

## 📁 파일 구조

```text
0827_002-main/
│
├── index.html                 # 메인 페이지
├── sub.html                   # ADsP 도서 상세 페이지
│
├── css/
│   ├── reset.css              # 기본 스타일 초기화
│   ├── common.css             # 헤더 / 푸터 등 공통 스타일
│   ├── main.css               # 메인 페이지 스타일
│   └── sub.css                # 상세 페이지 스타일
│
├── js/
│   ├── core.js                # Kakao API / 공통 헬퍼 / 필터
│   ├── book-components.js     # 공통 도서 카드 / 중복 제거 / 슬라이더
│   ├── layout.js              # 헤더 / 메인·미니 슬라이더
│   ├── sections.js            # 메인 콘텐츠 섹션 렌더링
│   ├── init.js                # 메인 페이지 실행 진입점
│   └── sub.js                 # 상세 페이지 인터랙션 + 추천 도서 API
│
├── img/                       # 페이지 이미지 리소스
└── sub_txt/                   # 상세 페이지 제작 참고 텍스트
```

---

## 🔌 Kakao 도서 검색 API

### 엔드포인트

```text
GET https://dapi.kakao.com/v3/search/book
```

### 프로젝트에서 사용하는 주요 요청값

| 파라미터 | 용도 |
| --- | --- |
| `query` | 도서 검색어 |
| `size` | 한 번에 요청하는 결과 수 |
| `sort` | 정확도순(`accuracy`) · 최신순(`latest`) |
| `page` | 추가 결과 탐색을 위한 페이지 번호 |

### 사용하는 주요 응답 필드

| 필드 | 사용 위치 |
| --- | --- |
| `title` | 도서명 |
| `thumbnail` | 표지 이미지 |
| `authors` | 저자명 |
| `contents` | 도서 소개 |
| `isbn` | 중복 제거 기준 |
| `price` / `sale_price` | 상세 페이지 추천 도서 카드 가격 |

### 실제 호출 코드 — `js/core.js`

```js
export async function fetchKakaoBooks(
    query,
    size = 30,
    sort = "accuracy",
    page = 1
) {
    const params = new URLSearchParams({
        query,
        size,
        sort,
        page
    });

    const response = await fetch(
        "https://dapi.kakao.com/v3/search/book?" + params,
        {
            method: "GET",
            headers: {
                Authorization: KAKAO_REST_API_KEY
            }
        }
    );

    if (!response.ok) {
        throw new Error("HTTP 오류: " + response.status);
    }

    return response.json();
}
```

---

## 🔎 섹션별 API 검색 키워드

메인과 상세 페이지의 도서 섹션은 각 영역의 성격에 맞는 검색어를 배열로 정의하고, Kakao 도서 검색 API 결과에서 필요한 도서를 선별해 사용했습니다.

### 메인 페이지

| 섹션 | 검색 키워드 |
| --- | --- |
| **오늘의 선택** | `소설` · `문학` · `에세이` |
| **MD 추천** | `소설` · `에세이` · `인문` · `경제경영` |
| **출판사 추천** | `문학` · `소설` · `에세이` · `인문` · `과학` · `역사` · `경제` · `사회` · `예술` |
| **트렌드+** | `심리` · `과학` · `사회` · `인문` · `문화` · `철학` · `트렌드` · `경제` |
| **AI Picks** | `인문` · `문학` · `에세이` · `과학` · `소설` |
| **베스트** | `소설` · `문학` · `에세이` · `인문` · `과학` · `철학` · `경제경영` · `역사` · `사회` · `예술` · `심리` · `자기계발` |

.

### 상세 페이지

| 섹션 | 검색 키워드 |
| --- | --- |
| **AI 연관 추천 / 이 분야의 베스트** | `IT 자격증` · `컴퓨터 IT` · `정보처리` · `데이터 분석` · `빅데이터` · `데이터 사이언스` · `데이터베이스` · `SQL` · `파이썬 데이터 분석` · `통계 데이터 분석` · `인공지능` · `머신러닝` · `클라우드 자격증` · `네트워크 자격증` · `보안 자격증` · `컴퓨터활용` · `프로그래밍 자격증` |
| **키워드 Pick** | `ADsP` · `IT 자격증` · `빅데이터` · `데이터 분석` · `SQL` · `데이터베이스` · `정보처리` · `파이썬 데이터 분석` |
| **저자 도서** | `윤종식` · `데이터분석 전문가` · `빅데이터분석기사` · `ADP 데이터분석` |
| **이 분야 신간** | `빅데이터` · `데이터 분석` · `통계` · `R 데이터 분석` · `데이터 사이언스` · `IT 자격증` |

---

## ⚙️ 핵심 구현 포인트

### 1. 여러 API 섹션 동시 로딩

메인 페이지 진입 시 도서 섹션을 각각 순차 실행하지 않고 `Promise.all()`로 함께 초기화했습니다.

```js
await Promise.all([
    loadChoice(),
    loadMD(),
    loadPublisherBooks(),
    loadTrendBooks(),
    loadAIPicks(),
    loadBestBooks()
]);
```

### 2. API 데이터 중복 제거 및 필터링

검색 결과를 렌더링하기 전에 필수 데이터 유무를 검사하고, 정규화한 제목과 ISBN을 기준으로 중복 도서를 제거했습니다.

```js
if (!book.thumbnail || !book.title) continue;
if (isExcluded(book)) continue;

if (titleSet.has(cleanTitle)) continue;
if (isbn && isbnSet.has(isbn)) continue;
```

### 3. 공통 카드·슬라이더 로직 재사용

반복되는 도서 카드와 슬라이더 기능을 `book-components.js`로 분리해 여러 섹션에서 공통으로 사용했습니다.

```js
books
    .slice(0, 6)
    .map(createStandardBook)
    .join("");

setupTwoPageSlider(
    mdTrack,
    mdPrev,
    mdNext
);
```

### 4. API 문자열 렌더링 전 HTML 이스케이프

API 응답값을 화면에 삽입하기 전에 특수문자를 변환하도록 공통 함수를 적용했습니다.

```js
export function escapeHTML(value) {
    if (!value) return "";

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
```

### 5. 화면 크기 변화에 따른 UI 재계산

창 크기가 바뀔 때 헤더 기준 위치와 메인·미니·콘텐츠 슬라이더 상태를 다시 계산하도록 구성했습니다.

```js
window.addEventListener("resize", function () {
    recalcStickyStart();
    updateMainSlider();
    updateMini();
    moveKyoboOnlySlider();
});
```

---

## 🧩 콘텐츠 구성 방식

| 영역 | 데이터 방식 |
| --- | --- |
| 메인 비주얼 / 미니 슬라이더 | 로컬 이미지 |
| 오늘의 선택 | Kakao API |
| MD 추천 | Kakao API |
| 출판사 추천 | Kakao API |
| 트렌드+ | Kakao API |
| 독서·기록 아이템 | 로컬 이미지 |
| AI Picks | Kakao API |
| 베스트 | Kakao API |
| 교보문고 ONLY / CASTing / 이벤트 배너 | 로컬 데이터·이미지 |
| 상세 페이지 기본 상품 정보 | `sub.html` 콘텐츠 |
| AI 연관 추천 / 이 분야 베스트 | Kakao API |
| 키워드 Pick / 저자 도서 / 이 분야 신간 | Kakao API |
| 리뷰 / 교환·반품 등 상세 본문 | `sub.html` 콘텐츠 |

---

## 🛠️ 기술 스택

| 구분 | 기술 | 사용 목적 |
| --- | --- | --- |
| Markup | HTML5 | 메인·상세 페이지 구조 |
| Style | CSS3 | Flexbox, Grid, 반응형 레이아웃, 슬라이더 UI |
| Script | Vanilla JavaScript | DOM 조작, 이벤트 처리, 비동기 로직 |
| Module | ES Module | 메인 페이지 JavaScript 기능별 분리 |
| API | Kakao REST API | 실제 도서 검색 데이터 호출 |

---

## 📈 기술적 성장 포인트

| 주제 | 실제 구현을 통해 다룬 내용 |
| --- | --- |
| **비동기 처리** | `async/await` 기반 API 호출과 `Promise.all()`을 이용한 여러 섹션 동시 로딩 |
| **모듈 설계** | `core → book-components → sections → init`으로 API·컴포넌트·화면 로직 역할 분리 |
| **데이터 정제** | 제목 정규화와 ISBN을 함께 사용해 API 검색 결과 중복 제거 |
| **방어 코딩** | 제목·썸네일 누락 검사, 제외 키워드 필터, API 페이지 종료 여부(`meta.is_end`) 확인 |
| **재사용 구조** | `createStandardBook()`, `setupTwoPageSlider()`로 반복되는 카드·슬라이더 로직 공통화 |
| **문자열 처리** | API 응답을 DOM에 삽입하기 전 `escapeHTML()` 적용 |
| **반응형 인터랙션** | `resize` 이벤트에 맞춰 헤더 기준점과 슬라이더 위치·상태 재계산 |
| **페이지별 역할 분리** | 메인은 ES Module로 기능을 나누고, 상세 페이지는 `sub.js`에 전용 인터랙션 구성 |
