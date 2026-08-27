/* ==================================================
   BOOK COMPONENTS
   - 여러 섹션에서 공통으로 쓰는 책 카드 생성 함수
   - 중복 없는 책 목록 수집기, 2단 슬라이더 틀
   ※ sections.js 안의 함수들이 이 파일을 사용하므로 먼저 로드
================================================== */

import {
    fetchKakaoBooks,
    isExcluded,
    getISBN,
    escapeHTML,
    getAuthor
} from "./core.js";


/* ==================================================
   UNIQUE BOOK COLLECTOR
================================================== */

export async function collectUniqueBooks(
    queries,
    count,
    sort = "accuracy"
) {

    const result =
        [];


    const titleSet =
        new Set();


    const isbnSet =
        new Set();


    for (
        const query
        of
        queries
    ) {

        for (
            let page = 1;
            page <= 3;
            page++
        ) {

            if (
                result.length >=
                count
            ) {

                return result;

            }


            const data =
                await fetchKakaoBooks(

                    query,

                    30,

                    sort,

                    page

                );


            for (
                const book
                of
                data.documents
            ) {

                if (
                    result.length >=
                    count
                ) {

                    return result;

                }


                if (
                    !book.thumbnail ||
                    !book.title
                ) {

                    continue;

                }


                if (
                    isExcluded(
                        book
                    )
                ) {

                    continue;

                }


                const cleanTitle =
                    book.title

                        .replace(
                            /\s+/g,
                            ""
                        )

                        .replace(
                            /[^가-힣a-zA-Z0-9]/g,
                            ""
                        )

                        .toLowerCase();


                const isbn =
                    getISBN(
                        book
                    );


                if (
                    titleSet.has(
                        cleanTitle
                    )
                ) {

                    continue;

                }


                if (
                    isbn &&
                    isbnSet.has(
                        isbn
                    )
                ) {

                    continue;

                }


                titleSet.add(
                    cleanTitle
                );


                if (
                    isbn
                ) {

                    isbnSet.add(
                        isbn
                    );

                }


                result.push(
                    book
                );

            }


            if (
                data.meta &&
                data.meta.is_end
            ) {

                break;

            }

        }

    }


    return result;

}





/* ==================================================
   STANDARD BOOK HTML
================================================== */

export function createStandardBook(
    book
) {

    return `

        <article class="standard-book">

            <a href="#">

                <div class="standard-cover">

                    <img
                        src="${escapeHTML(
                            book.thumbnail
                        )}"
                        alt="${escapeHTML(
                            book.title
                        )}"
                    >

                </div>


                <h3 class="standard-title">

                    ${escapeHTML(
                        book.title
                    )}

                </h3>


                <p class="standard-author">

                    ${escapeHTML(
                        getAuthor(
                            book
                        )
                    )}

                </p>

            </a>

        </article>

    `;

}





/* ==================================================
   GENERIC 2 PAGE SLIDER
================================================== */

export function setupTwoPageSlider(
    track,
    prev,
    next
) {

    let page =
        0;


    function go(
        newPage
    ) {

        if (
            newPage < 0 ||
            newPage > 1
        ) {

            return;

        }


        page =
            newPage;


        track.style.transform =
            `translateX(-${page * 50}%)`;


        prev.classList.toggle(
            "disabled",
            page === 0
        );


        next.classList.toggle(
            "disabled",
            page === 1
        );

    }


    prev.addEventListener(
        "click",
        function () {

            go(
                page - 1
            );

        }
    );


    next.addEventListener(
        "click",
        function () {

            go(
                page + 1
            );

        }
    );


    go(0);

}
