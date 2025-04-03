type JosaPair =
  | ["으로", "로"]
  | ["은", "는"]
  | ["이", "가"]
  | ["을", "를"]
  | ["과", "와"]
  | ["이", ""];
/**
 * 단어에 적절한 한국어 조사를 자동으로 붙여주는 함수입니다.
 *
 * 예를 들어, `"사과"`에는 `"로"`를, `"학교"`에는 `"으로"`를 붙이는 방식으로
 * 종성(받침)의 유무에 따라 조사를 올바르게 선택합니다.
 *
 * @param word - 조사를 붙일 기준 단어
 * @param pair - 종성이 있을 경우와 없을 경우 사용할 조사 쌍. 예: ["으로", "로"], ["은", "는"]
 * @returns 입력 단어에 적절한 조사를 붙인 문자열
 *
 * @example
 * withJosa("사과", ["으로", "로"]); // "사과로"
 * withJosa("학교", ["으로", "로"]); // "학교로"
 * withJosa("고양이", ["은", "는"]); // "고양이는"
 */
export function withJosa(word: string, pair: JosaPair) {
  const lastChar = word[word.length - 1];
  const code = lastChar.charCodeAt(0) - 44032;
  const hasFinalConsonant = code % 28 !== 0;
  return word + (hasFinalConsonant ? pair[0] : pair[1]);
}
