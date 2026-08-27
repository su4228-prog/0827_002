/* sub.html 인라인 <script> 분리본 (원본 내용 그대로 이동) */

/* ==================================================
   STICKY HEADER (스크롤 시 헤더 상단 고정)
================================================== */
const headerTop=document.querySelector("#headerTop");
const headerShell=document.querySelector("#headerShell");
let stickyStart=headerShell.offsetTop;
function stickyCheck(){headerTop.classList.toggle("fixed",window.scrollY>=stickyStart)}
window.addEventListener("scroll",stickyCheck);
window.addEventListener("resize",()=>{stickyStart=headerShell.offsetTop;updateGallery();});

/* ==================================================
   IMAGE GALLERY SLIDER (표지 이미지 슬라이더 + 드래그/터치 이동)
================================================== */
const stage=document.querySelector("#galleryStage");
const track=document.querySelector("#galleryTrack");
const prev=document.querySelector("#galleryPrev");
const next=document.querySelector("#galleryNext");
const dots=[...document.querySelectorAll(".gallery-dot")];
let index=0, dragging=false, startX=0, startTranslate=0, distance=0, wasDragged=false;
function updateGallery(){
  track.style.transform=`translateX(-${index*stage.offsetWidth}px)`;
  dots.forEach((d,i)=>d.classList.toggle("active",i===index));
}
function goNext(){index=Math.min(2,index+1);updateGallery()}
function goPrev(){index=Math.max(0,index-1);updateGallery()}
prev.addEventListener("click",goPrev);
next.addEventListener("click",goNext);
function dragStart(x){dragging=true;wasDragged=false;startX=x;distance=0;startTranslate=-(index*stage.offsetWidth);stage.classList.add("dragging")}
function dragMove(x){
  if(!dragging)return;
  distance=x-startX;
  if(Math.abs(distance)>5)wasDragged=true;
  let move=startTranslate+distance;
  if(index===0&&distance>0)move=startTranslate+distance*.25;
  if(index===2&&distance<0)move=startTranslate+distance*.25;
  track.style.transform=`translateX(${move}px)`;
}
function dragEnd(){
  if(!dragging)return;
  const threshold=stage.offsetWidth*.16;
  if(distance<-threshold)goNext();
  else if(distance>threshold)goPrev();
  else updateGallery();
  dragging=false;stage.classList.remove("dragging");
}
stage.addEventListener("mousedown",e=>{e.preventDefault();dragStart(e.clientX)});
window.addEventListener("mousemove",e=>dragMove(e.clientX));
window.addEventListener("mouseup",dragEnd);
stage.addEventListener("touchstart",e=>dragStart(e.touches[0].clientX),{passive:true});
stage.addEventListener("touchmove",e=>dragMove(e.touches[0].clientX),{passive:true});
stage.addEventListener("touchend",dragEnd);
stage.addEventListener("click",e=>{if(wasDragged)e.preventDefault()});
updateGallery();


// ==================================================
// KAKAO BOOK API
// - core.js에도 동일한 패턴(카카오 도서 검색 + 성인/제외 키워드 필터링)이 있지만,
//   sub.html은 자체적으로 독립된 복사본을 사용한다(index.html과 별도 실행 컨텍스트).
// ==================================================
const KAKAO_REST_API_KEY = "KakaoAK bf7054bf05a129268000771257df9708";

function escapeHTML(value){
  if(!value) return "";
  return String(value)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

function getBookAuthor(book){
  return book.authors && book.authors.length
    ? book.authors.join(", ")
    : "저자 정보 없음";
}

function getBookPrice(book){
  const sale = Number(book.sale_price);
  const regular = Number(book.price);
  const price = sale > 0 ? sale : regular;
  return price > 0 ? price : 0;
}

function getBookDiscount(book){
  const sale = Number(book.sale_price);
  const regular = Number(book.price);

  if(sale > 0 && regular > 0 && sale < regular){
    return Math.round((1 - sale / regular) * 100);
  }

  return 0;
}

const SUB_RESTRICTED_WORDS_B64 =
  "WyIxOeq4iCIsIjE57IS4Iiwi7ISx7J2466y8Iiwi7ISx7J2466eM7ZmUIiwi7ISx7J247IaM7ISkIiwi7JW87ISkIiwi7JeQ66GcIiwi7JeQ66Gc7YuxIiwi7Y+s66W064W4Iiwi7IS57IqkIiwi7ISx7JWgIl0=";

const SUB_EXCLUDE_WORDS = JSON.parse(atob(SUB_RESTRICTED_WORDS_B64));

function isSubExcluded(book){
  const target = ((book.title || "") + " " + (book.contents || "")).toLowerCase();

  return SUB_EXCLUDE_WORDS.some(word =>
    target.includes(word.toLowerCase())
  );
}

async function fetchSubBooks(query, page=1){
  const params = new URLSearchParams({
    query: query,
    size: 30,
    sort: "accuracy",
    page: page
  });

  const response = await fetch(
    "https://dapi.kakao.com/v3/search/book?" + params,
    {
      headers:{
        Authorization: KAKAO_REST_API_KEY
      }
    }
  );

  if(!response.ok){
    throw new Error("카카오 도서 API 오류: " + response.status);
  }

  return response.json();
}

async function collectSubBooks(queries, count){
  const result = [];
  const titleSet = new Set();
  const isbnSet = new Set();

  for(const query of queries){
    for(let page=1; page<=2; page++){
      if(result.length >= count) return result;

      const data = await fetchSubBooks(query, page);

      for(const book of data.documents){
        if(result.length >= count) return result;

        if(!book.title || !book.thumbnail) continue;
        if(isSubExcluded(book)) continue;

        const cleanTitle = book.title
          .replace(/\s+/g,"")
          .replace(/[^가-힣a-zA-Z0-9]/g,"")
          .toLowerCase();

        const isbn = (book.isbn || "")
          .split(" ")
          .filter(Boolean)
          .pop() || "";

        if(!cleanTitle || titleSet.has(cleanTitle)) continue;
        if(isbn && isbnSet.has(isbn)) continue;

        titleSet.add(cleanTitle);
        if(isbn) isbnSet.add(isbn);

        result.push(book);
      }

      if(data.meta && data.meta.is_end) break;
    }
  }

  return result;
}

// ==================================================
// BOOK CARD RENDERERS (API 도서 데이터를 HTML 카드로 변환)
// ==================================================
function createRelatedBook(book){
  const price = getBookPrice(book);

  return `
    <article class="api-book-card">
      <a href="#">
        <div class="api-book-cover">
          <img
            src="${escapeHTML(book.thumbnail)}"
            alt="${escapeHTML(book.title)}"
          >
        </div>

        <p class="api-book-type">국내도서</p>

        <h3 class="api-book-title">
          ${escapeHTML(book.title)}
        </h3>

        <p class="api-book-author">
          ${escapeHTML(getBookAuthor(book))}
        </p>

        <p class="api-book-price">
          ${price ? price.toLocaleString() + "원" : "가격정보 없음"}
        </p>
      </a>
    </article>
  `;
}

function createBestBook(book, index){
  const price = getBookPrice(book);
  const discount = getBookDiscount(book);

  return `
    <article class="best-item">
      <a href="#" class="best-item-cover">
        <img
          src="${escapeHTML(book.thumbnail)}"
          alt="${escapeHTML(book.title)}"
        >
      </a>

      <div class="best-item-info">
        <span class="best-rank">${index + 1}</span>
        <span class="best-category">국내도서</span>

        <a href="#">
          <h3 class="best-title">
            ${escapeHTML(book.title)}
          </h3>
        </a>

        <p class="best-author">
          ${escapeHTML(getBookAuthor(book))}
        </p>

        <div class="best-price-row">
          ${discount ? `<span class="best-discount">${discount}%</span>` : ""}
          <strong class="best-price">
            ${price ? price.toLocaleString() + "원" : "가격정보 없음"}
          </strong>
        </div>

        <p class="best-delivery">무료배송</p>
      </div>
    </article>
  `;
}

// AI 연관 추천(#relatedBooks) / 이 분야의 베스트(#bestBooks) 데이터 로딩
async function loadSubBookSections(){
  const relatedEl = document.querySelector("#relatedBooks");
  const bestEl = document.querySelector("#bestBooks");

  try{
    const books = await collectSubBooks(
      [
        "IT 자격증",
        "컴퓨터 IT",
        "정보처리",
        "데이터 분석",
        "빅데이터",
        "데이터 사이언스",
        "데이터베이스",
        "SQL",
        "파이썬 데이터 분석",
        "통계 데이터 분석",
        "인공지능",
        "머신러닝",
        "클라우드 자격증",
        "네트워크 자격증",
        "보안 자격증",
        "컴퓨터활용",
        "프로그래밍 자격증"
      ],
      20
    );

    const related = books.slice(0,5);
    const best = books.slice(5,10);

    relatedEl.innerHTML = related.length
      ? related.map(createRelatedBook).join("")
      : `<div class="api-loading">연관 도서를 찾지 못했습니다.</div>`;

    bestEl.innerHTML = best.length
      ? best.map(createBestBook).join("")
      : `<div class="api-loading">베스트 도서를 찾지 못했습니다.</div>`;

  }catch(error){
    console.error(error);

    relatedEl.innerHTML = `
      <div class="api-loading">
        도서 정보를 불러오지 못했습니다. API 키를 확인해주세요.
      </div>
    `;

    bestEl.innerHTML = `
      <div class="api-loading">
        도서 정보를 불러오지 못했습니다.
      </div>
    `;
  }
}

loadSubBookSections();


// ==================================================
// 광고 배너 슬라이더
// ==================================================
const adTrack = document.querySelector("#adTrack");
const adPrev = document.querySelector("#adPrev");
const adNext = document.querySelector("#adNext");
const adProgressBar = document.querySelector("#adProgressBar");

let adIndex = 0;
let adTimer = null;
const adTotal = 5;

function updateAdSlider(){
  adTrack.style.transform = `translateX(-${adIndex * 100}%)`;
  adProgressBar.style.transform = `translateX(${adIndex * 100}%)`;
}

function nextAd(){
  adIndex = (adIndex + 1) % adTotal;
  updateAdSlider();
}

function prevAd(){
  adIndex = (adIndex - 1 + adTotal) % adTotal;
  updateAdSlider();
}

function startAdAuto(){
  clearInterval(adTimer);
  adTimer = setInterval(nextAd, 4000);
}

adNext.addEventListener("click",()=>{
  nextAd();
  startAdAuto();
});

adPrev.addEventListener("click",()=>{
  prevAd();
  startAdAuto();
});

updateAdSlider();
startAdAuto();



// ==================================================
// SINGLE API KEY
// 이 한 줄에만 키를 입력하면 아래 모든 API 도서 영역에 공통 적용됩니다.
// ==================================================
// 기존 페이지의 KAKAO_REST_API_KEY 선언을 그대로 사용합니다.
// 

// ==================================================
// 하위 도서정보 영역(키워드 Pick / 저자 도서 / 이 분야 신간) 카드 렌더러 + 로딩
// ==================================================
function makeHorizontalBook(book){
  const price = getBookPrice(book);

  return `
    <article class="horizontal-book">
      <a href="#">
        <div class="horizontal-cover">
          <img src="${escapeHTML(book.thumbnail)}" alt="${escapeHTML(book.title)}">
        </div>
        <p class="horizontal-type">국내도서</p>
        <h3 class="horizontal-title">${escapeHTML(book.title)}</h3>
        <p class="horizontal-author">${escapeHTML(getBookAuthor(book))}</p>
        <p class="horizontal-price">${price ? price.toLocaleString()+"원" : "가격정보 없음"}</p>
      </a>
    </article>
  `;
}

function makeSideBook(book){
  const price = getBookPrice(book);
  const discount = getBookDiscount(book);

  return `
    <article class="side-book">
      <a href="#" class="side-book-cover">
        <img src="${escapeHTML(book.thumbnail)}" alt="${escapeHTML(book.title)}">
      </a>
      <div>
        <p class="side-book-type">국내도서</p>
        <a href="#"><h3 class="side-book-title">${escapeHTML(book.title)}</h3></a>
        <p class="side-book-author">${escapeHTML(getBookAuthor(book))}</p>
        <p class="side-book-price">
          ${discount ? `<span class="discount">${discount}%</span>` : ""}
          ${price ? price.toLocaleString()+"원" : "가격정보 없음"}
        </p>
      </div>
    </article>
  `;
}

async function loadDeepApiBooks(){
  const keywordEl = document.querySelector("#keywordApiBooks");
  const authorEl = document.querySelector("#authorApiBooks");
  const newEl = document.querySelector("#newApiBooks");

  try{
    const related = await collectSubBooks(
      [
        "ADsP",
        "IT 자격증",
        "빅데이터",
        "데이터 분석",
        "SQL",
        "데이터베이스",
        "정보처리",
        "파이썬 데이터 분석"
      ],
      18
    );

    const keywordBooks = related
      .filter(book => book.thumbnail && book.title)
      .slice(0,5);

    keywordEl.innerHTML =
      keywordBooks.length
        ? keywordBooks.map(makeHorizontalBook).join("")
        : `<div class="api-loading" style="grid-column:1/-1;">
             키워드 Pick 도서를 찾지 못했습니다.
           </div>`;

    const authorBooks = await collectSubBooks(
      [
        "윤종식",
        "데이터분석 전문가",
        "빅데이터분석기사",
        "ADP 데이터분석"
      ],
      5
    );
    authorEl.innerHTML = authorBooks.slice(0,5).map(makeHorizontalBook).join("");

    const newest = await collectSubBooks(
      [
        "빅데이터",
        "데이터 분석",
        "통계",
        "R 데이터 분석",
        "데이터 사이언스",
        "IT 자격증"
      ],
      7
    );
    newEl.innerHTML = newest.slice(0,5).map(makeSideBook).join("");

  }catch(err){
    console.error(err);
    keywordEl.innerHTML += `<div class="api-loading">관련 도서를 불러오지 못했습니다.</div>`;
    authorEl.innerHTML = `<div class="api-loading">관련 도서를 불러오지 못했습니다.</div>`;
    newEl.innerHTML = `<div class="api-loading">신간 도서를 불러오지 못했습니다.</div>`;
  }
}

loadDeepApiBooks();

// ==================================================
// COLLAPSIBLE SECTIONS (상세이미지 / 책소개 / 작가정보 / 출판사리뷰 / 목차 펼치기·접기)
// ==================================================

// 상세이미지 펼치기 / 접기
const detailImageToggle =
  document.querySelector("#detailImageToggle");

const detailImageCollapse =
  document.querySelector("#detailImageCollapse");

function setDetailImageClosedHeight(){
  if(!detailImageCollapse) return;
  if(!detailImageCollapse.classList.contains("open")){
    detailImageCollapse.style.height = "720px";
  }
}

if(detailImageToggle && detailImageCollapse){

  const detailImage =
    detailImageCollapse.querySelector("img");

  if(detailImage){
    detailImage.addEventListener("load", setDetailImageClosedHeight);
  }

  detailImageToggle.addEventListener(
    "click",
    function(){

      const willOpen =
        !detailImageCollapse.classList.contains("open");

      if(willOpen){

        detailImageCollapse.classList.add("open");

        detailImageCollapse.style.height =
          detailImageCollapse.scrollHeight + "px";

        detailImageToggle.textContent =
          "접기⌃";

      }else{

        /*
          현재 전체 높이에서 720px로 자연스럽게 접기
        */
        detailImageCollapse.style.height =
          detailImageCollapse.scrollHeight + "px";

        requestAnimationFrame(function(){

          detailImageCollapse.classList.remove("open");

          detailImageCollapse.style.height =
            "720px";

        });

        detailImageToggle.textContent =
          "펼치기⌄";

      }

    }
  );

}



function setupCollapse(buttonId, contentId, closedHeight){

  const button =
    document.querySelector("#" + buttonId);

  const content =
    document.querySelector("#" + contentId);

  if(!button || !content){
    return;
  }

  content.style.height =
    closedHeight + "px";

  button.addEventListener(
    "click",
    function(){

      const opening =
        !content.classList.contains("open");

      if(opening){

        content.classList.add("open");

        content.style.height =
          content.scrollHeight + "px";

        button.textContent =
          "접기⌃";

      }else{

        content.style.height =
          content.scrollHeight + "px";

        requestAnimationFrame(function(){

          content.classList.remove("open");

          content.style.height =
            closedHeight + "px";

        });

        button.textContent =
          "펼치기⌄";

      }

    }
  );

}

setupCollapse(
  "bookIntroToggle",
  "bookIntroCollapse",
  210
);

setupCollapse(
  "authorToggle",
  "authorCollapse",
  82
);

setupCollapse(
  "publisherToggle",
  "publisherCollapse",
  260
);


// TOC 펼치기
const tocToggle = document.querySelector("#tocToggle");
const tocContent = document.querySelector("#tocContent");
if(tocToggle && tocContent){
  tocToggle.addEventListener("click",()=>{
    const open = tocContent.classList.toggle("open");
    tocToggle.textContent = open ? "접기⌃" : "펼치기⌄";
  });
}


// ==================================================
// DEEP-SECTION SCROLL-SPY NAV (2차 도서정보 탭)
// 처음에는 아예 보이지 않다가,
// AI 연관 추천 영역을 지나 도서정보 본문에 도달하면
// 1차 탭 바로 아래에 붙어서 나타난다.
// ==================================================
const deepChipNav =
  document.querySelector("#deepChipNav");

const deepBookInfo =
  document.querySelector("#deep-book-info");

function updateDeepChipNav(){

  if(!deepChipNav || !deepBookInfo){
    return;
  }

  /*
    1차 탭 아래(top 134px)에
    도서정보 본문 시작점이 닿을 때부터 표시
  */
  const triggerPoint =
    deepBookInfo.getBoundingClientRect().top;

  const shouldShow =
    triggerPoint <= 182;

  deepChipNav.classList.toggle(
    "visible",
    shouldShow
  );

}

window.addEventListener(
  "scroll",
  updateDeepChipNav
);

window.addEventListener(
  "resize",
  updateDeepChipNav
);

updateDeepChipNav();


// 상단 이벤트 / 도서정보 / 리뷰 / 교환반품 탭 스크롤
document.querySelectorAll(".detail-nav a").forEach(link=>{

  link.addEventListener("click", function(e){

    const selector =
      link.getAttribute("href");

    const target =
      document.querySelector(selector);

    if(target){

      e.preventDefault();

      target.scrollIntoView({
        behavior:"smooth",
        block:"start"
      });

    }

  });

});


// deep chip scroll
document.querySelectorAll(".deep-chip-nav a").forEach(link=>{

  link.addEventListener("click", e=>{

    const target =
      document.querySelector(
        link.getAttribute("href")
      );

    if(target){

      e.preventDefault();

      document
        .querySelectorAll(".deep-chip-nav a")
        .forEach(item =>
          item.classList.remove("active")
        );

      link.classList.add("active");

      target.scrollIntoView({
        behavior:"smooth",
        block:"start"
      });

    }

  });

});



// ==================================================
// REVIEW LIGHTBOX (리뷰 이미지 클릭 시 확대해서 보여주는 라이트박스)
// ==================================================
const reviewLightbox =
  document.querySelector("#reviewLightbox");

const reviewLightboxImage =
  document.querySelector("#reviewLightboxImage");

const reviewLightboxClose =
  document.querySelector("#reviewLightboxClose");

document
  .querySelectorAll(".review-gallery img")
  .forEach(function(img){

    img.addEventListener(
      "click",
      function(){

        reviewLightboxImage.src =
          img.src;

        reviewLightbox.classList.add(
          "open"
        );

      }
    );

  });

if(reviewLightboxClose){

  reviewLightboxClose.addEventListener(
    "click",
    function(){

      reviewLightbox.classList.remove(
        "open"
      );

    }
  );

}

if(reviewLightbox){

  reviewLightbox.addEventListener(
    "click",
    function(event){

      if(
        event.target ===
        reviewLightbox
      ){

        reviewLightbox.classList.remove(
          "open"
        );

      }

    }
  );

}


// ==================================================
// QUANTITY STEPPER (하단 구매 바 수량 증감 + 총 금액 계산)
// ==================================================
let q=1;const qEl=document.querySelector("#qty");const total=document.querySelector(".total-price");
function updateQty(){qEl.textContent=q;total.textContent=(27900*q).toLocaleString()+"원"}
document.querySelector("#plus").addEventListener("click",()=>{q++;updateQty()});
document.querySelector("#minus").addEventListener("click",()=>{q=Math.max(1,q-1);updateQty()});
