# 📚 KYOBOBOOK-Kakao
도서 검색 API 활용 UI Project

교보문고 UI를 참고해 제작한 **온라인 서점 클론 프로젝트**입니다.  
HTML5 · CSS3 · Vanilla JavaScript를 기반으로 메인/상세 화면을 구현하고, **Kakao 도서 검색 REST API**를 연동해 여러 도서 섹션을 실제 데이터로 동적 렌더링했습니다.

**HTML5 · CSS3 · Vanilla JavaScript · ES Module · Kakao REST API**

🔗 Demo :
🔗 Site Link : https://su4228-prog.github.io/0827_002/ 
---

## 📌 프로젝트 개요

| 항목 | 내용 |
| --- | --- |
| 프로젝트명 | **BOOK FOREST** |
| 참고 서비스 | 교보문고 |
| 구성 페이지 | `index.html` 메인 · `sub.html` 상세 |
| 핵심 기술 | Kakao 도서 검색 API · ES Module · DOM 동적 렌더링 · 슬라이더 |
| 실행 방식 | 별도 빌드 과정 없는 정적 웹 프로젝트 |
| 메인 데이터 | Kakao API + 로컬 이미지 리소스 |
| 상세 데이터 | ADsP 상품 정보 고정 + 연관 도서 Kakao API |

---

## ✨ 주요 구현

| 구분 | 실제 구현 내용 |
| --- | --- |
| **메인 UI** | 스티키 헤더, 메인 비주얼 슬라이더, 미니 슬라이더, 로컬 배너/콘텐츠 슬라이더 |
| **API 도서 섹션** | 오늘의 선택, MD 추천, 출판사 추천, 트렌드+, AI Picks, 베스트 |
| **상세 UI** | 표지 갤러리, 상세 탭 스크롤, 콘텐츠 펼치기/접기, 리뷰 이미지 라이트박스 |
| **상세 API 섹션** | AI 연관 추천, 이 분야의 베스트, 키워드 Pick, 저자 도서, 이 분야 신간 |
| **구매 인터랙션** | 수량 증감, 수량에 따른 총 상품금액 자동 계산 |
| **데이터 처리** | 제목/ISBN 중복 제거, 제외 키워드 필터링, 누락 데이터 검사, HTML 이스케이프 |

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
│                                               │ - API 도서    │          │
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
│      │ - 중복 없는 도서 수집 │                         │                 │
│      │ - 공통 2페이지 슬라이더│                         │                 │
│      └──────┬──────────────┘                         │                 │
│             │                                        │                 │
│      ┌──────▼──────┐                                 │                 │
│      │   core.js   │                                 │                 │
│      │ - API 호출   │────── fetch() ──────────────────┤                 │
│      │ - 공통 헬퍼  │                                 │                 │
│      │ - 데이터 필터│                                 │                 │
│      └─────────────┘                                 │                 │
│                                                                         │
│   도서 카드 / 일부 배너 클릭 ───────────────► `sub.html` 이동             │
└──────────────────────────────────────────────┬──────────────────────────┘
                                               │
                                               ▼
                         ┌────────────────────────────────────┐
                         │       Kakao REST API (외부)        │
                         │  GET /v3/search/book?query=...     │
                         │  documents[] + meta                │
                         └────────────────────────────────────┘
```

### 현재 페이지 연결 방식

메인 페이지에서 도서 카드나 일부 배너를 클릭하면 `sub.html`로 이동합니다.  
현재 코드는 클릭한 도서 객체를 `localStorage`나 URL 파라미터로 전달하지 않으며, `sub.html`의 기본 상품 정보는 **`2026 ADsP 데이터분석 준전문가` 도서 기준으로 고정**되어 있습니다.

메인 페이지의 API 로직은 `core.js`를 중심으로 모듈화되어 있고, 상세 페이지는 `sub.js` 안에서 **별도의 Kakao API 호출 로직**을 사용합니다.

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
   ├─ 고정 ADsP 상품 상세 정보 표시
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
          연관 도서 영역 렌더링
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
│   └── sub.js                 # 상세 페이지 전용 인터랙션 + API
│
├── img/
│   ├── ai/
│   ├── banner/
│   ├── casting/
│   ├── event_banner/
│   ├── footer/
│   ├── header/
│   ├── icon/
│   ├── main_slider/
│   ├── mini_slider/
│   ├── read_item/
│   ├── reference/
│   ├── speech/
│   └── sub_img/
│       ├── about_book/
│       ├── advertisement/
│       ├── cover/
│       ├── event_banner/
│       └── review_img/
│
├── sub_txt/
│   ├── sub.txt
│   ├── reviews.txt
│   └── Return Information.txt
│
└── .vscode/
    └── settings.json          # Live Server 포트 5501
```

> `sub_txt`의 텍스트 파일은 현재 런타임에서 직접 불러오는 데이터 파일이 아니라, 상세 페이지 제작에 사용된 참고 텍스트입니다. 화면에 표시되는 본문은 `sub.html`에 작성되어 있습니다.

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
| `sort` | `accuracy` 또는 `latest` |
| `page` | 추가 결과 탐색을 위한 페이지 번호 |

### 사용하는 주요 응답 필드

| 필드 | 사용 위치 |
| --- | --- |
| `title` | 도서명 |
| `thumbnail` | 표지 이미지 |
| `authors` | 저자명 |
| `contents` | 도서 소개 |
| `isbn` | 중복 제거 기준 |
| `price` / `sale_price` | 상세 도서 가격 표시 |

### 실제 호출 코드 — `js/core.js`

아래 코드는 **현재 `core.js`에서 발췌한 로직**이며, API 키 값만 보안을 위해 마스킹했습니다.

```js
const KAKAO_REST_API_KEY = "KakaoAK YOUR_REST_API_KEY";

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

## ⚙️ 핵심 구현 포인트

### 1. API 결과를 그대로 쓰지 않고 정제 후 사용

검색어가 달라도 동일한 도서가 반복해서 들어올 수 있기 때문에 **정규화한 제목과 ISBN을 각각 `Set`으로 관리**합니다. 제목이나 썸네일이 없는 데이터와 제외 대상 도서도 렌더링 전에 걸러냅니다.

```js
if (!book.thumbnail || !book.title) {
    continue;
}

if (isExcluded(book)) {
    continue;
}

const cleanTitle = book.title
    .replace(/\s+/g, "")
    .replace(/[^가-힣a-zA-Z0-9]/g, "")
    .toLowerCase();

const isbn = getISBN(book);

if (titleSet.has(cleanTitle)) {
    continue;
}

if (isbn && isbnSet.has(isbn)) {
    continue;
}

if (data.meta && data.meta.is_end) {
    break;
}
```

### 2. 여러 API 섹션을 동시에 초기화

메인 페이지 진입 시 여섯 개의 도서 섹션을 순차 호출하지 않고 `Promise.all()`로 함께 실행합니다.

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

### 3. 공통 카드와 슬라이더 로직 재사용

`book-components.js`에 반복되는 UI 로직을 분리해 여러 섹션에서 같은 구조를 다시 사용합니다.

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

### 4. API 문자열을 DOM에 넣기 전 이스케이프

API 응답값을 템플릿 문자열에 삽입하기 전에 `escapeHTML()`을 적용해 HTML 특수문자를 변환합니다.

```js
export function escapeHTML(value) {
    if (!value) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
```

### 5. 화면 크기 변화에 맞춰 슬라이더 상태 재계산

창 크기가 바뀌면 헤더 기준 위치와 여러 슬라이더 위치를 다시 계산합니다.

```js
window.addEventListener("resize", function () {
    recalcStickyStart();
    updateMainSlider();
    updateMini();
    moveKyoboOnlySlider();
});
```

---

## 🧩 정적 콘텐츠와 API 콘텐츠

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
| 상세 페이지 기본 상품 정보 | `sub.html` 고정 콘텐츠 |
| AI 연관 추천 / 이 분야 베스트 | Kakao API |
| 키워드 Pick / 저자 도서 / 이 분야 신간 | Kakao API |
| 리뷰 / 교환·반품 등 상세 본문 | `sub.html` 고정 콘텐츠 |

---

## 🛠️ 기술 스택

| 구분 | 기술 | 사용 목적 |
| --- | --- | --- |
| Markup | HTML5 | 메인·상세 페이지 구조 |
| Style | CSS3 | Flexbox, Grid, 반응형 레이아웃, 슬라이더 UI |
| Script | Vanilla JavaScript | DOM 조작, 이벤트, 비동기 처리 |
| Module | ES Module | 메인 페이지 기능별 JavaScript 분리 |
| API | Kakao REST API | 실제 도서 검색 데이터 호출 |
| Version Control | Git / GitHub | 프로젝트 관리 및 배포 |

---

## 🚀 로컬 실행 방법

별도의 npm 설치나 빌드 과정은 없습니다.

### VS Code Live Server

```text
1. 프로젝트 폴더를 VS Code로 열기
2. Live Server 확장 프로그램 설치
3. index.html 우클릭
4. Open with Live Server 실행
```

프로젝트의 `.vscode/settings.json`에는 Live Server 포트가 `5501`로 설정되어 있습니다.

```text
http://127.0.0.1:5501/index.html
```

### Python 로컬 서버

```bash
python -m http.server 5501
```

이후 브라우저에서 아래 주소로 접속합니다.

```text
http://localhost:5501/index.html
```

> `index.html`은 ES Module을 사용하므로 `file://`로 직접 실행하기보다 로컬 HTTP 서버에서 실행하는 편이 안전합니다.

---

## 🔐 API 키 주의

현재 압축본의 `js/core.js`와 `js/sub.js`에는 Kakao REST API 인증값이 프론트엔드 JavaScript에 직접 선언되어 있습니다.

```text
js/core.js
js/sub.js
```

두 파일이 각각 API를 호출하므로 키를 바꿀 때는 **두 위치를 함께 변경**해야 합니다.

> 공개 저장소에 실제 REST API 키가 올라간 상태라면 기존 키를 재발급 또는 폐기하는 것이 안전합니다. 정적 프론트엔드에서는 브라우저에 포함된 값을 완전히 숨길 수 없으므로, 실제 서비스에서는 백엔드 또는 프록시를 통한 API 호출 구조가 적합합니다.

---

## 📈 기술적 성장 포인트

| 주제 | 실제 구현을 통해 다룬 내용 |
| --- | --- |
| **비동기 처리** | `async/await` 기반 API 호출과 `Promise.all()`을 이용한 여러 섹션 동시 로딩 |
| **모듈 설계** | `core → book-components → sections → init`으로 API·컴포넌트·화면 로직 역할 분리 |
| **데이터 정제** | 제목 정규화와 ISBN을 함께 사용해 API 검색 결과 중복 제거 |
| **방어 코딩** | 제목·썸네일 누락 검사, 제외 키워드 필터, API 페이지 종료 여부(`meta.is_end`) 확인 |
| **재사용 구조** | `createStandardBook()`, `setupTwoPageSlider()`로 반복되는 카드·슬라이더 로직 공통화 |
| **보안 처리** | API 응답을 DOM에 삽입하기 전 `escapeHTML()` 적용 |
| **반응형 인터랙션** | `resize` 이벤트에 맞춰 헤더 기준점과 슬라이더 위치·상태 재계산 |
| **페이지별 역할 분리** | 메인은 API/레이아웃을 ES Module로 나누고, 상세 페이지는 `sub.js`에 전용 인터랙션 구성 |

---

## 🔗 참고

- Kakao Developers — 도서 검색 API
- 교보문고 UI를 참고해 학습 목적으로 제작한 클론 프로젝트입니다.
