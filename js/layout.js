/* ==================================================
   LAYOUT
   - 스크롤 시 고정되는 헤더
   - 메인 비주얼 슬라이더, 미니 슬라이더
   ※ core.js 다음, book-components.js보다 먼저 로드
================================================== */

/* ==================================================
   STICKY HEADER
================================================== */

const headerTop =
    document.querySelector(
        "#headerTop"
    );

const headerStickyShell =
    document.querySelector(
        "#headerStickyShell"
    );


let stickyStart =
    headerStickyShell.offsetTop;


function checkStickyHeader() {

    headerTop.classList.toggle(

        "fixed",

        window.scrollY >=
        stickyStart

    );

}


window.addEventListener(
    "scroll",
    checkStickyHeader
);


/*
    창 크기 변경 시 헤더 고정 시작 위치를 다시 계산.
    - 예전엔 init.js가 stickyStart를 직접 재할당했지만,
      모듈 방식에서는 외부에서 값을 재할당할 수 없어
      이 함수를 통해서만 갱신하도록 함
*/
export function recalcStickyStart() {

    stickyStart =
        headerStickyShell.offsetTop;

}





/* ==================================================
   MAIN SLIDER
================================================== */

const mainSlider =
    document.querySelector(
        "#mainSlider"
    );

const mainSliderTrack =
    document.querySelector(
        "#mainSliderTrack"
    );

const slideNumber =
    document.querySelector(
        "#slideNumber"
    );

const pauseBtn =
    document.querySelector(
        "#pauseBtn"
    );

const prevBtn =
    document.querySelector(
        "#prevBtn"
    );

const nextBtn =
    document.querySelector(
        "#nextBtn"
    );


const mainSlideImages = [

    "01.jpg",
    "02.jpg",
    "03.jpg",
    "04.jpg",
    "05.jpg",
    "06.jpg",
    "07.jpg",
    "08.jpg",
    "09.jpg",
    "10.jpg",

    "11.jpg",
    "12.jpg",
    "13.jpg",
    "14.jpg",
    "15.jpg",
    "16.jpg",
    "17.jpg",
    "18.jpg",
    "19.jpg",
    "20.jpg",

    "21.jpg",
    "22.jpg",
    "23.jpg",
    "24.png",
    "25.jpg",
    "26.png",
    "27.jpg",
    "28.png",
    "29.jpg"

];


let currentSlide =
    7;

let mainPlaying =
    true;

let mainTimer =
    null;


mainSlideImages.forEach(

    function (
        file,
        index
    ) {

        const slide =
            document.createElement(
                "div"
            );


        slide.className =
            "main-slide";


        slide.innerHTML = `

            <a href="#">

                <img
                    src="./img/main_slider/${file}"
                    alt="메인 배너 ${index + 1}"
                    draggable="false"
                >

            </a>

        `;


        mainSliderTrack.appendChild(
            slide
        );

    }

);


export function updateMainSlider() {

    const width =
        mainSlider.offsetWidth;


    mainSliderTrack.style.transform =
        `translateX(-${currentSlide * width}px)`;


    slideNumber.textContent =
        String(
            currentSlide + 1
        ).padStart(2, "0")
        +
        " - "
        +
        String(
            mainSlideImages.length
        ).padStart(2, "0");

}


function mainNext() {

    currentSlide =
        (
            currentSlide + 1
        )
        %
        mainSlideImages.length;


    updateMainSlider();

}


function mainPrev() {

    currentSlide =
        (
            currentSlide -
            1 +
            mainSlideImages.length
        )
        %
        mainSlideImages.length;


    updateMainSlider();

}


function startMainAuto() {

    clearInterval(
        mainTimer
    );


    mainTimer =
        setInterval(
            mainNext,
            3000
        );

}


function stopMainAuto() {

    clearInterval(
        mainTimer
    );

}


nextBtn.addEventListener(
    "click",
    function (
        event
    ) {

        event.stopPropagation();


        mainNext();


        if (
            mainPlaying
        ) {

            startMainAuto();

        }

    }
);


prevBtn.addEventListener(
    "click",
    function (
        event
    ) {

        event.stopPropagation();


        mainPrev();


        if (
            mainPlaying
        ) {

            startMainAuto();

        }

    }
);


pauseBtn.addEventListener(
    "click",
    function (
        event
    ) {

        event.stopPropagation();


        if (
            mainPlaying
        ) {

            stopMainAuto();

            pauseBtn.textContent =
                "▶";

            mainPlaying =
                false;

        }

        else {

            startMainAuto();

            pauseBtn.textContent =
                "Ⅱ";

            mainPlaying =
                true;

        }

    }
);


/* ==================================================
   ★ MAIN DRAG 복구
================================================== */

let mainDragging =
    false;

let mainStartX =
    0;

let mainStartTranslate =
    0;

let mainDragDistance =
    0;

let mainWasDragged =
    false;


function startMainDrag(
    clientX
) {

    mainDragging =
        true;

    mainWasDragged =
        false;

    mainStartX =
        clientX;

    mainDragDistance =
        0;


    mainStartTranslate =
        -(
            currentSlide *
            mainSlider.offsetWidth
        );


    mainSlider.classList.add(
        "dragging"
    );


    if (
        mainPlaying
    ) {

        stopMainAuto();

    }

}


function moveMainDrag(
    clientX
) {

    if (
        !mainDragging
    ) {

        return;

    }


    mainDragDistance =
        clientX -
        mainStartX;


    if (
        Math.abs(
            mainDragDistance
        ) > 5
    ) {

        mainWasDragged =
            true;

    }


    let move =
        mainStartTranslate +
        mainDragDistance;


    /*
        첫 번째 / 마지막에서
        너무 과하게 빠져나가지 않게
    */

    if (
        currentSlide === 0 &&
        mainDragDistance > 0
    ) {

        move =
            mainStartTranslate +
            mainDragDistance *
            .25;

    }


    if (
        currentSlide ===
            mainSlideImages.length - 1
        &&
        mainDragDistance < 0
    ) {

        move =
            mainStartTranslate +
            mainDragDistance *
            .25;

    }


    mainSliderTrack.style.transform =
        `translateX(${move}px)`;

}


function endMainDrag() {

    if (
        !mainDragging
    ) {

        return;

    }


    const threshold =
        mainSlider.offsetWidth *
        .15;


    if (
        mainDragDistance <
            -threshold
    ) {

        mainNext();

    }

    else if (
        mainDragDistance >
            threshold
    ) {

        mainPrev();

    }

    else {

        updateMainSlider();

    }


    mainDragging =
        false;


    mainSlider.classList.remove(
        "dragging"
    );


    if (
        mainPlaying
    ) {

        startMainAuto();

    }

}


mainSlider.addEventListener(
    "mousedown",
    function (
        event
    ) {

        if (
            event.target.closest(
                ".slider-control"
            )
        ) {

            return;

        }


        event.preventDefault();


        startMainDrag(
            event.clientX
        );

    }
);


window.addEventListener(
    "mousemove",
    function (
        event
    ) {

        moveMainDrag(
            event.clientX
        );

    }
);


window.addEventListener(
    "mouseup",
    endMainDrag
);


mainSlider.addEventListener(
    "touchstart",
    function (
        event
    ) {

        if (
            event.target.closest(
                ".slider-control"
            )
        ) {

            return;

        }


        startMainDrag(
            event.touches[0].clientX
        );

    },

    {
        passive: true
    }
);


mainSlider.addEventListener(
    "touchmove",
    function (
        event
    ) {

        moveMainDrag(
            event.touches[0].clientX
        );

    },

    {
        passive: true
    }
);


mainSlider.addEventListener(
    "touchend",
    endMainDrag
);


mainSlider.addEventListener(
    "click",
    function (
        event
    ) {

        if (
            mainWasDragged
        ) {

            event.preventDefault();

            mainWasDragged =
                false;

        }

    }
);


updateMainSlider();

startMainAuto();





/* ==================================================
   MINI SLIDER
================================================== */

const miniSlider =
    document.querySelector(
        "#miniSlider"
    );

const miniImageTrack =
    document.querySelector(
        "#miniImageTrack"
    );

const miniDots =
    document.querySelector(
        "#miniDots"
    );

const miniTitle =
    document.querySelector(
        "#miniTitle"
    );

const miniPrice =
    document.querySelector(
        "#miniPrice"
    );


const miniSlides = [

    {
        image:
            "./img/mini_slider/01.jpg",

        title:
            "도시 인문학 수업",

        price:
            "오늘만 특별 혜택"
    },

    {
        image:
            "./img/mini_slider/02.jpg",

        title:
            "글램팜 미들고데기 화이트",

        price:
            "134,830원+사은품"
    },

    {
        image:
            "./img/mini_slider/03.jpg",

        title:
            "데스크 라이프 특별전",

        price:
            "오늘만 특가"
    },

    {
        image:
            "./img/mini_slider/04.jpg",

        title:
            "감성 문구 특별전",

        price:
            "교보문고 단독 혜택"
    },

    {
        image:
            "./img/mini_slider/05.jpg",

        title:
            "화제의 신간",

        price:
            "오늘의 추천 도서"
    }

];


let miniIndex =
    1;


miniSlides.forEach(

    function (
        item,
        index
    ) {

        const slide =
            document.createElement(
                "div"
            );


        slide.className =
            "mini-slide-image";


        slide.innerHTML = `

            <a href="#">

                <img
                    src="${item.image}"
                    alt="${item.title}"
                    draggable="false"
                >

            </a>

        `;


        miniImageTrack.appendChild(
            slide
        );


        const dot =
            document.createElement(
                "span"
            );


        dot.className =
            "mini-dot";


        if (
            index ===
            miniIndex
        ) {

            dot.classList.add(
                "active"
            );

        }


        dot.addEventListener(
            "click",
            function (
                event
            ) {

                event.stopPropagation();


                miniIndex =
                    index;


                updateMini();

            }
        );


        miniDots.appendChild(
            dot
        );

    }

);


export function updateMini() {

    miniImageTrack.style.transform =
        `translateX(-${miniIndex * miniSlider.offsetWidth}px)`;


    miniTitle.textContent =
        miniSlides[
            miniIndex
        ].title;


    miniPrice.textContent =
        miniSlides[
            miniIndex
        ].price;


    document
        .querySelectorAll(
            ".mini-dot"
        )
        .forEach(

            function (
                dot,
                index
            ) {

                dot.classList.toggle(

                    "active",

                    index ===
                    miniIndex

                );

            }

        );

}


/* ==================================================
   ★ MINI DRAG 복구
================================================== */

let miniDragging =
    false;

let miniStartX =
    0;

let miniStartTranslate =
    0;

let miniDragDistance =
    0;

let miniWasDragged =
    false;


function startMiniDrag(
    clientX
) {

    miniDragging =
        true;

    miniWasDragged =
        false;

    miniStartX =
        clientX;

    miniDragDistance =
        0;


    miniStartTranslate =
        -(
            miniIndex *
            miniSlider.offsetWidth
        );


    miniSlider.classList.add(
        "dragging"
    );

}


function moveMiniDrag(
    clientX
) {

    if (
        !miniDragging
    ) {

        return;

    }


    miniDragDistance =
        clientX -
        miniStartX;


    if (
        Math.abs(
            miniDragDistance
        ) > 5
    ) {

        miniWasDragged =
            true;

    }


    let move =
        miniStartTranslate +
        miniDragDistance;


    if (
        miniIndex === 0 &&
        miniDragDistance > 0
    ) {

        move =
            miniStartTranslate +
            miniDragDistance *
            .25;

    }


    if (
        miniIndex ===
            miniSlides.length - 1
        &&
        miniDragDistance < 0
    ) {

        move =
            miniStartTranslate +
            miniDragDistance *
            .25;

    }


    miniImageTrack.style.transform =
        `translateX(${move}px)`;

}


function endMiniDrag() {

    if (
        !miniDragging
    ) {

        return;

    }


    const threshold =
        miniSlider.offsetWidth *
        .16;


    if (
        miniDragDistance <
            -threshold
        &&
        miniIndex <
            miniSlides.length - 1
    ) {

        miniIndex++;

    }

    else if (
        miniDragDistance >
            threshold
        &&
        miniIndex > 0
    ) {

        miniIndex--;

    }


    miniDragging =
        false;


    miniSlider.classList.remove(
        "dragging"
    );


    updateMini();

}


miniSlider.addEventListener(
    "mousedown",
    function (
        event
    ) {

        if (
            event.target.classList.contains(
                "mini-dot"
            )
        ) {

            return;

        }


        event.preventDefault();


        startMiniDrag(
            event.clientX
        );

    }
);


window.addEventListener(
    "mousemove",
    function (
        event
    ) {

        moveMiniDrag(
            event.clientX
        );

    }
);


window.addEventListener(
    "mouseup",
    endMiniDrag
);


miniSlider.addEventListener(
    "touchstart",
    function (
        event
    ) {

        startMiniDrag(
            event.touches[0].clientX
        );

    },

    {
        passive: true
    }
);


miniSlider.addEventListener(
    "touchmove",
    function (
        event
    ) {

        moveMiniDrag(
            event.touches[0].clientX
        );

    },

    {
        passive: true
    }
);


miniSlider.addEventListener(
    "touchend",
    endMiniDrag
);


miniSlider.addEventListener(
    "click",
    function (
        event
    ) {

        if (
            miniWasDragged
        ) {

            event.preventDefault();

            miniWasDragged =
                false;

        }

    }
);


updateMini();
