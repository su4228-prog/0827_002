/* ==================================================
   INIT (main.js 역할)
   - 각 기능별 JS 파일에서 export한 함수를 import하여
     한 곳에서 실행하는 메인 JavaScript 파일
   - 페이지 로드 시 콘텐츠 섹션들을 실행(START)
   - 창 크기 변경 시 슬라이더/헤더 재계산(RESIZE)
   ※ 반드시 다른 모든 js 파일 다음, 맨 마지막에 로드
================================================== */

import {
    loadChoice,
    loadMD,
    loadPublisherBooks,
    loadTrendBooks,
    loadAIPicks,
    loadBestBooks,
    moveKyoboOnlySlider,
    clampReadItemIndex
} from "./sections.js";

import {
    updateMainSlider,
    updateMini,
    recalcStickyStart
} from "./layout.js";

/* ==================================================
   START
================================================== */

async function startBookSections() {

    try {

        await Promise.all([

            loadChoice(),

            loadMD(),

            loadPublisherBooks(),

            loadTrendBooks(),

            loadAIPicks(),

            loadBestBooks()

        ]);

    }

    catch (
        error
    ) {

        console.error(
            "도서 API 오류:",
            error
        );

    }

}


startBookSections();





/* ==================================================
   RESIZE
================================================== */

window.addEventListener(
    "resize",
    function () {

        recalcStickyStart();


        updateMainSlider();

        updateMini();

        moveKyoboOnlySlider();

    }
);


    

window.addEventListener(
    "resize",
    function () {
        clampReadItemIndex();
    }
);
