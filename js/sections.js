/* ==================================================
   CONTENT SECTIONS
   - 페이지의 실제 콘텐츠 영역들을 각각 렌더링
   - 순서대로: 투데이초이스 / MD / 출판사 / 트렌드 /
     읽는아이템 / AI픽 / 베스트 / 교보온리 / 캐스팅 / 이벤트배너
   ※ init.js가 이 파일의 함수들을 호출하므로 init.js보다 먼저 로드
================================================== */

import {
    fetchKakaoBooks,
    escapeHTML,
    getAuthor,
    getDescription,
    getISBN,
    isExcluded
} from "./core.js";

import {
    collectUniqueBooks,
    createStandardBook,
    setupTwoPageSlider
} from "./book-components.js";

/* ==================================================
   TODAY CHOICE
================================================== */

const mainBookSlider =
    document.querySelector(
        "#mainBookSlider"
    );

const mainBookCurrent =
    document.querySelector(
        "#mainBookCurrent"
    );

const mainBookNext =
    document.querySelector(
        "#mainBookNext"
    );

const choiceSmallTrack =
    document.querySelector(
        "#choiceSmallTrack"
    );

const choicePrev =
    document.querySelector(
        "#choicePrev"
    );

const choiceNext =
    document.querySelector(
        "#choiceNext"
    );


let choiceBooks =
    [];

let choiceIndex =
    0;

let choiceAnimating =
    false;


function choiceBookIndex(
    offset
) {

    return (

        choiceIndex +
        offset +
        choiceBooks.length

    )
    %
    choiceBooks.length;

}


function createChoiceMain(
    book
) {

    return `

        <div class="main-book-cover">

            <a href="#">

                <img
                    src="${escapeHTML(
                        book.thumbnail
                    )}"
                    alt="${escapeHTML(
                        book.title
                    )}"
                >

            </a>

        </div>


        <div class="choice-main-info">

            <h3 class="choice-main-title">

                ${escapeHTML(
                    book.title
                )}

            </h3>


            <p class="choice-main-author">

                ${escapeHTML(
                    getAuthor(
                        book
                    )
                )}

            </p>


            <p class="choice-main-description">

                ${escapeHTML(
                    getDescription(
                        book
                    )
                )}

            </p>


            <p class="choice-main-publisher">

                ${escapeHTML(
                    book.publisher ||
                    ""
                )}

            </p>

        </div>

    `;

}


function renderChoiceMain() {

    mainBookCurrent.innerHTML =
        createChoiceMain(

            choiceBooks[
                choiceIndex
            ]

        );


    mainBookNext.innerHTML =
        "";

}


function renderChoiceSmall() {

    let html =
        "";


    for (
        let i = 1;
        i <= 4;
        i++
    ) {

        const index =
            choiceBookIndex(
                i
            );


        const book =
            choiceBooks[
                index
            ];


        html += `

            <div
                class="choice-small-book"
                data-order="${i}"
            >

                <a href="#">

                    <div class="choice-small-cover">

                        <img
                            src="${escapeHTML(book.thumbnail)}"
                            alt="${escapeHTML(book.title)}"
                        >

                    </div>


                    <p class="choice-small-title">

                        ${escapeHTML(
                            book.title
                        )}

                    </p>

                </a>

            </div>

        `;

    }


    choiceSmallTrack.innerHTML =
        html;


    const first =
        choiceSmallTrack.querySelector(
            ".choice-small-book"
        );


    if (
        first
    ) {

        first.addEventListener(
            "click",
            function (
                event
            ) {

                event.preventDefault();

                nextChoice();

            }
        );

    }

}


function getChoiceMove() {

    const first =
        choiceSmallTrack.querySelector(
            ".choice-small-book"
        );


    if (
        !first
    ) {

        return 0;

    }


    const gap =
        parseFloat(

            getComputedStyle(
                choiceSmallTrack
            ).gap

        )
        ||
        0;


    return (
        first.getBoundingClientRect().width
        +
        gap
    );

}


function nextChoice() {

    if (
        choiceAnimating ||
        choiceBooks.length === 0
    ) {

        return;

    }


    choiceAnimating =
        true;


    const nextIndex =
        choiceBookIndex(
            1
        );


    const book =
        choiceBooks[
            nextIndex
        ];


    mainBookNext.innerHTML =
        createChoiceMain(
            book
        );


    choiceSmallTrack.style.transform =
        `translateX(-${getChoiceMove()}px)`;


    requestAnimationFrame(
        function () {

            mainBookSlider.classList.add(
                "slide-next"
            );

        }
    );


    setTimeout(
        function () {

            choiceIndex =
                nextIndex;


            mainBookCurrent.style.transition =
                "none";

            mainBookNext.style.transition =
                "none";


            mainBookCurrent.innerHTML =
                createChoiceMain(
                    book
                );


            mainBookCurrent.style.transform =
                "translateX(0)";


            mainBookNext.innerHTML =
                "";


            mainBookNext.style.transform =
                "translateX(100%)";


            mainBookSlider.classList.remove(
                "slide-next"
            );


            choiceSmallTrack.classList.add(
                "no-transition"
            );


            renderChoiceSmall();


            choiceSmallTrack.style.transform =
                "translateX(0)";


            requestAnimationFrame(
                function () {

                    requestAnimationFrame(
                        function () {

                            mainBookCurrent.style.transition =
                                "";

                            mainBookNext.style.transition =
                                "";

                            choiceSmallTrack.classList.remove(
                                "no-transition"
                            );


                            choiceAnimating =
                                false;

                        }
                    );

                }
            );

        },

        540
    );

}


function prevChoice() {

    if (
        choiceAnimating ||
        choiceBooks.length === 0
    ) {

        return;

    }


    choiceAnimating =
        true;


    const previous =
        (
            choiceIndex -
            1 +
            choiceBooks.length
        )
        %
        choiceBooks.length;


    const book =
        choiceBooks[
            previous
        ];


    mainBookNext.innerHTML =
        createChoiceMain(
            book
        );


    mainBookSlider.classList.add(
        "prepare-prev"
    );


    choiceIndex =
        previous;


    choiceSmallTrack.classList.add(
        "no-transition"
    );


    renderChoiceSmall();


    choiceSmallTrack.style.transform =
        `translateX(-${getChoiceMove()}px)`;


    choiceSmallTrack.offsetHeight;

    mainBookSlider.offsetHeight;


    choiceSmallTrack.classList.remove(
        "no-transition"
    );


    requestAnimationFrame(
        function () {

            choiceSmallTrack.style.transform =
                "translateX(0)";


            mainBookSlider.classList.remove(
                "prepare-prev"
            );


            mainBookSlider.offsetHeight;


            mainBookSlider.classList.add(
                "slide-prev"
            );

        }
    );


    setTimeout(
        function () {

            mainBookCurrent.style.transition =
                "none";

            mainBookNext.style.transition =
                "none";


            mainBookCurrent.innerHTML =
                createChoiceMain(
                    book
                );


            mainBookCurrent.style.transform =
                "translateX(0)";


            mainBookNext.innerHTML =
                "";


            mainBookNext.style.transform =
                "translateX(100%)";


            mainBookSlider.classList.remove(
                "slide-prev"
            );


            requestAnimationFrame(
                function () {

                    requestAnimationFrame(
                        function () {

                            mainBookCurrent.style.transition =
                                "";

                            mainBookNext.style.transition =
                                "";

                            choiceAnimating =
                                false;

                        }
                    );

                }
            );

        },

        540
    );

}


choiceNext.addEventListener(
    "click",
    nextChoice
);


choicePrev.addEventListener(
    "click",
    prevChoice
);


export async function loadChoice() {

    choiceBooks =
        await collectUniqueBooks(

            [
                "소설",
                "문학",
                "에세이"
            ],

            6

        );


    if (
        choiceBooks.length >=
        4
    ) {

        renderChoiceMain();

        renderChoiceSmall();

    }

}





/* ==================================================
   MD
================================================== */

const mdTrack =
    document.querySelector(
        "#mdTrack"
    );

const mdPage1 =
    document.querySelector(
        "#mdPage1"
    );

const mdPage2 =
    document.querySelector(
        "#mdPage2"
    );

const mdPrev =
    document.querySelector(
        "#mdPrev"
    );

const mdNext =
    document.querySelector(
        "#mdNext"
    );


export async function loadMD() {

    const books =
        await collectUniqueBooks(

            [
                "소설",
                "에세이",
                "인문",
                "경제경영"
            ],

            12

        );


    mdPage1.innerHTML =
        books
            .slice(
                0,
                6
            )
            .map(
                createStandardBook
            )
            .join("");


    mdPage2.innerHTML =
        books
            .slice(
                6,
                12
            )
            .map(
                createStandardBook
            )
            .join("");


    setupTwoPageSlider(

        mdTrack,

        mdPrev,

        mdNext

    );

}





/* ==================================================
   PUBLISHER 6권
================================================== */

const publisherBooks =
    document.querySelector(
        "#publisherBooks"
    );


export async function loadPublisherBooks() {

    let books =
        await collectUniqueBooks(

            [
                "문학",
                "소설",
                "에세이",
                "인문",
                "과학",
                "역사",
                "경제",
                "사회",
                "예술"
            ],

            6,

            "latest"

        );


    /*
        latest에서 부족하면
        accuracy로 추가 검색
    */

    if (
        books.length <
        6
    ) {

        books =
            await collectUniqueBooks(

                [
                    "문학",
                    "소설",
                    "에세이",
                    "인문",
                    "과학",
                    "역사",
                    "경제경영",
                    "사회",
                    "철학",
                    "예술"
                ],

                6,

                "accuracy"

            );

    }


    publisherBooks.innerHTML =
        books

            .slice(
                0,
                6
            )

            .map(
                createStandardBook
            )

            .join("");

}





/* ==================================================
   TREND 12권
================================================== */

const trendTrack =
    document.querySelector(
        "#trendTrack"
    );

const trendPage1 =
    document.querySelector(
        "#trendPage1"
    );

const trendPage2 =
    document.querySelector(
        "#trendPage2"
    );

const trendPrev =
    document.querySelector(
        "#trendPrev"
    );

const trendNext =
    document.querySelector(
        "#trendNext"
    );


export async function loadTrendBooks() {

    const books =
        await collectUniqueBooks(

            [
                "심리",
                "과학",
                "사회",
                "인문",
                "문화",
                "철학",
                "트렌드",
                "경제"
            ],

            12

        );


    trendPage1.innerHTML =
        books
            .slice(
                0,
                6
            )
            .map(
                createStandardBook
            )
            .join("");


    trendPage2.innerHTML =
        books
            .slice(
                6,
                12
            )
            .map(
                createStandardBook
            )
            .join("");


    setupTwoPageSlider(

        trendTrack,

        trendPrev,

        trendNext

    );

}








/* ==================================================
   READ ITEM SLIDER
   - 로컬 이미지 6개만 사용
   - 한 번 클릭할 때 상품 1개씩 이동
   - 마지막까지 가도 계속 순환
================================================== */

const readItemTrack =
    document.querySelector("#readItemTrack");

const readItemPrev =
    document.querySelector("#readItemPrev");

const readItemNext =
    document.querySelector("#readItemNext");


let readItemProducts = [

    {
        image: "./img/read_item/01.jpg",
        name: "노르잇 투명독서대 높이조절 PR01A"
    },

    {
        image: "./img/read_item/06.jpg",
        name: "프린텍 무선 노잉크 휴대용 프린터 PWP-300D"
    },

    {
        image: "./img/read_item/03.jpg",
        name: "[교보단독] 이상한 나라의 앨리스 에디션 만년필"
    },

    {
        image: "./img/read_item/04.jpg",
        name: "[UNI] 유니볼 제트 3색 시그니처(0.38)"
    },

    {
        image: "./img/read_item/05.jpg",
        name: "[로이텀] 불렛저널 미디엄 노트 퍼플"
    },

    {
        image: "./img/read_item/02.jpg",
        name: "[1+1] 스테들러 삼각 형광라이너 20색/하늘색"
    }

];


let readItemAnimating = false;
let readItemIndex = 0;


function createReadItemCard(product) {

    return `

        <article class="read-item-card">

            <a href="#">

                <div class="read-item-image">

                    <img
                        src="${product.image}"
                        alt="${product.name}"
                    >

                </div>

                <h3 class="read-item-name">
                    ${product.name}
                </h3>

            </a>

        </article>

    `;

}


function renderReadItems() {

    readItemTrack.innerHTML =
        readItemProducts
            .map(createReadItemCard)
            .join("");

}


function getReadItemMoveDistance() {

    const card =
        readItemTrack.querySelector(
            ".read-item-card"
        );


    if (!card) {
        return 0;
    }


    const gap =
        parseFloat(
            getComputedStyle(
                readItemTrack
            ).gap
        ) || 0;


    return (
        card.getBoundingClientRect().width
        +
        gap
    );

}


function getReadItemVisibleCount() {

    const slider =
        document.querySelector(
            ".read-item-slider"
        );

    const card =
        readItemTrack.querySelector(
            ".read-item-card"
        );


    if (!slider || !card) {
        return 6;
    }


    const gap =
        parseFloat(
            getComputedStyle(
                readItemTrack
            ).gap
        ) || 0;

    const cardWidth =
        card.getBoundingClientRect().width;

    const sliderWidth =
        slider.getBoundingClientRect().width;


    return Math.max(
        1,
        Math.floor(
            (sliderWidth + gap)
            /
            (cardWidth + gap)
        )
    );

}


function getReadItemMaxIndex() {

    return Math.max(
        0,
        readItemProducts.length
        -
        getReadItemVisibleCount()
    );

}


function updateReadItemButtons() {

    const maxIndex =
        getReadItemMaxIndex();


    readItemPrev.classList.toggle(
        "disabled",
        readItemIndex <= 0
    );


    readItemNext.classList.toggle(
        "disabled",
        readItemIndex >= maxIndex
    );


    readItemPrev.setAttribute(
        "aria-disabled",
        readItemIndex <= 0 ? "true" : "false"
    );

    readItemNext.setAttribute(
        "aria-disabled",
        readItemIndex >= maxIndex ? "true" : "false"
    );

}


function moveReadItemSlider() {

    const distance =
        getReadItemMoveDistance();


    readItemTrack.style.transform =
        `translateX(-${readItemIndex * distance}px)`;


    updateReadItemButtons();

}


/*
    창 크기 변경 시 읽는 아이템 슬라이더 인덱스를 재보정.
    - 예전엔 init.js가 readItemIndex를 직접 재할당했지만,
      모듈 방식에서는 외부에서 값을 재할당할 수 없어
      이 함수를 통해서만 갱신하도록 함
*/
export function clampReadItemIndex() {

    const maxIndex =
        getReadItemMaxIndex();

    readItemIndex =
        Math.min(
            readItemIndex,
            maxIndex
        );

    moveReadItemSlider();

}


function readItemNextSlide() {

    if (readItemAnimating) {
        return;
    }


    const maxIndex =
        getReadItemMaxIndex();


    /* 마지막 상품이 이미 보이면 더 이상 넘어가지 않음 */
    if (readItemIndex >= maxIndex) {
        updateReadItemButtons();
        return;
    }


    readItemAnimating = true;
    readItemIndex++;

    moveReadItemSlider();


    setTimeout(
        function () {
            readItemAnimating = false;
        },
        500
    );

}


function readItemPrevSlide() {

    if (readItemAnimating) {
        return;
    }


    if (readItemIndex <= 0) {
        updateReadItemButtons();
        return;
    }


    readItemAnimating = true;
    readItemIndex--;

    moveReadItemSlider();


    setTimeout(
        function () {
            readItemAnimating = false;
        },
        500
    );

}


readItemNext.addEventListener(
    "click",
    function (event) {
        event.preventDefault();
        readItemNextSlide();
    }
);


readItemPrev.addEventListener(
    "click",
    function (event) {
        event.preventDefault();
        readItemPrevSlide();
    }
);


renderReadItems();

requestAnimationFrame(
    function () {
        moveReadItemSlider();
    }
);






/* ==================================================
   AI PICKS
================================================== */

const aiPicksBooks =
    document.querySelector("#aiPicksBooks");

const AI_PICK_BADGES = [
    "종합추천",
    "작가 Pick",
    "내 맘대로 Pick",
    "소울메이트 Pick"
];

function createAIPickCard(book, index) {

    return `

        <article class="ai-pick-card">

            <a href="#">

                <div class="ai-pick-cover">

                    <img
                        src="${escapeHTML(book.thumbnail)}"
                        alt="${escapeHTML(book.title)}"
                    >

                </div>

                <span class="ai-pick-badge badge-${index}">
                    ${AI_PICK_BADGES[index]}
                </span>

                <h3 class="ai-pick-title">
                    ${escapeHTML(book.title)}
                </h3>

            </a>

        </article>

    `;

}

export async function loadAIPicks() {

    const books =
        await collectUniqueBooks(
            [
                "인문",
                "문학",
                "에세이",
                "과학",
                "소설"
            ],
            4
        );

    if (books.length < 4) {
        throw new Error("AI 추천 도서가 부족합니다.");
    }

    aiPicksBooks.innerHTML =
        books
            .slice(0, 4)
            .map(createAIPickCard)
            .join("");

}






/* ==================================================
   BEST
================================================== */

const bestBooks =
    document.querySelector("#bestBooks");

const BEST_CHANGE = [
    { type: "same", text: "" },
    { type: "same", text: "" },
    { type: "up", text: "▲ 771 급상승" },
    { type: "down", text: "▼ 1" },
    { type: "up", text: "▲ 52 급상승" },
    { type: "down", text: "▼ 1" },
    { type: "down", text: "▼ 3" },
    { type: "up", text: "▲ 1" },
    { type: "up", text: "▲ 2" },
    { type: "up", text: "▲ 7" }
];

function createBestCard(book, index) {

    const rank =
        index + 1;

    const change =
        BEST_CHANGE[index] || {
            type: "same",
            text: ""
        };

    const rankHTML =
        rank === 1
        ? `
            <img
                src="./img/icon/kyo_best.png"
                alt="교보문고 Best 1"
                class="best-first-badge"
            >
        `
        : `
            <span class="best-rank">
                ${rank}
            </span>
        `;

    return `

        <article class="best-card">

            <a href="#">

                <div class="best-cover">

                    <img
                        src="${escapeHTML(book.thumbnail)}"
                        alt="${escapeHTML(book.title)}"
                    >

                </div>

                <div class="best-meta">

                    ${rankHTML}

                    ${
                        change.text
                            ? `
                                <span class="best-change ${change.type}">
                                    ${change.text}
                                </span>
                            `
                            : ""
                    }

                </div>

                <h3 class="best-book-title">
                    ${escapeHTML(book.title)}
                </h3>

            </a>

        </article>

    `;

}

/* ==================================================
   BEST 빠른 로딩
================================================== */

export async function loadBestBooks() {

    /*
        이전 버전처럼 이미지를 하나씩 사전 검사하지 않고,
        API 응답을 받는 즉시 10권을 화면에 표시한다.

        - 표지 이미지가 있는 책만 사용
        - 제목이 있는 책만 사용
        - 문제집 / 선정적 콘텐츠 제외
        - 제목 + ISBN 중복 제거
        - 검색어를 넉넉히 사용해서 10권 확보
    */

    const bestQueries = [
        "소설",
        "문학",
        "에세이",
        "인문",
        "과학",
        "철학",
        "경제경영",
        "역사",
        "사회",
        "예술",
        "심리",
        "자기계발"
    ];

    const result = [];
    const titleSet = new Set();
    const isbnSet = new Set();

    for (const query of bestQueries) {

        if (result.length >= 10) {
            break;
        }

        /*
            한 검색어당 1~2페이지만 확인해서
            오래 기다리지 않도록 제한
        */
        for (let page = 1; page <= 2; page++) {

            if (result.length >= 10) {
                break;
            }

            const data =
                await fetchKakaoBooks(
                    query,
                    30,
                    "accuracy",
                    page
                );

            for (const book of data.documents) {

                if (result.length >= 10) {
                    break;
                }

                /*
                    이미지 또는 도서명 없으면 제외
                */
                if (
                    !book.thumbnail ||
                    !book.title ||
                    !book.title.trim()
                ) {
                    continue;
                }

                /*
                    기존 문제집 / 선정적 도서 필터 유지
                */
                if (isExcluded(book)) {
                    continue;
                }

                const cleanTitle =
                    book.title
                        .replace(/\s+/g, "")
                        .replace(/[^가-힣a-zA-Z0-9]/g, "")
                        .toLowerCase();

                const isbn =
                    getISBN(book);

                if (
                    !cleanTitle ||
                    titleSet.has(cleanTitle)
                ) {
                    continue;
                }

                if (
                    isbn &&
                    isbnSet.has(isbn)
                ) {
                    continue;
                }

                titleSet.add(cleanTitle);

                if (isbn) {
                    isbnSet.add(isbn);
                }

                result.push(book);
            }

            if (
                data.meta &&
                data.meta.is_end
            ) {
                break;
            }
        }
    }

    /*
        10권이 모두 모였으면 바로 렌더링
    */
    if (result.length > 0) {

        bestBooks.innerHTML =
            result
                .slice(0, 10)
                .map(createBestCard)
                .join("");

    } else {

        bestBooks.innerHTML = `
            <div class="best-loading">
                베스트 도서를 불러오지 못했습니다.
                API 키를 확인해주세요.
            </div>
        `;

    }

}





/* ==================================================
   교보문고에서만 만날 수 있어요
   - 7개 로컬 이미지
   - 화면에는 6개
   - 버튼 클릭 시 1개씩 이동
   - 마지막 상품이 보이면 정지
================================================== */

const kyoboOnlyTrack =
    document.querySelector("#kyoboOnlyTrack");

const kyoboOnlyPrev =
    document.querySelector("#kyoboOnlyPrev");

const kyoboOnlyNext =
    document.querySelector("#kyoboOnlyNext");

const kyoboOnlyRandomBanner =
    document.querySelector("#kyoboOnlyRandomBanner");


const kyoboOnlyItems = [

    {
        image: "./img/speech/01.jpg",
        name: "시네마틱 클래스 - 씨네뮤지엄: 프라도 미술관"
    },

    {
        image: "./img/speech/02.jpg",
        name: "친절한 스포츠 - F1, 이름만 들어본 당신을 위한 90분"
    },

    {
        image: "./img/speech/03.jpg",
        name: "2026 명강의Big10 - 송길영"
    },

    {
        image: "./img/speech/04.jpg",
        name: "[단품] 친절한 철학 - 인간을 이해하는 철학"
    },

    {
        image: "./img/speech/05.jpg",
        name: "[읽고 쓰는 사람들] 강원국의 책쓰기 수업 2기 - 모두가 작가가 되는 시간"
    },

    {
        image: "./img/speech/06.jpg",
        name: "시네마틱 클래스 - 씨네뮤지엄: 바티칸 박물관"
    },

    {
        image: "./img/speech/07.jpg",
        name: "[단품] 친절한 에디터-한국에서 만나는 현대미술거장..."
    }

];


let kyoboOnlyIndex = 0;
let kyoboOnlyAnimating = false;


function createKyoboOnlyCard(item) {

    return `

        <article class="kyobo-only-card">

            <a href="#">

                <div class="kyobo-only-image">

                    <img
                        src="${item.image}"
                        alt="${item.name}"
                    >

                </div>

                <h3 class="kyobo-only-name">
                    ${item.name}
                </h3>

            </a>

        </article>

    `;

}


function renderKyoboOnlyItems() {

    kyoboOnlyTrack.innerHTML =
        kyoboOnlyItems
            .map(createKyoboOnlyCard)
            .join("");

}


function getKyoboOnlyMoveDistance() {

    const card =
        kyoboOnlyTrack.querySelector(
            ".kyobo-only-card"
        );

    if (!card) {
        return 0;
    }

    const gap =
        parseFloat(
            getComputedStyle(
                kyoboOnlyTrack
            ).gap
        ) || 0;

    return (
        card.getBoundingClientRect().width
        +
        gap
    );

}


function getKyoboOnlyVisibleCount() {

    const slider =
        document.querySelector(
            ".kyobo-only-slider"
        );

    const card =
        kyoboOnlyTrack.querySelector(
            ".kyobo-only-card"
        );

    if (!slider || !card) {
        return 6;
    }

    const gap =
        parseFloat(
            getComputedStyle(
                kyoboOnlyTrack
            ).gap
        ) || 0;

    const cardWidth =
        card.getBoundingClientRect().width;

    const sliderWidth =
        slider.getBoundingClientRect().width;

    return Math.max(
        1,
        Math.floor(
            (sliderWidth + gap)
            /
            (cardWidth + gap)
        )
    );

}


function getKyoboOnlyMaxIndex() {

    return Math.max(
        0,
        kyoboOnlyItems.length
        -
        getKyoboOnlyVisibleCount()
    );

}


function updateKyoboOnlyButtons() {

    const maxIndex =
        getKyoboOnlyMaxIndex();

    kyoboOnlyPrev.classList.toggle(
        "disabled",
        kyoboOnlyIndex <= 0
    );

    kyoboOnlyNext.classList.toggle(
        "disabled",
        kyoboOnlyIndex >= maxIndex
    );

    kyoboOnlyPrev.setAttribute(
        "aria-disabled",
        kyoboOnlyIndex <= 0 ? "true" : "false"
    );

    kyoboOnlyNext.setAttribute(
        "aria-disabled",
        kyoboOnlyIndex >= maxIndex ? "true" : "false"
    );

}


export function moveKyoboOnlySlider() {

    const distance =
        getKyoboOnlyMoveDistance();

    kyoboOnlyTrack.style.transform =
        `translateX(-${kyoboOnlyIndex * distance}px)`;

    updateKyoboOnlyButtons();

}


function kyoboOnlyNextSlide() {

    if (kyoboOnlyAnimating) {
        return;
    }

    const maxIndex =
        getKyoboOnlyMaxIndex();

    if (
        kyoboOnlyIndex >=
        maxIndex
    ) {

        updateKyoboOnlyButtons();
        return;

    }

    kyoboOnlyAnimating = true;

    kyoboOnlyIndex++;

    moveKyoboOnlySlider();

    setTimeout(
        function () {

            kyoboOnlyAnimating =
                false;

        },
        500
    );

}


function kyoboOnlyPrevSlide() {

    if (kyoboOnlyAnimating) {
        return;
    }

    if (
        kyoboOnlyIndex <= 0
    ) {

        updateKyoboOnlyButtons();
        return;

    }

    kyoboOnlyAnimating = true;

    kyoboOnlyIndex--;

    moveKyoboOnlySlider();

    setTimeout(
        function () {

            kyoboOnlyAnimating =
                false;

        },
        500
    );

}


kyoboOnlyNext.addEventListener(
    "click",
    function (event) {

        event.preventDefault();

        kyoboOnlyNextSlide();

    }
);


kyoboOnlyPrev.addEventListener(
    "click",
    function (event) {

        event.preventDefault();

        kyoboOnlyPrevSlide();

    }
);


renderKyoboOnlyItems();

requestAnimationFrame(
    function () {

        moveKyoboOnlySlider();

    }
);


/* ==================================================
   새로고침할 때 랜덤 배너
================================================== */

const kyoboOnlyBanners = [

    "./img/banner/01.jpg",
    "./img/banner/05.png",
    "./img/banner/06.jpg"

];


function setRandomKyoboOnlyBanner() {

    const randomIndex =
        Math.floor(
            Math.random() *
            kyoboOnlyBanners.length
        );

    kyoboOnlyRandomBanner.src =
        kyoboOnlyBanners[
            randomIndex
        ];

}


setRandomKyoboOnlyBanner();






/* ==================================================
   CASTing / 이벤트 전용 한 단 전체 슬라이드
================================================== */

function setupWholePageSlider(
    track,
    prev,
    next
) {

    let page = 0;

    function update() {

        /*
            한 페이지가 track 너비의 100%이므로
            0% -> -100%로 정확히 한 단 전체 이동
        */
        track.style.transform =
            `translateX(-${page * 100}%)`;

        prev.classList.toggle(
            "disabled",
            page === 0
        );

        next.classList.toggle(
            "disabled",
            page === 1
        );

        prev.setAttribute(
            "aria-disabled",
            page === 0 ? "true" : "false"
        );

        next.setAttribute(
            "aria-disabled",
            page === 1 ? "true" : "false"
        );
    }


    prev.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            if (page <= 0) {
                return;
            }

            page = 0;
            update();

        }
    );


    next.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            if (page >= 1) {
                return;
            }

            page = 1;
            update();

        }
    );


    update();

}


/* ==================================================
   CASTing
   10개 = 5개씩 2단
================================================== */

const castingItems = [

    /* 1단 : 01 ~ 05 */

    {
        image: "./img/casting/01.jpg",
        name: "하지정 성우와 같이 읽을까요? 오늘부터 1권!"
    },

    {
        image: "./img/casting/02.jpg",
        name: "국립중앙박물관 큐레이터가 말해주는 관람 꿀팁과 꼭 봐야 할 이야기"
    },

    {
        image: "./img/casting/03.jpg",
        name: "다른 과학에 대한 가능성 「STS 개념어 사전」 홍성욱"
    },

    {
        image: "./img/casting/04.jpg",
        name: "오컬트의 신, 오컬트의 권위자, 오컬트의 지배자! 이유혁 작가와 함께"
    },

    {
        image: "./img/casting/05.jpg",
        name: "타인의 일상을 가장 아름답게 기록하는 방법"
    },


    /* 2단 : 06 ~ 10 */

    {
        image: "./img/casting/06.jpg",
        name: "배신한 연인의 그림을 목숨 걸고 지킨 화가: 칸딘스키와 가브리엘"
    },

    {
        image: "./img/casting/07.jpg",
        name: "『제인 에어』 세상이 끝내 길들이지 못한 한 인간의 고백"
    },

    {
        image: "./img/casting/08.jpg",
        name: "AI를 쓰는 동안 나는 어떤 사람이 되어가고 있는가 『사고외주』"
    },

    {
        image: "./img/casting/09.jpg",
        name: "『조선범죄실록』 정명섭 “범죄기록은 백성들의 삶을 가장 가까이 보여준다”"
    },

    {
        image: "./img/casting/10.jpg",
        name: "하브루타 질문으로 다시 읽는 전래동화 『스토리로 배우는 인문학』"
    }

];


const castingTrack =
    document.querySelector("#castingTrack");

const castingPage1 =
    document.querySelector("#castingPage1");

const castingPage2 =
    document.querySelector("#castingPage2");

const castingPrev =
    document.querySelector("#castingPrev");

const castingNext =
    document.querySelector("#castingNext");


function createCastingCard(item) {

    return `

        <article class="casting-card">

            <a href="#">

                <div class="casting-image">

                    <img
                        src="${item.image}"
                        alt="${item.name}"
                        loading="lazy"
                    >

                </div>

                <h3 class="casting-name">
                    ${item.name}
                </h3>

            </a>

        </article>

    `;

}


castingPage1.innerHTML =
    castingItems
        .slice(0, 5)
        .map(createCastingCard)
        .join("");


castingPage2.innerHTML =
    castingItems
        .slice(5, 10)
        .map(createCastingCard)
        .join("");


setupWholePageSlider(
    castingTrack,
    castingPrev,
    castingNext
);





/* ==================================================
   이벤트 배너
   6개 = 3개씩 2단
================================================== */

const eventFeatureItems = [

    "./img/event_banner/01.jpg",
    "./img/event_banner/02.jpg",
    "./img/event_banner/03.jpg",
    "./img/event_banner/04.jpg",
    "./img/event_banner/05.jpg",
    "./img/event_banner/06.jpg"

];


const eventFeatureTrack =
    document.querySelector("#eventFeatureTrack");

const eventFeaturePage1 =
    document.querySelector("#eventFeaturePage1");

const eventFeaturePage2 =
    document.querySelector("#eventFeaturePage2");

const eventFeaturePrev =
    document.querySelector("#eventFeaturePrev");

const eventFeatureNext =
    document.querySelector("#eventFeatureNext");


function createEventFeatureCard(image, index) {

    return `

        <article class="event-feature-card">

            <a href="#">

                <div class="event-feature-image">

                    <img
                        src="${image}"
                        alt="이벤트 배너 ${index + 1}"
                        loading="lazy"
                    >

                </div>

            </a>

        </article>

    `;

}


eventFeaturePage1.innerHTML =
    eventFeatureItems
        .slice(0, 3)
        .map(
            function (image, index) {

                return createEventFeatureCard(
                    image,
                    index
                );

            }
        )
        .join("");


eventFeaturePage2.innerHTML =
    eventFeatureItems
        .slice(3, 6)
        .map(
            function (image, index) {

                return createEventFeatureCard(
                    image,
                    index + 3
                );

            }
        )
        .join("");


setupWholePageSlider(
    eventFeatureTrack,
    eventFeaturePrev,
    eventFeatureNext
);
