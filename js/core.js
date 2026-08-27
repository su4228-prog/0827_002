/* ==================================================
   CORE
   - 카카오 도서 API 키/호출
   - 공통 헬퍼(이스케이프, 저자/설명/ISBN 추출)
   - 검색 결과 필터(제외 키워드)
   ※ 다른 모든 js 파일보다 먼저 로드되어야 함
================================================== */

/* ==================================================
   KAKAO API KEY
================================================== */

const KAKAO_REST_API_KEY =
    "KakaoAK bf7054bf05a129268000771257df9708";




/* ==================================================
   KAKAO API
================================================== */

export async function fetchKakaoBooks(
    query,
    size = 30,
    sort = "accuracy",
    page = 1
) {

    const params =
        new URLSearchParams({

            query:
                query,

            size:
                size,

            sort:
                sort,

            page:
                page

        });


    const response =
        await fetch(

            "https://dapi.kakao.com/v3/search/book?" +
            params,

            {

                method:
                    "GET",

                headers: {

                    Authorization:
                        KAKAO_REST_API_KEY

                }

            }

        );


    if (
        !response.ok
    ) {

        throw new Error(
            "HTTP 오류: " +
            response.status
        );

    }


    return response.json();

}





/* ==================================================
   HELPERS
================================================== */

export function escapeHTML(
    value
) {

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


export function getAuthor(
    book
) {

    if (
        !book.authors ||
        book.authors.length === 0
    ) {

        return "저자 정보 없음";

    }


    return book.authors.join(
        ", "
    );

}


export function getDescription(
    book
) {

    let text =
        book.contents ||
        "도서에 대한 상세 소개를 확인해보세요.";


    if (
        text.length >
        115
    ) {

        text =
            text.substring(
                0,
                115
            )
            +
            "...";

    }


    return text;

}


export function getISBN(
    book
) {

    if (
        !book.isbn
    ) {

        return "";

    }


    const list =
        book.isbn

            .split(" ")

            .filter(
                Boolean
            );


    return (

        list[
            list.length - 1
        ]
        ||
        ""

    );

}





/* ==================================================
   FILTER
================================================== */

const STUDY_EXCLUDE_WORDS = [

    "문제집",
    "기출",
    "기출문제",
    "모의고사",
    "수능",
    "n제",
    "교재",
    "자습서",
    "평가문제집",
    "학습지",
    "수험서",
    "해설집",
    "워크북",
    "완자",
    "개념원리",
    "내신",
    "중간고사",
    "기말고사",
    "ebs",
    "토익",
    "공무원",
    "자격증"

];


const RESTRICTED_WORDS_B64 =
    "WyIxOeq4iCIsIjE57IS4Iiwi7ISx7J2466y8Iiwi7ISx7J2466eM7ZmUIiwi7ISx7J247IaM7ISkIiwi7JW87ISkIiwi7JeQ66GcIiwi7JeQ66Gc7YuxIiwi6rSA64qlIiwi7Y+s66W064W4IiwicG9ybiIsImVyb3RpYyIsIuyEueyKpCIsIuyEseyVoCIsIuyEseyggSDtjJDtg4Dsp4AiLCLshLHsnbgg66Gc66eo7IqkIl0=";

const RESTRICTED_WORDS =
    JSON.parse(
        atob(
            RESTRICTED_WORDS_B64
        )
    );

const EXCLUDE_WORDS = [
    ...STUDY_EXCLUDE_WORDS,
    ...RESTRICTED_WORDS
];


export function isExcluded(
    book
) {

    const text =
        (

            (book.title || "")
            +
            " "
            +
            (book.contents || "")

        )
        .toLowerCase();


    return EXCLUDE_WORDS.some(

        function (
            word
        ) {

            return text.includes(
                word.toLowerCase()
            );

        }

    );

}
